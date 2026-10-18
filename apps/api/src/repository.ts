import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { topicRevisionInputSchema, type Language, type TopicDetail, type TopicListItem, type TopicRevisionInput } from '@tech-library/contracts';

const parse = <T>(value: string): T => JSON.parse(value) as T;

export class LibraryRepository {
  constructor(private readonly db: Database.Database) {}

  listTopics({ q = '', domain, type, page = 1, pageSize = 24, language = 'en', userId }: { q?: string; domain?: string; type?: string; page?: number; pageSize?: number; language?: Language; userId?: string }) {
    const params: unknown[] = [];
    let where = 'WHERE t.active_revision_id IS NOT NULL';
    const localized = "CASE WHEN ?='en' THEN r.payload ELSE COALESCE(tr.payload,r.payload) END";
    if (q) { where += ` AND (${localized} LIKE ? OR t.id IN (SELECT topic_id FROM topic_search WHERE topic_search MATCH ?))`; params.push(language, `%${q}%`, q.replace(/["']/g, '')); }
    if (domain) { where += ` AND json_extract(${localized}, '$.domains') LIKE ?`; params.push(language, `%${domain}%`); }
    if (type) { where += ` AND json_extract(${localized}, '$.type') = ?`; params.push(language, type); }
    const joins = `FROM topics t JOIN revisions r ON r.id = t.active_revision_id LEFT JOIN topic_translations tr ON tr.revision_id=r.id AND tr.language='da'`;
    const total = Number((this.db.prepare(`SELECT count(*) AS count ${joins} ${where}`).get(...params) as { count: number }).count);
    const rows = this.db.prepare(`SELECT t.id, t.slug, ${localized} payload, tr.id translation_id, COALESCE(r.published_at, r.reviewed_at, r.created_at) verified_at, CASE WHEN f.user_id IS NULL THEN 0 ELSE 1 END is_favorite ${joins} LEFT JOIN favorites f ON f.topic_id=t.id AND f.user_id=? ${where} ORDER BY json_extract(${localized}, '$.title') LIMIT ? OFFSET ?`).all(language, userId ?? '', ...params, language, pageSize, (page - 1) * pageSize) as Array<Record<string, string>>;
    return { items: rows.map((row) => toListItem(row, language)), total, page, pageSize };
  }

  getTopic(slug: string, language: Language = 'en', userId?: string): TopicDetail | null {
    const row = this.db.prepare(`SELECT t.id, t.slug, r.id revision_id, r.number, CASE WHEN ?='en' THEN r.payload ELSE COALESCE(tr.payload,r.payload) END payload, tr.id translation_id, CASE WHEN f.user_id IS NULL THEN 0 ELSE 1 END is_favorite, COALESCE(r.published_at, r.reviewed_at, r.created_at) verified_at FROM topics t JOIN revisions r ON r.id = t.active_revision_id LEFT JOIN topic_translations tr ON tr.revision_id=r.id AND tr.language=? LEFT JOIN favorites f ON f.topic_id=t.id AND f.user_id=? WHERE t.slug = ?`).get(language, language, userId ?? '', slug) as Record<string, string | number> | undefined;
    if (!row) return null;
    const item = toListItem(row as Record<string, string>, language);
    const data = parse<TopicRevisionInput>(String(row.payload));
    const sourceRows = this.db.prepare(`SELECT s.* FROM sources s JOIN revision_sources rs ON rs.source_id=s.id WHERE rs.revision_id=? ORDER BY s.verified_at DESC`).all(row.revision_id) as Array<Record<string, string>>;
    const relationRows = this.db.prepare(`SELECT rel.type, t.id, t.slug, r.payload, COALESCE(r.published_at,r.created_at) verified_at FROM relations rel JOIN topics t ON t.id=rel.target_topic_id JOIN revisions r ON r.id=t.active_revision_id WHERE rel.source_topic_id=?`).all(row.id) as Array<Record<string, string>>;
    return {
      ...item, aliases: data.aliases, audience: data.audience, supportedVersions: data.supportedVersions,
      content: data.content, revisionId: String(row.revision_id), revisionNumber: Number(row.number),
      relations: relationRows.map((relation) => ({ type: relation.type as TopicDetail['relations'][number]['type'], topic: toListItem(relation, 'en') })),
      sources: sourceRows.map((source) => ({ id: source.id!, title: source.title!, url: source.url!, publisher: source.publisher!, type: source.source_type as TopicDetail['sources'][number]['type'], verifiedAt: source.verified_at!, claims: parse(source.claims!) }))
    };
  }

  facets() {
    const rows = this.db.prepare(`SELECT r.payload FROM topics t JOIN revisions r ON r.id=t.active_revision_id`).all() as Array<{ payload: string }>;
    const payloads = rows.map((row) => parse<TopicRevisionInput>(row.payload));
    return {
      domains: countValues(payloads.flatMap((value) => value.domains)),
      types: countValues(payloads.map((value) => value.type)),
      tags: countValues(payloads.flatMap((value) => value.tags))
    };
  }

  revisions(slug: string) {
    return this.db.prepare(`SELECT r.id, r.number, r.status, r.change_note changeNote, r.created_at createdAt, r.reviewed_at reviewedAt, r.published_at publishedAt, r.id=t.active_revision_id active FROM revisions r JOIN topics t ON t.id=r.topic_id WHERE t.slug=? ORDER BY r.number DESC`).all(slug);
  }

  createDraft(input: unknown) {
    const data = topicRevisionInputSchema.parse(input);
    const now = new Date().toISOString();
    let topic = this.db.prepare('SELECT id FROM topics WHERE slug=?').get(data.slug) as { id: string } | undefined;
    if (!topic) { topic = { id: randomUUID() }; this.db.prepare('INSERT INTO topics(id,slug,created_at,updated_at) VALUES(?,?,?,?)').run(topic.id, data.slug, now, now); }
    const number = Number((this.db.prepare('SELECT COALESCE(max(number),0)+1 next FROM revisions WHERE topic_id=?').get(topic.id) as { next: number }).next);
    const id = randomUUID();
    this.db.prepare('INSERT INTO revisions(id,topic_id,number,status,payload,change_note,created_at) VALUES(?,?,?,?,?,?,?)').run(id, topic.id, number, 'draft', JSON.stringify(data), data.changeNote, now);
    this.audit('draft.created', 'revision', id, { topicId: topic.id, number });
    return { id, topicId: topic.id, number, status: 'draft' };
  }

  approveRevision(id: string) { return this.setRevisionStatus(id, 'approved'); }
  rejectRevision(id: string) { return this.setRevisionStatus(id, 'rejected'); }

  publishRevision(id: string) {
    const revision = this.db.prepare('SELECT * FROM revisions WHERE id=?').get(id) as Record<string, string> | undefined;
    if (!revision || revision.status !== 'approved') throw new Error('Only approved revisions can be published');
    this.db.transaction(() => {
      this.db.prepare('UPDATE revisions SET published_at=? WHERE id=?').run(new Date().toISOString(), id);
      this.db.prepare('UPDATE topics SET active_revision_id=?, updated_at=? WHERE id=?').run(id, new Date().toISOString(), revision.topic_id);
      this.reindex(revision.topic_id!, id);
      this.audit('revision.published', 'revision', id, { topicId: revision.topic_id });
    })();
    return { id, published: true };
  }

  rollback(slug: string, revisionId: string) {
    const row = this.db.prepare(`SELECT r.id, r.topic_id FROM revisions r JOIN topics t ON t.id=r.topic_id WHERE t.slug=? AND r.id=? AND r.status='approved'`).get(slug, revisionId) as { id: string; topic_id: string } | undefined;
    if (!row) throw new Error('Approved revision not found');
    this.db.transaction(() => {
      this.db.prepare('UPDATE topics SET active_revision_id=?,updated_at=? WHERE id=?').run(row.id, new Date().toISOString(), row.topic_id);
      this.reindex(row.topic_id, row.id);
      this.audit('topic.rolled_back', 'topic', row.topic_id, { revisionId });
    })();
    return { revisionId, active: true };
  }

  listFindings(status?: string) {
    return status ? this.db.prepare('SELECT * FROM findings WHERE status=? ORDER BY discovered_at DESC').all(status) : this.db.prepare('SELECT * FROM findings ORDER BY discovered_at DESC').all();
  }

  reviewFinding(id: string, status: 'approved' | 'rejected') {
    const result = this.db.prepare("UPDATE findings SET status=?,reviewed_at=? WHERE id=? AND status='pending'").run(status, new Date().toISOString(), id);
    if (!result.changes) throw new Error('Pending finding not found');
    this.audit(`finding.${status}`, 'finding', id, {});
    return { id, status };
  }

  private setRevisionStatus(id: string, status: 'approved' | 'rejected') {
    const result = this.db.prepare("UPDATE revisions SET status=?,reviewed_at=? WHERE id=? AND status='draft'").run(status, new Date().toISOString(), id);
    if (!result.changes) throw new Error('Draft revision not found');
    this.audit(`revision.${status}`, 'revision', id, {});
    return { id, status };
  }

  private reindex(topicId: string, revisionId: string) {
    const revision = this.db.prepare('SELECT payload FROM revisions WHERE id=?').get(revisionId) as { payload: string };
    const data = parse<TopicRevisionInput>(revision.payload);
    this.db.prepare('DELETE FROM topic_search WHERE topic_id=?').run(topicId);
    this.db.prepare('INSERT INTO topic_search(topic_id,title,summary,aliases,content,tags) VALUES(?,?,?,?,?,?)').run(topicId, data.title, data.summary, data.aliases.join(' '), JSON.stringify(data.content), data.tags.join(' '));
  }

  private audit(action: string, entityType: string, entityId: string, metadata: object) {
    this.db.prepare('INSERT INTO audit_log(id,action,entity_type,entity_id,metadata,created_at) VALUES(?,?,?,?,?,?)').run(randomUUID(), action, entityType, entityId, JSON.stringify(metadata), new Date().toISOString());
  }
}

function toListItem(row: Record<string, string>, language: Language): TopicListItem {
  const data = parse<TopicRevisionInput>(row.payload!);
  return { id: row.id!, slug: row.slug!, title: data.title, summary: data.summary, type: data.type, domains: data.domains, tags: data.tags, currentVersion: data.currentVersion, verifiedAt: row.verified_at!, language: row.translation_id || language === 'en' ? language : 'en', sourceLanguage: 'en', translationFallback: language !== 'en' && !row.translation_id, isFavorite: Boolean(Number(row.is_favorite ?? 0)) };
}

function countValues(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value));
}
