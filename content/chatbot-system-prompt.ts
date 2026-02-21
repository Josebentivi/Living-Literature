import { SITE_COPY } from "@/content/site-copy";

export type ChatbotAgentConfig = {
  model: string;
  useTemperature: boolean;
  temperature: number;
  useTopP: boolean;
  topP: number;
  maxOutputTokens: number;
  retryMaxOutputTokens: number;
  historyMaxMessages: number;
  messageMaxCharacters: number;
  sessionCookieName: string;
  sessionMaxAgeDays: number;
  historyMaxBytes: number;
  uiEnabled: boolean;
  launcherLabel: string;
  panelTitle: string;
  panelSubtitle: string;
  inputPlaceholder: string;
  emptyStateMessage: string;
  loadingMessage: string;
  errorFallbackMessage: string;
  storageNotice: string;
  systemPrompt: string;
  toneRules: readonly string[];
  scopeRules: readonly string[];
  productContext: readonly string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectTextValues(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    const lines: string[] = [];
    value.forEach((item) => {
      lines.push(...collectTextValues(item));
    });
    return lines;
  }

  if (isRecord(value)) {
    const lines: string[] = [];
    Object.values(value).forEach((nestedValue) => {
      lines.push(...collectTextValues(nestedValue));
    });
    return lines;
  }

  return [];
}

export function buildWebsiteContentForPrompt(): string {
  const lines = collectTextValues(SITE_COPY).map((line) => line.trim()).filter(Boolean);
  const deduplicated = Array.from(new Set(lines));
  return deduplicated.join("\n");
}

export const CHATBOT_AGENT_CONFIG: ChatbotAgentConfig = {
  model: "gpt-5-nano",
  useTemperature: false,
  temperature: 0.35,
  useTopP: false,
  topP: 1,
  maxOutputTokens: 2500,
  retryMaxOutputTokens: 3500,
  historyMaxMessages: 12,
  messageMaxCharacters: 5000,
  sessionCookieName: "pensador_chat_session_v1",
  sessionMaxAgeDays: 30,
  historyMaxBytes: 40_000,
  uiEnabled: true,
  launcherLabel: "Ask Literatura Viva",
  panelTitle: "Literatura Viva Assistant",
  panelSubtitle: "Questions about product, plans, and onboarding",
  inputPlaceholder: "Type your question here...",
  emptyStateMessage:
    "Hello. I can help with product questions, plans, features, and how to get started. How can I assist you today?",
  loadingMessage: "Thinking...",
  errorFallbackMessage:
    "I could not complete that request right now. Please try again, or contact support at support@pensador.ai.",
  storageNotice:
    "Conversation is stored in your browser cookies to preserve context.",
  systemPrompt: `
You are Literatura Viva's website assistant. You help prospective customers understand the product and decide whether it fits their needs.

Goals:
- Clarify product value quickly.
- Answer practical doubts about features, plans, and onboarding.
- Keep responses concise and actionable.
- Use the provided Website Content section as your primary source of truth.

Behavior:
- If information is uncertain, say you are not fully sure.
- Never invent unavailable pricing or feature details.
- If a question needs human help, point users to support@pensador.ai.
`,
  toneRules: [
    "Be concise, practical, and direct.",
    "Use plain language with short paragraphs or bullet points when useful.",
    "Avoid hype and avoid generic filler.",
  ],
  scopeRules: [
    "Focus on product overview, capabilities, use cases, plans, onboarding, and support.",
    "Do not provide legal, medical, or financial advice.",
    "If asked outside scope, redirect to product-related guidance.",
  ],
  productContext: [
    "Pensador is an AI workspace for practical thinking workflows.",
    "Website highlights include streaming chat, tool integrations, deep analysis, and tier-based value.",
    "The primary CTA is Start Using Pensador, which redirects to app.pensador.ai.",
  ],
};
