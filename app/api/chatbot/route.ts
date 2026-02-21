import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  buildWebsiteContentForPrompt,
  CHATBOT_AGENT_CONFIG,
} from "@/content/chatbot-system-prompt";
import {
  buildCookiePayload,
  createChatMessage,
  sanitizeIncomingHistory,
  sanitizeUserMessage,
} from "@/lib/chatbot/history";
import {
  checkRateLimits,
  checkRequestOrigin,
  getClientIp,
  readRawBodyWithLimit,
  recordTrafficAndMaybeAlert,
} from "@/lib/chatbot/request-guard";
import {
  clearSessionHistory,
  createSessionId,
  readSessionHistory,
  writeSessionHistory,
} from "@/lib/chatbot/session-store";
import type {
  ChatbotApiErrorResponse,
  ChatbotApiHistoryResponse,
  ChatbotApiRequest,
  ChatbotApiSuccessResponse,
} from "@/types/chatbot";

const MAX_REQUEST_BYTES = 20_000;
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

let cachedOpenAIClient: OpenAI | null = null;
let cachedApiKey: string | null = null;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResponseContentPart = {
  type?: string;
  text?: string;
  refusal?: string;
};

type ResponseOutputItem = {
  type?: string;
  role?: string;
  content?: ResponseContentPart[];
};

type ResponseLike = {
  id?: string;
  status?: string;
  output_text?: string | null;
  output?: ResponseOutputItem[];
  incomplete_details?: {
    reason?: string;
  } | null;
};

function buildSystemInstructions(): string {
  const tone = CHATBOT_AGENT_CONFIG.toneRules.map((rule) => `- ${rule}`).join("\n");
  const scope = CHATBOT_AGENT_CONFIG.scopeRules.map((rule) => `- ${rule}`).join("\n");
  const context = CHATBOT_AGENT_CONFIG.productContext.map((item) => `- ${item}`).join("\n");
  const websiteContent = buildWebsiteContentForPrompt();

  return [
    CHATBOT_AGENT_CONFIG.systemPrompt.trim(),
    "",
    "Tone Rules:",
    tone,
    "",
    "Scope Rules:",
    scope,
    "",
    "Product Context:",
    context,
    "",
    "Website Content (authoritative):",
    websiteContent,
  ].join("\n");
}

function extractStatus(error: unknown): number {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }

  return 500;
}

function extractAssistantText(response: ResponseLike): string | null {
  const directText = sanitizeUserMessage(response.output_text ?? "");
  if (directText) {
    return directText;
  }

  if (!Array.isArray(response.output)) {
    return null;
  }

  const chunks: string[] = [];

  for (const item of response.output) {
    if (!item || !Array.isArray(item.content)) {
      continue;
    }

    for (const contentPart of item.content) {
      if (!contentPart || typeof contentPart !== "object") {
        continue;
      }

      if (
        (contentPart.type === "output_text" || contentPart.type === "text") &&
        typeof contentPart.text === "string"
      ) {
        chunks.push(contentPart.text);
      }

      if (contentPart.type === "refusal" && typeof contentPart.refusal === "string") {
        chunks.push(contentPart.refusal);
      }
    }
  }

  const joined = sanitizeUserMessage(chunks.join("\n\n"));
  return joined;
}

function summarizeModelOutput(response: ResponseLike): Array<Record<string, unknown>> {
  if (!Array.isArray(response.output)) {
    return [];
  }

  return response.output.map((item) => ({
    type: typeof item?.type === "string" ? item.type : "unknown",
    role: typeof item?.role === "string" ? item.role : "unknown",
    contentTypes: Array.isArray(item?.content)
      ? item.content.map((part) => (typeof part?.type === "string" ? part.type : "unknown"))
      : [],
  }));
}

function isIncompleteByMaxOutputTokens(response: ResponseLike): boolean {
  return (
    response.status === "incomplete" &&
    response.incomplete_details?.reason === "max_output_tokens"
  );
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "object" && error !== null) {
    const errorWithFields = error as {
      status?: unknown;
      requestID?: unknown;
      code?: unknown;
      param?: unknown;
      type?: unknown;
      error?: unknown;
      message?: unknown;
    };

    return {
      status: errorWithFields.status ?? null,
      requestID: errorWithFields.requestID ?? null,
      code: errorWithFields.code ?? null,
      param: errorWithFields.param ?? null,
      type: errorWithFields.type ?? null,
      message:
        typeof errorWithFields.message === "string"
          ? errorWithFields.message
          : "Unknown object error",
      error: errorWithFields.error ?? null,
    };
  }

  return { message: String(error) };
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  if (cachedOpenAIClient && cachedApiKey === apiKey) {
    return cachedOpenAIClient;
  }

  cachedOpenAIClient = new OpenAI({ apiKey });
  cachedApiKey = apiKey;
  return cachedOpenAIClient;
}

