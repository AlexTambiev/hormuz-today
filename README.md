# Hormuz Today

A small status site for answering "Is the Strait of Hormuz open today?" with a daily news-feed scan and a visible evidence trail.

## Local Run

```sh
npm start
```

Then open `http://127.0.0.1:3000`.

## Cloudflare Deployment

This project is ready to deploy as a Cloudflare Worker with static assets.

- `public/` is served as the static site.
- `worker/index.js` serves `/api/status`.
- `STATUS_KV` stores `status:latest` and daily snapshots such as `status:2026-04-22`.
- `wrangler.toml` configures an hourly cron trigger. The Worker refreshes only when the cached London-date status is stale, so hourly cron handles daylight saving time without guessing.

### GitHub Auto-Deploy

1. Push this repo to GitHub.
2. In Cloudflare, go to Workers & Pages > Create application > Import a repository.
3. Select this repository.
4. Choose Workers, not Pages.
5. Use `hormuz-today` as the Worker name. It must match `name = "hormuz-today"` in `wrangler.toml`.
6. Set the root directory to `/`.
7. Leave the build command empty unless Cloudflare asks for one.
8. Use `npx wrangler deploy` as the deploy command.
9. Save and deploy.

The KV namespace is declared in `wrangler.toml` without an ID so Cloudflare can create it during deployment. If the dashboard asks for an explicit namespace, create a Workers KV namespace named `hormuz-today-status-kv`, copy its namespace ID, and add it under `[[kv_namespaces]]`:

```toml
[[kv_namespaces]]
binding = "STATUS_KV"
id = "your_namespace_id_here"
```

Then push that change and redeploy.

## How It Works

- `GET /api/status` returns today's cached verdict, refreshing if the cache is stale.
- Locally, the cache is written to `data/status.json` and ignored by git.
- On Cloudflare, the cache is written to Workers KV.
- The classifier treats direct closure/blockage reporting as stronger than threats, warnings, or hypothetical language.
- The newest direct open/closed report drives the displayed verdict.

This is a news scan, not AIS tracking, legal advice, insurance guidance, or navigation advice.
