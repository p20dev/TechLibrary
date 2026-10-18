import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import argon2 from 'argon2';
import { openDatabase, seedDatabase } from '@tech-library/database';
import { buildApp } from './app.js';

describe('API', () => {
  let context: ReturnType<typeof openDatabase>;
  beforeEach(() => { context = openDatabase(':memory:'); seedDatabase(context.sqlite); });
  afterEach(() => context.sqlite.close());

  it('lists and searches published topics', async () => {
    const app = await buildApp({ sqlite: context.sqlite });
    const response = await app.inject('/api/v1/topics?q=TypeScript');
    expect(response.statusCode).toBe(200);
    expect(response.json().items[0].slug).toBe('typescript');
    await app.close();
  });

  it('protects admin routes and authenticates with a CSRF-bound session', async () => {
    const hash = await argon2.hash('correct horse battery staple');
    const app = await buildApp({ sqlite: context.sqlite, adminPasswordHash: hash, adminUsername: 'admin', sessionSecret: 'a-secret-with-at-least-thirty-two-characters' });
    expect((await app.inject({ method: 'GET', url: '/api/v1/admin/findings' })).statusCode).toBe(401);
    const login = await app.inject({ method: 'POST', url: '/api/v1/admin/login', payload: { username: 'admin', password: 'correct horse battery staple' } });
    expect(login.statusCode).toBe(200);
    expect(login.json().csrfToken).toBeTruthy();
    await app.close();
  });
});
