# Operations

## Deployment

1. Generate an Argon2id hash with `npm run password:hash -w @tech-library/api -- "a strong password"`.
2. Copy `.env.example` to `.env`, set the hash, a random 32+ character session secret, and the public `WEB_ORIGIN`.
3. Run `docker compose up -d --build`.
4. Verify `http://host:8080/healthz` and the API health check through Docker Compose.

Terminate TLS at a trusted reverse proxy and forward HTTPS to port 8080. Restrict filesystem access to the Docker volume and secrets file.

## Backup and restore

Run `scripts/backup.ps1` against a stopped instance or a host-installed `sqlite3` client. The command uses SQLite's online backup operation. Retain encrypted off-host copies and test restoration regularly.

Before restoration, stop API and worker, validate the target path, run `scripts/restore.ps1 -Backup <file>`, and restart the services. Confirm `/health` and a known topic afterward.

## Monitoring

All services expose structured container logs. Alert on API health failure, worker `source_poll.failed` events, a growing pending-findings queue, backup failure, and low volume capacity. Source fetch errors remain attached to subscriptions and never change published content.
