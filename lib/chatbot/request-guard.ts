import { SITE_URL } from "@/lib/site";

type RateBucket = {
  timestamps: number[];
};

const ipBuckets = new Map<string, RateBucket>();
const sessionBuckets = new Map<string, RateBucket>();
const requestsPerMinute = new Map<number, number>();
const requestsPerIpMinute = new Map<string, number>();

function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

const RATE_LIMIT_WINDOW_MS = readPositiveIntEnv("CHATBOT_RATE_LIMIT_WINDOW_MS", 60_000);
const RATE_LIMIT_PER_IP = readPositiveIntEnv("CHATBOT_RATE_LIMIT_PER_IP", 30);
const RATE_LIMIT_PER_SESSION = readPositiveIntEnv("CHATBOT_RATE_LIMIT_PER_SESSION", 20);
const SPIKE_ALERT_GLOBAL_PER_MIN = readPositiveIntEnv("CHATBOT_SPIKE_ALERT_PER_MINUTE", 120);
const SPIKE_ALERT_PER_IP_PER_MIN = readPositiveIntEnv(
  "CHATBOT_SPIKE_ALERT_PER_IP_PER_MINUTE",
  40,
);

function pruneRateBucket(bucket: RateBucket, now: number): void {
  const threshold = now - RATE_LIMIT_WINDOW_MS;
  bucket.timestamps = bucket.timestamps.filter((timestamp) => timestamp > threshold);
}

function checkAndConsumeBucket(
  store: Map<string, RateBucket>,
  key: string,
  limit: number,
  now: number,
): {
  allowed: boolean;
  count: number;
  remaining: number;
  retryAfterSeconds: number;
} {
  const bucket = store.get(key) ?? { timestamps: [] };
  pruneRateBucket(bucket, now);

  const count = bucket.timestamps.length;
  if (count >= limit) {
    const oldestInWindow = bucket.timestamps[0] ?? now;
    const retryAfterMs = Math.max(0, RATE_LIMIT_WINDOW_MS - (now - oldestInWindow));
    store.set(key, bucket);

    return {
      allowed: false,
      count,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);

  return {
    allowed: true,
    count: bucket.timestamps.length,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterSeconds: 0,
  };
}

function buildRateLimitHeaders(
  remaining: number,
  retryAfterSeconds: number,
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Window-Seconds": String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
  };

  if (retryAfterSeconds > 0) {
    headers["Retry-After"] = String(retryAfterSeconds);
  }

  return headers;
}

export type RateLimitCheckResult =
  | {
      allowed: true;
      headers: Record<string, string>;
    }
  | {
      allowed: false;
      scope: "ip" | "session";
      retryAfterSeconds: number;
      headers: Record<string, string>;
    };

export function checkRateLimits(ip: string, sessionId: string): RateLimitCheckResult {
  const now = Date.now();

  const ipResult = checkAndConsumeBucket(ipBuckets, ip, RATE_LIMIT_PER_IP, now);
  if (!ipResult.allowed) {
    return {
      allowed: false,
      scope: "ip",
      retryAfterSeconds: ipResult.retryAfterSeconds,
      headers: buildRateLimitHeaders(0, ipResult.retryAfterSeconds),
    };
  }

  const sessionResult = checkAndConsumeBucket(
    sessionBuckets,
    sessionId,
    RATE_LIMIT_PER_SESSION,
    now,
  );
  if (!sessionResult.allowed) {
    return {
      allowed: false,
      scope: "session",
      retryAfterSeconds: sessionResult.retryAfterSeconds,
      headers: buildRateLimitHeaders(0, sessionResult.retryAfterSeconds),
    };
  }

  return {
    allowed: true,
    headers: buildRateLimitHeaders(
      Math.min(ipResult.remaining, sessionResult.remaining),
      0,
    ),
  };
}

function cleanupMinuteMaps(currentMinute: number): void {
  for (const minute of requestsPerMinute.keys()) {
    if (minute < currentMinute - 2) {
      requestsPerMinute.delete(minute);
    }
  }

  for (const key of requestsPerIpMinute.keys()) {
    const [minutePrefix] = key.split(":");
    const minute = Number(minutePrefix);
    if (Number.isFinite(minute) && minute < currentMinute - 2) {
      requestsPerIpMinute.delete(key);
    }
  }
}

