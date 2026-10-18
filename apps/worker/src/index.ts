import { openDatabase } from '@tech-library/database';
import { pollSources } from './poller.js';

const { sqlite } = openDatabase();
const intervalHours = Math.max(1, Number(process.env.SOURCE_POLL_INTERVAL_HOURS ?? 24));
let running = false;

async function run(jobId?: string) {
  if (running) return;
  running = true;
  if (jobId) sqlite.prepare("UPDATE worker_jobs SET status='running',started_at=? WHERE id=?").run(new Date().toISOString(), jobId);
  try {
    const result = await pollSources(sqlite);
    if (jobId) sqlite.prepare("UPDATE worker_jobs SET status='completed',completed_at=?,result=? WHERE id=?").run(new Date().toISOString(), JSON.stringify(result), jobId);
    console.log(JSON.stringify({ level: 'info', event: 'source_poll.completed', ...result, time: new Date().toISOString() }));
  } catch (error) {
    if (jobId) sqlite.prepare("UPDATE worker_jobs SET status='failed',completed_at=?,result=? WHERE id=?").run(new Date().toISOString(), JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), jobId);
    console.error(JSON.stringify({ level: 'error', event: 'source_poll.failed', error: error instanceof Error ? error.message : 'Unknown error', time: new Date().toISOString() }));
  } finally { running = false; }
}

setInterval(() => {
  const job = sqlite.prepare("SELECT id FROM worker_jobs WHERE type='source-poll' AND status='pending' ORDER BY created_at LIMIT 1").get() as { id: string } | undefined;
  if (job) void run(job.id);
}, 5_000);
setInterval(() => void run(), intervalHours * 60 * 60 * 1000);
void run();

const close = () => { sqlite.close(); process.exit(0); };
process.on('SIGINT', close);
process.on('SIGTERM', close);
