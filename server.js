const http = require("node:http");
const path = require("node:path");
const { readFile, stat } = require("node:fs/promises");
const { URL } = require("node:url");
const {
  getCachedStatus,
  getStatusForToday,
  refreshStatus,
} = require("./src/newsStatus");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

let refreshInFlight = null;

async function json(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

async function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const resolved = path.normalize(path.join(PUBLIC_DIR, safePath));

  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(resolved);
    if (!fileStat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(resolved);
    const content = await readFile(resolved);
    res.writeHead(200, {
      "content-type": MIME_TYPES[ext] || "application/octet-stream",
      "cache-control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

async function handleStatusRequest(req, res, url) {
  const force = url.searchParams.get("force") === "1";

  try {
    if (force) {
      refreshInFlight ||= refreshStatus().finally(() => {
        refreshInFlight = null;
      });
      return json(res, 200, await refreshInFlight);
    }

    return json(res, 200, await getStatusForToday());
  } catch (error) {
    const cached = await getCachedStatus();
    if (cached) {
      return json(res, 200, {
        ...cached,
        stale: true,
        refreshError: error.message,
      });
    }

    return json(res, 503, {
      status: "unknown",
      answer: "Unknown",
      headline: "The tracker could not reach the news feeds yet.",
      summary:
        "No cached verdict exists, and the first feed check failed. Try again once the network is feeling more diplomatic.",
      generatedAt: new Date().toISOString(),
      evidence: [],
      sourceHealth: [],
      errors: [error.message],
    });
  }
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/status") {
    return handleStatusRequest(req, res, url);
  }

  if (url.pathname === "/api/refresh" && req.method === "POST") {
    return handleStatusRequest(req, res, new URL("/api/status?force=1", url));
  }

  return serveStatic(req, res, url.pathname);
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(error.stack || error.message);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Hormuz tracker listening on http://${HOST}:${PORT}`);
});

setInterval(() => {
  getStatusForToday().catch((error) => {
    console.warn("Scheduled status refresh failed:", error.message);
  });
}, 60 * 60 * 1000).unref();

getStatusForToday().catch((error) => {
  console.warn("Initial status refresh failed:", error.message);
});
