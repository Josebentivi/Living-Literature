"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { CHATBOT_AGENT_CONFIG } from "@/content/chatbot-system-prompt";
import {
  buildCookiePayload,
  createChatMessage,
  sanitizeIncomingHistory,
  sanitizeUserMessage,
} from "@/lib/chatbot/history";
import type {
  ChatMessage,
  ChatbotApiErrorResponse,
  ChatbotApiHistoryResponse,
  ChatbotApiRequest,
  ChatbotApiSuccessResponse,
} from "@/types/chatbot";

type UseChatbotState = {
  isOpen: boolean;
  setIsOpen: (next: boolean) => void;
  input: string;
  setInput: (value: string) => void;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  canSend: boolean;
  sendMessage: () => Promise<void>;
  clearHistory: () => Promise<void>;
};

function isSuccessResponse(
  payload: ChatbotApiSuccessResponse | ChatbotApiErrorResponse | null,
): payload is ChatbotApiSuccessResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  return "reply" in payload && "history" in payload;
}

function isErrorResponse(
  payload: ChatbotApiSuccessResponse | ChatbotApiErrorResponse | null,
): payload is ChatbotApiErrorResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  return "error" in payload;
}

function isHistoryResponse(payload: unknown): payload is ChatbotApiHistoryResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  return "history" in payload;
}

export function useChatbot(): UseChatbotState {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadServerHistory(): Promise<void> {
      try {
        const response = await fetch("/api/chatbot", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          return;
        }

        const parsed = (await response.json()) as ChatbotApiHistoryResponse | null;
        if (!active || !isHistoryResponse(parsed)) {
          return;
        }

        setMessages(sanitizeIncomingHistory(parsed.history));
      } catch {
        // Load failures should not block UI usage.
      }
    }

    void loadServerHistory();

    return () => {
      active = false;
    };
  }, []);

  const persistMessages = useCallback((nextMessages: ChatMessage[]): ChatMessage[] => {
    const compact = buildCookiePayload(nextMessages).messages;
    setMessages(compact);
    return compact;
  }, []);

  const canSend = useMemo(
    () => !isLoading && Boolean(sanitizeUserMessage(input)),
    [input, isLoading],
  );

  const clearHistory = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch("/api/chatbot", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      let parsed: ChatbotApiHistoryResponse | null = null;
      try {
        parsed = (await response.json()) as ChatbotApiHistoryResponse;
      } catch {
        parsed = null;
      }

      if (response.ok && isHistoryResponse(parsed)) {
        setMessages(sanitizeIncomingHistory(parsed.history));
        return;
      }
    } catch {
      // Fall through to local clear.
    }

    setMessages([]);
  }, []);

  const sendMessage = useCallback(async () => {
    if (isLoading) {
      return;
    }

    const normalizedInput = sanitizeUserMessage(input);
    if (!normalizedInput) {
      return;
    }

    const baseHistory = sanitizeIncomingHistory(messages);
    const userMessage = createChatMessage("user", normalizedInput);
    const optimisticHistory = persistMessages([...baseHistory, userMessage]);

    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const payload: ChatbotApiRequest = {
        message: normalizedInput,
      };

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let parsed: ChatbotApiSuccessResponse | ChatbotApiErrorResponse | null = null;
      try {
        parsed = (await response.json()) as
          | ChatbotApiSuccessResponse
          | ChatbotApiErrorResponse;
      } catch {
        parsed = null;
      }

      if (response.ok && isSuccessResponse(parsed)) {
        persistMessages(parsed.history);
        return;
      }

      if (isErrorResponse(parsed)) {
        setError(parsed.error);
        if (parsed.history) {
          persistMessages(parsed.history);
          return;
        }
      } else {
        setError("Chatbot request failed. Please try again.");
      }

      const fallbackReply = createChatMessage(
        "assistant",
        CHATBOT_AGENT_CONFIG.errorFallbackMessage,
      );
      persistMessages([...optimisticHistory, fallbackReply]);
    } catch {
      setError("Network error while contacting the chatbot.");
      const fallbackReply = createChatMessage(
        "assistant",
        CHATBOT_AGENT_CONFIG.errorFallbackMessage,
      );
      persistMessages([...optimisticHistory, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, persistMessages]);

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    messages,
    isLoading,
    error,
    canSend,
    sendMessage,
    clearHistory,
  };
}