async function requestModelResponse(
  openaiClient: OpenAI,
  userMessageContent: string,
  sanitizedHistory: ReturnType<typeof sanitizeIncomingHistory>,
  maxOutputTokens: number,
): Promise<ResponseLike> {
  const response = await openaiClient.responses.create({
    model: CHATBOT_AGENT_CONFIG.model,
    ...(CHATBOT_AGENT_CONFIG.useTemperature
      ? { temperature: CHATBOT_AGENT_CONFIG.temperature }
      : {}),
    ...(CHATBOT_AGENT_CONFIG.useTopP ? { top_p: CHATBOT_AGENT_CONFIG.topP } : {}),
    max_output_tokens: maxOutputTokens,
    input: [
      {
        role: "system",
        content: buildSystemInstructions(),
      },
      ...sanitizedHistory.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      {
        role: "user",
        content: userMessageContent,
      },
    ],
  });

  return response as ResponseLike;
}

function readCookieValue(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawName, ...rawValueParts] = part.trim().split("=");
    if (rawName !== name) {
      continue;
    }

    const rawValue = rawValueParts.join("=");
    if (!rawValue) {
      return null;
    }

    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return null;
}

function resolveSessionId(request: Request): { sessionId: string; isNewSession: boolean } {
  const existingValue = readCookieValue(request, CHATBOT_AGENT_CONFIG.sessionCookieName);

  if (existingValue && SESSION_ID_PATTERN.test(existingValue)) {
    return {
      sessionId: existingValue,
      isNewSession: false,
    };
  }

  return {
    sessionId: createSessionId(),
    isNewSession: true,
  };
}

function shouldSetSecureCookie(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    const normalized = forwardedProto.split(",")[0]?.trim().toLowerCase();
    return normalized === "https";
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

function applySessionCookie(response: NextResponse, request: Request, sessionId: string): void {
  const maxAge = CHATBOT_AGENT_CONFIG.sessionMaxAgeDays * 24 * 60 * 60;

  response.cookies.set({
    name: CHATBOT_AGENT_CONFIG.sessionCookieName,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    secure: shouldSetSecureCookie(request),
    path: "/",
    maxAge,
  });
}

function applyExtraHeaders(
  response: NextResponse,
  headers: Record<string, string> | undefined,
): void {
  if (!headers) {
    return;
  }

  for (const [name, value] of Object.entries(headers)) {
    response.headers.set(name, value);
  }
}

function logRequestEvent(event: string, metadata: Record<string, unknown>): void {
  console.info(`[chatbot] ${event}`, metadata);
}

function errorResponse(
  status: number,
  payload: ChatbotApiErrorResponse,
  options?: {
    request?: Request;
    sessionId?: string;
    headers?: Record<string, string>;
  },
): NextResponse<ChatbotApiErrorResponse> {
  const response = NextResponse.json(payload, { status });

  applyExtraHeaders(response, options?.headers);

  if (options?.request && options.sessionId) {
    applySessionCookie(response, options.request, options.sessionId);
  }

  return response;
}

function historyResponse(
  history: ReturnType<typeof sanitizeIncomingHistory>,
  request: Request,
  sessionId: string,
): NextResponse<ChatbotApiHistoryResponse> {
  const response = NextResponse.json({ history });
  applySessionCookie(response, request, sessionId);
  return response;
}

function enforceOriginPolicy(
  request: Request,
  sessionId: string,
  ip: string,
): NextResponse<ChatbotApiErrorResponse> | null {
  const originCheck = checkRequestOrigin(request);
  if (originCheck.allowed) {
    return null;
  }

  console.warn("[chatbot] blocked by origin policy", {
    ip,
    sessionId,
    origin: originCheck.origin,
    reason: originCheck.reason,
    allowedOrigins: originCheck.allowedOrigins,
  });

  return errorResponse(
    403,
    { error: "Origin is not allowed for this endpoint." },
    { request, sessionId },
  );
}

export async function GET(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request);
  const { sessionId, isNewSession } = resolveSessionId(request);

  recordTrafficAndMaybeAlert(ip, sessionId);

  const originBlockedResponse = enforceOriginPolicy(request, sessionId, ip);
  if (originBlockedResponse) {
    return originBlockedResponse;
  }

  const history = sanitizeIncomingHistory(readSessionHistory(sessionId));

  logRequestEvent("history_read", {
    ip,
    sessionId,
    historyCount: history.length,
    isNewSession,
  });

  return historyResponse(history, request, sessionId);
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request);
  const { sessionId } = resolveSessionId(request);

  recordTrafficAndMaybeAlert(ip, sessionId);

  const originBlockedResponse = enforceOriginPolicy(request, sessionId, ip);
  if (originBlockedResponse) {
    return originBlockedResponse;
  }

  clearSessionHistory(sessionId);

  logRequestEvent("history_cleared", {
    ip,
    sessionId,
  });

  return historyResponse([], request, sessionId);
}

