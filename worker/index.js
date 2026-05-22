import {
  DEFAULT_FEED_TIMEOUT_MS,
  DEFAULT_LOOKBACK_DAYS,
  DEFAULT_STATUS_TIMEZONE,
  dateKey,
  runNewsScan,
} from "../src/statusCore.js";

const STATUS_KEY = "status:latest";

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function config(env) {
  return {
    timezone: env.STATUS_TIMEZONE || DEFAULT_STATUS_TIMEZONE,
    lookbackDays: Number(env.LOOKBACK_DAYS || DEFAULT_LOOKBACK_DAYS),
    feedTimeoutMs: Number(env.FEED_TIMEOUT_MS || DEFAULT_FEED_TIMEOUT_MS),
  };
}

async function getCachedStatus(env) {
  return env.STATUS_KV.get(STATUS_KEY, "json");
}

async function storeStatus(env, status) {
  await Promise.all([
    env.STATUS_KV.put(STATUS_KEY, JSON.stringify(status)),
    env.STATUS_KV.put(`status:${status.date}`, JSON.stringify(status)),
  ]);
  return status;
}

async function refreshStatus(env) {
  const status = await runNewsScan({
    fetchImpl: fetch,
    now: new Date(),
    ...config(env),
  });
  return storeStatus(env, status);
}

async function getFreshStatus(env, { force = false } = {}) {
  const cached = await getCachedStatus(env);
  const today = dateKey(new Date(), config(env).timezone);

  if (!force && cached?.date === today) {
    return cached;
  }

  return refreshStatus(env);
}

async function handleStatus(request, env, ctx) {
  const url = new URL(request.url);
  const publicForceAllowed = env.ALLOW_PUBLIC_REFRESH === "true";
  const force = url.searchParams.get("force") === "1" && publicForceAllowed;

  try {
    if (force) {
      return json(await refreshStatus(env));
    }

    const cached = await getCachedStatus(env);
    const today = dateKey(new Date(), config(env).timezone);

    if (cached?.date === today) {
      return json(cached);
    }

    if (cached) {
      ctx.waitUntil(refreshStatus(env));
      return json({
        ...cached,
        stale: true,
        refreshScheduled: true,
      });
    }

    return json(await refreshStatus(env));
  } catch (error) {
    const cached = await getCachedStatus(env);
    if (cached) {
      return json({
        ...cached,
        stale: true,
        refreshError: error.message,
      });
    }

    return json(
      {
        status: "unknown",
        answer: "Unknown",
        headline: "The tracker could not reach the news feeds yet.",
        summary:
          "No cached verdict exists, and the first feed check failed. Try again once the network is feeling more diplomatic.",
        generatedAt: new Date().toISOString(),
        evidence: [],
        sourceHealth: [],
        errors: [error.message],
      },
      503,
    );
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/status") {
      return handleStatus(request, env, ctx);
    }

    if (url.pathname === "/api/refresh" && request.method === "POST") {
      return json(await getFreshStatus(env, { force: env.ALLOW_PUBLIC_REFRESH === "true" }));
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(getFreshStatus(env));
  },
};
