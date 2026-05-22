import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  DEFAULT_FEED_TIMEOUT_MS,
  DEFAULT_LOOKBACK_DAYS,
  DEFAULT_STATUS_TIMEZONE,
  SOURCE_CONFIG_VERSION,
  classifyItem,
  compareByRecency,
  dateKey,
  runNewsScan,
  verdictFromEvidence,
} from "./statusCore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const STATUS_FILE = path.join(DATA_DIR, "status.json");
const STATUS_TIMEZONE = process.env.STATUS_TIMEZONE || DEFAULT_STATUS_TIMEZONE;
const LOOKBACK_DAYS = Number(process.env.LOOKBACK_DAYS || DEFAULT_LOOKBACK_DAYS);
const FEED_TIMEOUT_MS = Number(process.env.FEED_TIMEOUT_MS || DEFAULT_FEED_TIMEOUT_MS);

export function londonDateKey(date = new Date()) {
  return dateKey(date, STATUS_TIMEZONE);
}

export async function refreshStatus() {
  const verdict = await runNewsScan({
    timezone: STATUS_TIMEZONE,
    lookbackDays: LOOKBACK_DAYS,
    feedTimeoutMs: FEED_TIMEOUT_MS,
  });

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STATUS_FILE, JSON.stringify(verdict, null, 2));

  return verdict;
}

export async function getCachedStatus() {
  try {
    return JSON.parse(await readFile(STATUS_FILE, "utf8"));
  } catch {
    return null;
  }
}

export async function getStatusForToday() {
  const cached = await getCachedStatus();
  if (cached?.date === londonDateKey() && cached.sourceConfigVersion === SOURCE_CONFIG_VERSION) {
    return cached;
  }

  return refreshStatus();
}

export { classifyItem, compareByRecency, verdictFromEvidence };
