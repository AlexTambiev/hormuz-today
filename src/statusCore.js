export const DEFAULT_STATUS_TIMEZONE = "Europe/London";
export const DEFAULT_LOOKBACK_DAYS = 7;
export const DEFAULT_FEED_TIMEOUT_MS = 12000;

export const SOURCES = [
  {
    name: "Google News: exact Strait of Hormuz",
    url: "https://news.google.com/rss/search?q=%22Strait%20of%20Hormuz%22%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News: closure and shipping terms",
    url: "https://news.google.com/rss/search?q=%22Strait%20of%20Hormuz%22%20%28closed%20OR%20closure%20OR%20reopened%20OR%20shipping%20OR%20tanker%20OR%20transit%29%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Bing News: Strait of Hormuz",
    url: "https://www.bing.com/news/search?q=%22Strait%20of%20Hormuz%22&format=rss",
  },
  {
    name: "gCaptain search feed",
    url: "https://gcaptain.com/feed/?s=Strait%20of%20Hormuz",
  },
];

const HIGH_CREDIBILITY_SOURCES = [
  "reuters",
  "associated press",
  "ap news",
  "bbc",
  "financial times",
  "bloomberg",
  "al jazeera",
  "the guardian",
  "wall street journal",
  "lloyd's list",
  "tradewinds",
  "gcaptain",
  "maritime executive",
  "ukmto",
  "u.s. navy",
  "us navy",
  "eia",
];

const CLOSURE_PATTERNS = [
  /\bclos(?:e|es|ed|ing|ure)\b/,
  /\bshut(?:s|ting)?\b/,
  /\bblock(?:s|ed|ing)\s+(?:shipping|traffic|transit|passage|navigation|the strait|strait of hormuz)\b/,
  /\bseal(?:s|ed|ing)?\b/,
  /\bhalt(?:s|ed|ing)?\b/,
  /\bsuspend(?:s|ed|ing)?\b/,
  /\bstop(?:s|ped|ping)?\s+(?:shipping|traffic|transit|passage|navigation)\b/,
  /\bmine(?:s|d)?\b/,
  /\bimpassable\b/,
];

const BLOCKADE_OF_STRAIT_PATTERNS = [
  /\bblockade\s+of\s+(?:the\s+)?(?:strait of hormuz|hormuz strait)\b/,
  /\b(?:strait of hormuz|hormuz strait)\s+(?:is\s+|was\s+|under\s+)?blockade\b/,
  /\bblockad(?:e|ed|ing)\s+(?:the\s+)?(?:strait of hormuz|hormuz strait)\b/,
];

const NEGATED_STRAIT_CLOSURE_PATTERNS = [
  /\bnot\s+(?:the\s+)?(?:strait of hormuz|hormuz strait)\b/,
  /\b(?:ports?|harbours?|harbors?)\s+under\s+blockade,\s+not\s+(?:the\s+)?(?:strait of hormuz|hormuz strait)\b/,
  /\b(?:ports?|harbours?|harbors?)\s+(?:are\s+)?(?:closed|blocked|under blockade),\s+not\s+(?:the\s+)?(?:strait of hormuz|hormuz strait)\b/,
];

const OPEN_PATTERNS = [
  /\bopen(?:s|ed|ing)?\b/,
  /\breopen(?:s|ed|ing)?\b/,
  /\bshipping\s+(?:continues|resumes|flows)\b/,
  /\btraffic\s+(?:continues|resumes|flows)\b/,
  /\btransit\s+(?:continues|resumes)\b/,
  /\bpassage\s+(?:continues|resumes)\b/,
  /\bnavigation\s+(?:continues|resumes)\b/,
];