export function recordTrafficAndMaybeAlert(ip: string, sessionId: string): void {
  const now = Date.now();
  const currentMinute = Math.floor(now / 60_000);
  cleanupMinuteMaps(currentMinute);

  const globalCount = (requestsPerMinute.get(currentMinute) ?? 0) + 1;
  requestsPerMinute.set(currentMinute, globalCount);

  const ipKey = `${currentMinute}:${ip}`;
  const ipCount = (requestsPerIpMinute.get(ipKey) ?? 0) + 1;
  requestsPerIpMinute.set(ipKey, ipCount);

  if (
    globalCount >= SPIKE_ALERT_GLOBAL_PER_MIN &&
    globalCount % SPIKE_ALERT_GLOBAL_PER_MIN === 0
  ) {
    console.warn("[chatbot] global traffic spike", {
      minute: currentMinute,
      requests: globalCount,
      threshold: SPIKE_ALERT_GLOBAL_PER_MIN,
    });
  }

  if (ipCount >= SPIKE_ALERT_PER_IP_PER_MIN && ipCount % SPIKE_ALERT_PER_IP_PER_MIN === 0) {
    console.warn("[chatbot] per-ip traffic spike", {
      minute: currentMinute,
      ip,
      sessionId,
      requests: ipCount,
      threshold: SPIKE_ALERT_PER_IP_PER_MIN,
    });
  }
}

function collectAllowedOrigins(request: Request): Set<string> {
  const allowed = new Set<string>();

  try {
    allowed.add(new URL(SITE_URL).origin);
  } catch {
    // Ignore invalid environment values.
  }

  try {
    const fromPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (fromPublicSiteUrl) {
      allowed.add(new URL(fromPublicSiteUrl).origin);
    }
  } catch {
    // Ignore invalid environment values.
  }

  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    // Ignore invalid request URL values.
  }

  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }

  return allowed;
}

export function checkRequestOrigin(request: Request): {
  allowed: boolean;
  origin: string | null;
  allowedOrigins: string[];
  reason: string;
} {
  const allowedOrigins = collectAllowedOrigins(request);
  const originHeader = request.headers.get("origin");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (originHeader) {
    try {
      const normalizedOrigin = new URL(originHeader).origin;
      if (allowedOrigins.has(normalizedOrigin)) {
        return {
          allowed: true,
          origin: normalizedOrigin,
          allowedOrigins: Array.from(allowedOrigins),
          reason: "origin_allowed",
        };
      }

      return {
        allowed: false,
        origin: normalizedOrigin,
        allowedOrigins: Array.from(allowedOrigins),
        reason: "origin_not_allowed",
      };
    } catch {
      return {
        allowed: false,
        origin: originHeader,
        allowedOrigins: Array.from(allowedOrigins),
        reason: "origin_invalid",
      };
    }
  }

  if (
    secFetchSite === "same-origin" ||
    secFetchSite === "same-site" ||
    secFetchSite === "none"
  ) {
    return {
      allowed: true,
      origin: null,
      allowedOrigins: Array.from(allowedOrigins),
      reason: "sec_fetch_site_allowed",
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      allowed: true,
      origin: null,
      allowedOrigins: Array.from(allowedOrigins),
      reason: "dev_mode_no_origin",
    };
  }

  return {
    allowed: false,
    origin: null,
    allowedOrigins: Array.from(allowedOrigins),
    reason: "missing_origin_and_sec_fetch_site",
  };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cloudflareIp = request.headers.get("cf-connecting-ip");
  if (cloudflareIp) {
    return cloudflareIp.trim();
  }

  return "unknown";
}

export async function readRawBodyWithLimit(
  request: Request,
  maxBytes: number,
): Promise<{ tooLarge: boolean; rawBody: string }> {
  if (!request.body) {
    return { tooLarge: false, rawBody: "" };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let rawBody = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { tooLarge: true, rawBody: "" };
      }

      rawBody += decoder.decode(value, { stream: true });
    }

    rawBody += decoder.decode();
    return { tooLarge: false, rawBody };
  } finally {
    reader.releaseLock();
  }
}
