import { CHATBOT_AGENT_CONFIG } from "@/content/chatbot-system-prompt";
import type { ChatMessage, ChatRole, ChatbotCookiePayload } from "@/types/chatbot";

const COOKIE_SCHEMA_VERSION = 1;

function isChatRole(role: unknown): role is ChatRole {
  return role === "user" || role === "assistant";
}

function normalizeContent(value: string): string {
  const normalized = value.replace(/\u0000/g, "").trim();
  if (normalized.length <= CHATBOT_AGENT_CONFIG.messageMaxCharacters) {
    return normalized;
  }

  return normalized.slice(0, CHATBOT_AGENT_CONFIG.messageMaxCharacters);
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeDate(value: unknown): string {
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }

  return new Date().toISOString();
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function trimToHistoryLimit(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= CHATBOT_AGENT_CONFIG.historyMaxMessages) {
    return messages;
  }

  return messages.slice(-CHATBOT_AGENT_CONFIG.historyMaxMessages);
}

export function sanitizeUserMessage(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = normalizeContent(value);
  if (!normalized) {
    return null;
  }

  return normalized;
}

export function sanitizeIncomingHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: ChatMessage[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const candidate = entry as Partial<ChatMessage>;
    if (!isChatRole(candidate.role)) {
      continue;
    }
    if (typeof candidate.content !== "string") {
      continue;
    }

    const content = normalizeContent(candidate.content);
    if (!content) {
      continue;
    }

    normalized.push({
      id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : createId(),
      role: candidate.role,
      content,
      createdAt: normalizeDate(candidate.createdAt),
    });
  }

  return trimToHistoryLimit(normalized);
}

export function createChatMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: createId(),
    role,
    content: normalizeContent(content),
    createdAt: new Date().toISOString(),
  };
}

export function buildCookiePayload(messages: ChatMessage[]): ChatbotCookiePayload {
  let current = trimToHistoryLimit(sanitizeIncomingHistory(messages));
  let payload: ChatbotCookiePayload = {
    v: COOKIE_SCHEMA_VERSION,
    messages: current,
  };

  while (
    current.length > 0 &&
    byteLength(JSON.stringify(payload)) > CHATBOT_AGENT_CONFIG.historyMaxBytes
  ) {
    current = current.slice(1);
    payload = {
      v: COOKIE_SCHEMA_VERSION,
      messages: current,
    };
  }

  return payload;
}

export function parseCookiePayload(rawValue: string): ChatMessage[] {
  try {
    const parsed = JSON.parse(rawValue) as Partial<ChatbotCookiePayload>;
    if (parsed.v !== COOKIE_SCHEMA_VERSION) {
      return [];
    }

    return sanitizeIncomingHistory(parsed.messages);
  } catch {
    return [];
  }
}
