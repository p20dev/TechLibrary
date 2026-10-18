import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import argon2 from 'argon2';
import { randomBytes, randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { LibraryRepository } from './repository.js';

declare module 'fastify' { interface FastifyRequest { adminSession?: { id: string; csrfToken: string } } }

export interface AppOptions { sqlite: Database.Database; adminUsername?: string; adminPasswordHash?: string; sessionSecret?: string; webOrigin?: string }

export async function buildApp(options: AppOptions) {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });
  const repo = new LibraryRepository(options.sqlite);
  const secret = options.sessionSecret ?? process.env.SESSION_SECRET ?? 'development-secret-must-be-replaced';
  await app.register(cookie, { secret });
  await app.register(cors, { origin: options.webOrigin ?? process.env.WEB_ORIGIN ?? 'http://localhost:5173', credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });

  app.get('/health', async () => ({ status: 'ok', time: new Date().toISOString() }));
  app.get('/api/v1/topics', async (request) => {
    const query = request.query as Record<string, string | undefined>;
    return repo.listTopics({ q: query.q, domain: query.domain, type: query.type, page: Math.max(1, Number(query.page) || 1), pageSize: Math.min(100, Math.max(1, Number(query.pageSize) || 24)) });
  });
  app.get('/api/v1/topics/:slug', async (request, reply) => {
    const result = repo.getTopic((request.params as { slug: string }).slug);
    return result ?? reply.code(404).send({ error: 'Topic not found' });
  });
  app.get('/api/v1/topics/:slug/revisions', async (request) => repo.revisions((request.params as { slug: string }).slug));
  app.get('/api/v1/facets', async () => repo.facets());

  app.post('/api/v1/admin/login', async (request, reply) => {
    const body = request.body as { username?: string; password?: string };
    const username = options.adminUsername ?? process.env.ADMIN_USERNAME ?? 'admin';
    const hash = options.adminPasswordHash ?? process.env.ADMIN_PASSWORD_HASH;
    if (!hash || body.username !== username || !(await argon2.verify(hash, body.password ?? ''))) return reply.code(401).send({ error: 'Invalid credentials' });
    const id = randomUUID();
    const csrfToken = randomBytes(24).toString('base64url');
    const now = new Date();
    const expires = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    options.sqlite.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now.toISOString());
    options.sqlite.prepare('INSERT INTO sessions(id,csrf_token,expires_at,created_at) VALUES(?,?,?,?)').run(id, csrfToken, expires.toISOString(), now.toISOString());
    reply.setCookie('tech_library_session', id, { path: '/', httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', signed: true, expires });
    return { authenticated: true, csrfToken, expiresAt: expires.toISOString() };
  });

  app.post('/api/v1/admin/logout', { preHandler: requireAdmin(options.sqlite, false) }, async (request, reply) => {
    options.sqlite.prepare('DELETE FROM sessions WHERE id=?').run(request.adminSession!.id);
    reply.clearCookie('tech_library_session', { path: '/' });
    return { authenticated: false };
  });
  app.get('/api/v1/admin/session', { preHandler: requireAdmin(options.sqlite, false) }, async (request) => ({ authenticated: true, csrfToken: request.adminSession!.csrfToken }));

  app.post('/api/v1/admin/revisions', { preHandler: requireAdmin(options.sqlite) }, async (request, reply) => handle(reply, () => repo.createDraft(request.body)));
  app.post('/api/v1/admin/revisions/:id/approve', { preHandler: requireAdmin(options.sqlite) }, async (request, reply) => handle(reply, () => repo.approveRevision((request.params as { id: string }).id)));
  app.post('/api/v1/admin/revisions/:id/reject', { preHandler: requireAdmin(options.sqlite) }, async (request, reply) => handle(reply, () => repo.rejectRevision((request.params as { id: string }).id)));
  app.post('/api/v1/admin/revisions/:id/publish', { preHandler: requireAdmin(options.sqlite) }, async (request, reply) => handle(reply, () => repo.publishRevision((request.params as { id: string }).id)));
  app.post('/api/v1/admin/topics/:slug/rollback', { preHandler: requireAdmin(options.sqlite) }, async (request, reply) => handle(reply, () => repo.rollback((request.params as { slug: string }).slug, (request.body as { revisionId: string }).revisionId)));
  app.get('/api/v1/admin/findings', { preHandler: requireAdmin(options.sqlite, false) }, async (request) => repo.listFindings((request.query as { status?: string }).status));
  app.post('/api/v1/admin/source-poll', { preHandler: requireAdmin(options.sqlite) }, async () => {
    const id = randomUUID();
    options.sqlite.prepare("INSERT INTO worker_jobs(id,type,status,created_at) VALUES(?,'source-poll','pending',?)").run(id, new Date().toISOString());
    return { id, status: 'pending' };
  });
  app.post('/api/v1/admin/findings/:id/:action', { preHandler: requireAdmin(options.sqlite) }, async (request, reply) => handle(reply, () => {
    const { id, action } = request.params as { id: string; action: string };
    if (action !== 'approve' && action !== 'reject') throw new Error('Invalid action');
    return repo.reviewFinding(id, action === 'approve' ? 'approved' : 'rejected');
  }));

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const status = typeof error === 'object' && error !== null && 'issues' in error ? 400 : 500;
    reply.code(status).send({ error: status === 400 && error instanceof Error ? error.message : 'Internal server error' });
  });
  return app;
}

function requireAdmin(sqlite: Database.Database, csrf = true) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const signed = request.unsignCookie(request.cookies.tech_library_session ?? '');
    if (!signed.valid || !signed.value) return reply.code(401).send({ error: 'Authentication required' });
    const session = sqlite.prepare('SELECT id,csrf_token csrfToken FROM sessions WHERE id=? AND expires_at>?').get(signed.value, new Date().toISOString()) as { id: string; csrfToken: string } | undefined;
    if (!session) return reply.code(401).send({ error: 'Session expired' });
    if (csrf && request.headers['x-csrf-token'] !== session.csrfToken) return reply.code(403).send({ error: 'Invalid CSRF token' });
    request.adminSession = session;
  };
}

async function handle(reply: FastifyReply, operation: () => unknown) {
  try { return operation(); } catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : 'Invalid request' }); }
}
