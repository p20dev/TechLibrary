import type Database from 'better-sqlite3';

const migrations = [
  `CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS topics (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, active_revision_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS revisions (id TEXT PRIMARY KEY, topic_id TEXT NOT NULL REFERENCES topics(id), number INTEGER NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','approved','rejected')), payload TEXT NOT NULL, change_note TEXT NOT NULL, created_at TEXT NOT NULL, reviewed_at TEXT, published_at TEXT, UNIQUE(topic_id, number));
   CREATE TABLE IF NOT EXISTS sources (id TEXT PRIMARY KEY, url TEXT NOT NULL, publisher TEXT NOT NULL, source_type TEXT NOT NULL, title TEXT NOT NULL, published_at TEXT, fetched_at TEXT NOT NULL, verified_at TEXT NOT NULL, fingerprint TEXT NOT NULL, claims TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS revision_sources (revision_id TEXT NOT NULL REFERENCES revisions(id), source_id TEXT NOT NULL REFERENCES sources(id), PRIMARY KEY(revision_id, source_id));
   CREATE TABLE IF NOT EXISTS relations (id TEXT PRIMARY KEY, source_topic_id TEXT NOT NULL REFERENCES topics(id), target_topic_id TEXT NOT NULL REFERENCES topics(id), type TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(source_topic_id, target_topic_id, type));
   CREATE TABLE IF NOT EXISTS findings (id TEXT PRIMARY KEY, adapter TEXT NOT NULL, topic_id TEXT REFERENCES topics(id), source_url TEXT NOT NULL, fingerprint TEXT NOT NULL UNIQUE, status TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, proposed_payload TEXT, raw_metadata TEXT NOT NULL, discovered_at TEXT NOT NULL, reviewed_at TEXT, error TEXT);
   CREATE TABLE IF NOT EXISTS source_subscriptions (id TEXT PRIMARY KEY, topic_id TEXT REFERENCES topics(id), adapter TEXT NOT NULL, url TEXT NOT NULL UNIQUE, enabled INTEGER NOT NULL DEFAULT 1, last_fingerprint TEXT, last_checked_at TEXT, last_error TEXT);
   CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, csrf_token TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, metadata TEXT NOT NULL, created_at TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS worker_jobs (id TEXT PRIMARY KEY, type TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, started_at TEXT, completed_at TEXT, result TEXT);
   CREATE VIRTUAL TABLE IF NOT EXISTS topic_search USING fts5(topic_id UNINDEXED, title, summary, aliases, content, tags, tokenize='porter unicode61');
   CREATE INDEX IF NOT EXISTS revisions_topic_id ON revisions(topic_id);
   CREATE INDEX IF NOT EXISTS findings_status ON findings(status);
   CREATE INDEX IF NOT EXISTS relations_source ON relations(source_topic_id);`
];

export function migrate(sqlite: Database.Database): void {
  sqlite.exec('CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)');
  const applied = sqlite.prepare('SELECT 1 FROM _migrations WHERE version = ?');
  const record = sqlite.prepare('INSERT INTO _migrations(version, applied_at) VALUES (?, ?)');
  migrations.forEach((sql, index) => {
    const version = index + 1;
    if (applied.get(version)) return;
    sqlite.transaction(() => { sqlite.exec(sql); record.run(version, new Date().toISOString()); })();
  });
}
