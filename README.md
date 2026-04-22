# Hormuz Today

A small status site for answering "Is the Strait of Hormuz open today?" with a daily news-feed scan and a visible evidence trail.

## Run

```sh
npm start
```

Then open `http://127.0.0.1:3000`.

## How It Works

- `GET /api/status` returns today's cached verdict, refreshing if the cache is stale.
- `GET /api/status?force=1` forces a refresh.
- The cache is written to `data/status.json` and ignored by git.
- The classifier treats direct closure/blockage reporting as stronger than threats, warnings, or hypothetical language.

This is a news scan, not AIS tracking, legal advice, insurance guidance, or navigation advice.
