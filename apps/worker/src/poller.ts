import { createHash, randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';

export interface FetchResult { ok: boolean; status: number; text(): Promise<string>; headers: { get(name: string): string | null } }
export type Fetcher = (url: string, init?: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<FetchResult>;

export async function pollSources(sqlite: Database.Database, fetcher: Fetcher = fetch as Fetcher) {
  const subscriptions = sqlite.prepare('SELECT * FROM source_subscriptions WHERE enabled=1').all() as Array<Record<string, string>>;
  let discovered = 0;
  let unchanged = 0;
  let failed = 0;
  for (const source of subscriptions) {
    const checkedAt = new Date().toISOString();
    try {
      const response = await fetcher(source.url!, { headers: { 'user-agent': 'TechLibrary/0.1 (+source-monitor)' }, signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = normalize(await response.text());
      const fingerprint = createHash('sha256').update(body).digest('hex');
      if (!source.last_fingerprint) {
        sqlite.prepare('UPDATE source_subscriptions SET last_fingerprint=?,last_checked_at=?,last_error=NULL WHERE id=?').run(fingerprint, checkedAt, source.id);
        unchanged++;
        continue;
      }
      if (fingerprint === source.last_fingerprint) {
        sqlite.prepare('UPDATE source_subscriptions SET last_checked_at=?,last_error=NULL WHERE id=?').run(checkedAt, source.id);
        unchanged++;
        continue;
      }
      const title = extractTitle(body) ?? 'Official source changed';
      const findingFingerprint = createHash('sha256').update(`${source.url}:${fingerprint}`).digest('hex');
      sqlite.transaction(() => {
        sqlite.prepare(`INSERT OR IGNORE INTO findings(id,adapter,topic_id,source_url,fingerprint,status,title,summary,raw_metadata,discovered_at) VALUES(?,?,?,?,?,'pending',?,?,?,?)`).run(
          randomUUID(), source.adapter, source.topic_id, source.url, findingFingerprint, title,
          'The normalized content of this official source changed. Review the source and create a revision if the change affects the library entry.',
          JSON.stringify({ contentFingerprint: fingerprint, contentLength: body.length, etag: response.headers.get('etag'), lastModified: response.headers.get('last-modified') }), checkedAt
        );
        sqlite.prepare('UPDATE source_subscriptions SET last_fingerprint=?,last_checked_at=?,last_error=NULL WHERE id=?').run(fingerprint, checkedAt, source.id);
      })();
      discovered++;
    } catch (error) {
      failed++;
      sqlite.prepare('UPDATE source_subscriptions SET last_checked_at=?,last_error=? WHERE id=?').run(checkedAt, error instanceof Error ? error.message : 'Unknown fetch error', source.id);
    }
  }
  return { checked: subscriptions.length, discovered, unchanged, failed };
}

export function normalize(input: string) {
  return input.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/\s+/g, ' ').trim();
}

function extractTitle(input: string) {
  const match = input.match(/<title[^>]*>(.*?)<\/title>/i);
  return match?.[1]?.replace(/<[^>]+>/g, '').trim();
}