const NEGATED_OPEN_PATTERNS = [
  /\b(?:impossible|unable|cannot|can't|not\s+able)\b[\s\S]{0,40}\b(?:open(?:ed|ing|s)?|reopen(?:ed|ing|s)?)\b/,
  /\b(?:open(?:ed|ing|s)?|reopen(?:ed|ing|s)?)\b[\s\S]{0,40}\b(?:impossible|unable|cannot|can't|not\s+possible|not\s+allowed|not\s+likely)\b/,
  /\bno\s+(?:reopening|opening)\b/,
  /\bnot\s+(?:reopening|opening)\b/,
  /\breopening\s+is\s+not\s+(?:possible|allowed|likely)\b/,
  /\breopen(?:ing|ed|s)?\s+is\s+not\s+(?:possible|allowed|likely)\b/,
];

const RISK_PATTERNS = [
  /\battack(?:s|ed|ing)?\b/,
  /\bseiz(?:e|es|ed|ing|ure)\b/,
  /\bmissile(?:s)?\b/,
  /\bdrone(?:s)?\b/,
  /\bshot(?:s)?\b/,
  /\bfir(?:e|es|ed|ing)\s+(?:on|at|near)\b/,
  /\bharass(?:es|ed|ing|ment)?\b/,
  /\bwarn(?:s|ed|ing)?\b/,
  /\bthreat(?:s|en|ens|ened|ening)?\b/,
  /\bdisrupt(?:s|ed|ing|ion)?\b/,
  /\bwar risk\b/,
  /\bnaval escort\b/,
  /\btanker(?:s)?\b/,
];

const HYPOTHETICAL_PATTERNS = [
  /\bcould\b/,
  /\bmay\b/,
  /\bmight\b/,
  /\bwould\b/,
  /\bthreat(?:s|en|ens|ened|ening)?\b/,
  /\bwarn(?:s|ed|ing)?\b/,
  /\bplan(?:s|ned|ning)?\b/,
  /\bweigh(?:s|ed|ing)?\b/,
  /\bcall(?:s|ed|ing)?\s+for\b/,
  /\bvote(?:s|d)?\s+to\b/,
  /\bparliament\b/,
  /\bif\b/,
];

export function dateKey(date = new Date(), timezone = DEFAULT_STATUS_TIMEZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function decodeEntities(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    );
}

export function stripHtml(value = "") {
  return decodeEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripHtml(match[1]) : "";
}

function getLink(xml) {
  const atomLink = xml.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (atomLink) return decodeEntities(atomLink[1]);
  return getTag(xml, "link");
}

export function parseFeed(xml, sourceName) {
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  const entryBlocks = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  const blocks = itemBlocks.length ? itemBlocks : entryBlocks;

  return blocks.map((block) => {
    const publishedRaw =
      getTag(block, "pubDate") || getTag(block, "published") || getTag(block, "updated");
    const title = getTag(block, "title");
    const source = getTag(block, "source") || sourceName;

    return {
      title,
      link: getLink(block),
      source,
      feed: sourceName,
      publishedAt: publishedRaw ? new Date(publishedRaw).toISOString() : null,
      summary:
        getTag(block, "description") ||
        getTag(block, "summary") ||
        getTag(block, "content"),
    };
  });
}

export async function fetchFeed(
  source,
  { fetchImpl = fetch, feedTimeoutMs = DEFAULT_FEED_TIMEOUT_MS } = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), feedTimeoutMs);

  try {
    const response = await fetchImpl(source.url, {
      headers: {
        "user-agent": "HormuzOpenTracker/1.0 (+daily news status page)",
        accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const items = parseFeed(xml, source.name);
    return {
      source: source.name,
      ok: true,
      count: items.length,
      items,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function isRecent(item, { now = new Date(), lookbackDays = DEFAULT_LOOKBACK_DAYS } = {}) {
  if (!item.publishedAt) return true;
  const published = new Date(item.publishedAt).getTime();
  const oldest = now.getTime() - lookbackDays * 24 * 60 * 60 * 1000;
  return Number.isFinite(published) && published >= oldest;
}

export function isRelevant(item) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  return (
    text.includes("hormuz") ||
    (text.includes("persian gulf") &&
      /\b(strait|shipping|tanker|transit|navigation|oil|lng)\b/.test(text))
  );
}

function hasAny(patterns, text) {
  return patterns.some((pattern) => pattern.test(text));
}

function countMatches(patterns, text) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function sourceCredibility(item) {
  const text = `${item.source} ${item.feed}`.toLowerCase();
  return HIGH_CREDIBILITY_SOURCES.some((source) => text.includes(source)) ? 2 : 1;
}

function publishedTime(item) {
  if (!item.publishedAt) return 0;
  const value = new Date(item.publishedAt).getTime();
  return Number.isFinite(value) ? value : 0;
}

export function compareByRecency(a, b) {
  const byTime = publishedTime(b) - publishedTime(a);
  if (byTime !== 0) return byTime;
  return b.weight - a.weight;
}

export function classifyItem(item) {
  const title = item.title.toLowerCase();
  const text = `${item.title}. ${item.summary}`.toLowerCase();
  const closureMatches =
    countMatches(CLOSURE_PATTERNS, text) + countMatches(BLOCKADE_OF_STRAIT_PATTERNS, text);
  const openMatches = countMatches(OPEN_PATTERNS, text);
  const negatedOpen = hasAny(NEGATED_OPEN_PATTERNS, text);
  const riskMatches = countMatches(RISK_PATTERNS, text);
  const hypothetical = hasAny(HYPOTHETICAL_PATTERNS, text);
  const negatedStraitClosure = hasAny(NEGATED_STRAIT_CLOSURE_PATTERNS, text);
  const credibility = sourceCredibility(item);
  const closureInTitle =
    hasAny(CLOSURE_PATTERNS, title) || hasAny(BLOCKADE_OF_STRAIT_PATTERNS, title);
  const openInTitle = hasAny(OPEN_PATTERNS, title);

  let signal = "background";
  let weight = 0;
  let reason = "Mentioned the Strait without a clear open/closed signal.";

  if (negatedStraitClosure) {
    signal = riskMatches ? "risk" : "background";
    weight = riskMatches ? 1 + credibility : 0;
    reason = "Mentions blockade or closure language while explicitly distinguishing it from the Strait.";
  } else if (closureMatches && !hypothetical) {
    signal = "closed";
    weight = (closureInTitle ? 4 : 2) + credibility;
    reason = "Uses direct closure/blockage language without being framed as hypothetical.";
  } else if (closureMatches && hypothetical) {
    signal = "threat";
    weight = 2 + credibility;
    reason = "Discusses closure language, but framed as a threat, warning, or possibility.";
  } else if (negatedOpen) {
    signal = "closed";
    weight = 3 + credibility;
    reason = "Mentions reopening, but frames it as impossible or not possible.";
  } else if (openMatches) {
    signal = "open";
    weight = (openInTitle ? 3 : 2) + credibility;
    reason = "Uses open/reopened/traffic-resuming language.";
  } else if (riskMatches) {
    signal = "risk";
    weight = Math.min(4, riskMatches) + credibility;
    reason = "Mentions security or shipping-risk terms but not a confirmed closure.";
  }

  return {
    ...item,
    signal,
    weight,
    reason,
    credibility,
  };
}

export function dedupeItems(items) {
  const seen = new Set();
  const deduped = [];

  for (const item of items) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}

export function verdictFromEvidence(
  items,
  sourceHealth,
  errors = [],
  { now = new Date(), timezone = DEFAULT_STATUS_TIMEZONE, lookbackDays = DEFAULT_LOOKBACK_DAYS } = {},
) {
  const closed = items
    .filter((item) => item.signal === "closed" && item.weight >= 4)
    .sort(compareByRecency);
  const open = items
    .filter((item) => item.signal === "open" && item.weight >= 3)
    .sort(compareByRecency);
  const threats = items.filter((item) => item.signal === "threat").sort(compareByRecency);
  const risks = items.filter((item) => item.signal === "risk").sort(compareByRecency);
  const decisive = [...closed, ...open].sort(compareByRecency);
  const latestDecisive = decisive[0];
  const latestOpen = open[0];
  const latestClosed = closed[0];
  const topEvidence = items
    .filter((item) => item.signal !== "background")
    .sort(compareByRecency)
    .slice(0, 8);

  const base = {
    date: dateKey(now, timezone),
    timezone,
    generatedAt: now.toISOString(),
    lookbackDays,
    sourceHealth,
    evidence: topEvidence,
    totalRelevantItems: items.length,
    errors,
    method:
      "Daily RSS/news search scan. The most recent conclusive open/closed report drives the verdict; newer threats and hypotheticals are treated as risk, not closure. This is not AIS, legal, insurance, or navigation advice.",
  };

  if (latestDecisive?.signal === "closed") {
    return {
      ...base,
      status: "closed",
      answer: "Likely closed",
      headline: latestOpen
        ? "The most recent conclusive report says closed, after earlier open-language coverage."
        : "The most recent conclusive report says the Strait is closed or traffic is halted.",
      summary:
        "The tracker follows the latest conclusive open/closed signal. Newer threats stay in the risk bucket until a source reports an actual closure or reopening.",
    };
  }

  if (latestDecisive?.signal === "open") {
    return {
      ...base,
      status: "open",
      answer: "Reported open",
      headline: latestClosed
        ? "The most recent conclusive report says open, after earlier closure-language coverage."
        : "The most recent conclusive report says open or resumed transit.",
      summary:
        "The latest conclusive open/reopened signal beat the older closure signal. Newer threats stay in the risk bucket until a source reports an actual closure.",
    };
  }

  if (threats.length || risks.length >= 2) {
    return {
      ...base,
      status: "disrupted",
      answer: "No confirmed closure, but not chill",
      headline: "The scan found threat or disruption signals, not a clean closure report.",
      summary:
        "The Strait appears to be doing its traditional impression of a global economy stress test. Treat this as a caution flag until stronger sources settle it.",
    };
  }

  if (items.length) {
    return {
      ...base,
      status: "open-caveat",
      answer: "No confirmed closure found",
      headline: "Recent Strait coverage did not show a confirmed closure.",
      summary:
        "That is not the same as a captain's green light, but it is the least dramatic answer the news could produce today.",
    };
  }

  return {
    ...base,
    status: "unknown",
    answer: "Unknown",
    headline: "No recent relevant headlines were found.",
    summary:
      "The feeds were reachable, but this scan did not find enough Hormuz-specific signal to make a responsible call. The world remains committed to ambiguity.",
  };
}

export async function runNewsScan({
  sources = SOURCES,
  fetchImpl = fetch,
  now = new Date(),
  timezone = DEFAULT_STATUS_TIMEZONE,
  lookbackDays = DEFAULT_LOOKBACK_DAYS,
  feedTimeoutMs = DEFAULT_FEED_TIMEOUT_MS,
} = {}) {
  const settled = await Promise.allSettled(
    sources.map((source) => fetchFeed(source, { fetchImpl, feedTimeoutMs })),
  );
  const sourceHealth = [];
  const errors = [];
  const rawItems = [];

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      sourceHealth.push({
        source: result.value.source,
        ok: true,
        count: result.value.count,
      });
      rawItems.push(...result.value.items);
    } else {
      const source = sources[index];
      sourceHealth.push({
        source: source ? source.name : "Unknown source",
        ok: false,
        count: 0,
        error: result.reason.message,
      });
      errors.push(result.reason.message);
    }
  });

  const items = dedupeItems(rawItems)
    .filter((item) => isRecent(item, { now, lookbackDays }))
    .filter(isRelevant)
    .map(classifyItem)
    .sort(compareByRecency);

  return verdictFromEvidence(items, sourceHealth, errors, {
    now,
    timezone,
    lookbackDays,
  });
}
