import { CHATBOT_AGENT_CONFIG } from "@/content/chatbot-system-prompt";
import { sanitizeIncomingHistory } from "@/lib/chatbot/history";
import type { ChatMessage } from "@/types/chatbot";

type SessionRecord = {
  history: ChatMessage[];
  updatedAt: number;
};

const sessionStore = new Map<string, SessionRecord>();
const SESSION_TTL_MS = CHATBOT_AGENT_CONFIG.sessionMaxAgeDays * 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanupAt = 0;

function cleanupExpiredSessions(now: number): void {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) {
    return;
  }

  for (const [sessionId, record] of sessionStore.entries()) {
    if (now - record.updatedAt > SESSION_TTL_MS) {
      sessionStore.delete(sessionId);
    }
  }

  lastCleanupAt = now;
}

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}

export function readSessionHistory(sessionId: string): ChatMessage[] {
  const now = Date.now();
  cleanupExpiredSessions(now);

  const record = sessionStore.get(sessionId);
  if (!record) {
    return [];
  }

  record.updatedAt = now;
  return record.history;
}

export function writeSessionHistory(sessionId: string, history: ChatMessage[]): ChatMessage[] {
  const now = Date.now();
  cleanupExpiredSessions(now);

  const sanitized = sanitizeIncomingHistory(history);
  sessionStore.set(sessionId, {
    history: sanitized,
    updatedAt: now,
  });

  return sanitized;
}

export function clearSessionHistory(sessionId: string): void {
  sessionStore.delete(sessionId);
}
