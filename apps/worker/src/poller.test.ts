import { describe, expect, it } from 'vitest';
import { openDatabase, seedDatabase } from '@tech-library/database';
import { normalize, pollSources } from './poller.js';

describe('source poller', () => {
  it('normalizes unstable page whitespace and scripts', () => {
    expect(normalize('<h1>Hi</h1>  <script>Date.now()</script> world')).toBe('<h1>Hi</h1> world');
  });

  it('is idempotent and creates one finding for a changed fingerprint', async () => {
    const { sqlite } = openDatabase(':memory:');
    seedDatabase(sqlite);
    const response = (body: string) => async () => ({ ok: true, status: 200, text: async () => body, headers: { get: () => null } });
    await pollSources(sqlite, response('<title>Initial</title>') as never);
    await pollSources(sqlite, response('<title>Changed</title>') as never);
    await pollSources(sqlite, response('<title>Changed</title>') as never);
    const count = (sqlite.prepare('SELECT count(*) count FROM findings').get() as { count: number }).count;
    expect(count).toBe(32);
    sqlite.close();
  });
});