export async function POST(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request);
  const { sessionId } = resolveSessionId(request);

  recordTrafficAndMaybeAlert(ip, sessionId);

  const originBlockedResponse = enforceOriginPolicy(request, sessionId, ip);
  if (originBlockedResponse) {
    return originBlockedResponse;
  }

  const rateLimit = checkRateLimits(ip, sessionId);
  if (!rateLimit.allowed) {
    console.warn("[chatbot] rate limit exceeded", {
      ip,
      sessionId,
      scope: rateLimit.scope,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });

    return errorResponse(
      429,
      {
        error: "Too many requests. Please wait a moment and try again.",
      },
      {
        request,
        sessionId,
        headers: rateLimit.headers,
      },
    );
  }

  const openaiClient = getOpenAIClient();
  if (!openaiClient) {
    console.error("[chatbot] OPENAI_API_KEY is missing in the running process environment");
    return errorResponse(
      500,
      {
        error: "Chatbot is not configured yet. Set OPENAI_API_KEY on the server.",
      },
      {
        request,
        sessionId,
        headers: rateLimit.headers,
      },
    );
  }

  const { tooLarge, rawBody } = await readRawBodyWithLimit(request, MAX_REQUEST_BYTES);
  if (tooLarge) {
    return errorResponse(
      413,
      { error: "Request body is too large." },
      {
        request,
        sessionId,
        headers: rateLimit.headers,
      },
    );
  }

  let body: ChatbotApiRequest;
  try {
    body = JSON.parse(rawBody) as ChatbotApiRequest;
  } catch {
    return errorResponse(
      400,
      { error: "Invalid JSON body." },
      {
        request,
        sessionId,
        headers: rateLimit.headers,
      },
    );
  }

  const userMessageContent = sanitizeUserMessage(body?.message);
  if (!userMessageContent) {
    return errorResponse(
      400,
      { error: "Message is required." },
      {
        request,
        sessionId,
        headers: rateLimit.headers,
      },
    );
  }

  const historyFromSession = readSessionHistory(sessionId);
  const sanitizedHistory = sanitizeIncomingHistory(historyFromSession);
  const userMessage = createChatMessage("user", userMessageContent);

  try {
    logRequestEvent("request_started", {
      ip,
      sessionId,
      messageLength: userMessageContent.length,
      historyCount: sanitizedHistory.length,
    });

    let response = await requestModelResponse(
      openaiClient,
      userMessageContent,
      sanitizedHistory,
      CHATBOT_AGENT_CONFIG.maxOutputTokens,
    );
    let assistantText = extractAssistantText(response);

    if (!assistantText && isIncompleteByMaxOutputTokens(response)) {
      console.warn("[chatbot] retrying due to max_output_tokens incomplete response", {
        model: CHATBOT_AGENT_CONFIG.model,
        responseId: response.id ?? null,
        firstMaxOutputTokens: CHATBOT_AGENT_CONFIG.maxOutputTokens,
        retryMaxOutputTokens: CHATBOT_AGENT_CONFIG.retryMaxOutputTokens,
      });

      response = await requestModelResponse(
        openaiClient,
        userMessageContent,
        sanitizedHistory,
        CHATBOT_AGENT_CONFIG.retryMaxOutputTokens,
      );
      assistantText = extractAssistantText(response);
    }

    if (!assistantText) {
      console.error("[chatbot] model returned no text output", {
        model: CHATBOT_AGENT_CONFIG.model,
        responseId: response.id ?? null,
        responseStatus: response.status ?? null,
        incompleteDetails: response.incomplete_details ?? null,
        outputSummary: summarizeModelOutput(response),
      });

      throw new Error("Model returned no text output.");
    }

    const assistantMessage = createChatMessage("assistant", assistantText);
    const nextHistory = writeSessionHistory(
      sessionId,
      buildCookiePayload([...sanitizedHistory, userMessage, assistantMessage]).messages,
    );

    const payload: ChatbotApiSuccessResponse = {
      reply: assistantMessage,
      history: nextHistory,
    };

    const responsePayload = NextResponse.json(payload);
    applySessionCookie(responsePayload, request, sessionId);
    applyExtraHeaders(responsePayload, rateLimit.headers);

    logRequestEvent("request_succeeded", {
      ip,
      sessionId,
      historyCount: nextHistory.length,
    });

    return responsePayload;
  } catch (error: unknown) {
    const status = extractStatus(error);
    const safeStatus = status === 429 ? 429 : 500;
    const fallbackReply = createChatMessage(
      "assistant",
      CHATBOT_AGENT_CONFIG.errorFallbackMessage,
    );
    const nextHistory = writeSessionHistory(
      sessionId,
      buildCookiePayload([...sanitizedHistory, userMessage, fallbackReply]).messages,
    );

    console.error("[chatbot] request failed", {
      model: CHATBOT_AGENT_CONFIG.model,
      safeStatus,
      ip,
      sessionId,
      error: serializeError(error),
    });

    return errorResponse(
      safeStatus,
      {
        error:
          safeStatus === 429
            ? "Too many requests. Please wait a moment and try again."
            : "Chatbot request failed. Please try again.",
        reply: fallbackReply,
        history: nextHistory,
      },
      {
        request,
        sessionId,
        headers: rateLimit.headers,
      },
    );
  }
}
