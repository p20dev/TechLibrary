import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const topics = sqliteTable('topics', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  activeRevisionId: text('active_revision_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const revisions = sqliteTable('revisions', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => topics.id),
  number: integer('number').notNull(),
  status: text('status', { enum: ['draft', 'approved', 'rejected'] }).notNull(),
  payload: text('payload', { mode: 'json' }).notNull(),
  changeNote: text('change_note').notNull(),
  createdAt: text('created_at').notNull(),
  reviewedAt: text('reviewed_at'),
  publishedAt: text('published_at')
}, (table) => [uniqueIndex('revision_topic_number').on(table.topicId, table.number)]);

export const sources = sqliteTable('sources', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  publisher: text('publisher').notNull(),
  sourceType: text('source_type').notNull(),
  title: text('title').notNull(),
  publishedAt: text('published_at'),
  fetchedAt: text('fetched_at').notNull(),
  verifiedAt: text('verified_at').notNull(),
  fingerprint: text('fingerprint').notNull(),
  claims: text('claims', { mode: 'json' }).notNull()
});

export const revisionSources = sqliteTable('revision_sources', {
  revisionId: text('revision_id').notNull().references(() => revisions.id),
  sourceId: text('source_id').notNull().references(() => sources.id)
});

export const relations = sqliteTable('relations', {
  id: text('id').primaryKey(),
  sourceTopicId: text('source_topic_id').notNull().references(() => topics.id),
  targetTopicId: text('target_topic_id').notNull().references(() => topics.id),
  type: text('type').notNull(),
  createdAt: text('created_at').notNull()
});

export const findings = sqliteTable('findings', {
  id: text('id').primaryKey(),
  adapter: text('adapter').notNull(),
  topicId: text('topic_id').references(() => topics.id),
  sourceUrl: text('source_url').notNull(),
  fingerprint: text('fingerprint').notNull().unique(),
  status: text('status').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  proposedPayload: text('proposed_payload', { mode: 'json' }),
  rawMetadata: text('raw_metadata', { mode: 'json' }).notNull(),
  discoveredAt: text('discovered_at').notNull(),
  reviewedAt: text('reviewed_at'),
  error: text('error')
});

export const sourceSubscriptions = sqliteTable('source_subscriptions', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').references(() => topics.id),
  adapter: text('adapter').notNull(),
  url: text('url').notNull().unique(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull(),
  lastFingerprint: text('last_fingerprint'),
  lastCheckedAt: text('last_checked_at'),
  lastError: text('last_error')
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  csrfToken: text('csrf_token').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull()
});

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  metadata: text('metadata', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull()
});

export const workerJobs = sqliteTable('worker_jobs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  result: text('result', { mode: 'json' })
});
