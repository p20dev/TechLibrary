import { openDatabase, seedDatabase } from '@tech-library/database';
import { buildApp } from './app.js';

const { sqlite } = openDatabase();
seedDatabase(sqlite);
const app = await buildApp({ sqlite });
const port = Number(process.env.PORT ?? 3001);

const close = async () => { await app.close(); sqlite.close(); process.exit(0); };
process.on('SIGINT', close);
process.on('SIGTERM', close);
await app.listen({ port, host: '0.0.0.0' });
