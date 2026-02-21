"use client";

import { useEffect, useRef } from "react";

import { CHATBOT_AGENT_CONFIG } from "@/content/chatbot-system-prompt";
import { cn } from "@/lib/cn";

import { useChatbot } from "./use-chatbot";

const CHATBOT_IS_ENABLED =
  CHATBOT_AGENT_CONFIG.uiEnabled &&
  process.env.NEXT_PUBLIC_CHATBOT_ENABLED !== "false";

export function ChatbotWidget(): React.JSX.Element | null {
  const {
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
  } = useChatbot();
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const container = messagesRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [isOpen, isLoading, messages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, setIsOpen]);

  if (!CHATBOT_IS_ENABLED) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-md flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section
          className="pointer-events-auto w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-emerald-500/15 dark:bg-slate-950"
          aria-label={CHATBOT_AGENT_CONFIG.panelTitle}
        >
          <header className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-emerald-500/15">
            <div>
              <p className="font-display text-sm font-semibold text-text">
                {CHATBOT_AGENT_CONFIG.panelTitle}
              </p>
              <p className="mt-1 text-xs text-text-subtle">
                {CHATBOT_AGENT_CONFIG.panelSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-text transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 dark:border-emerald-500/15 dark:hover:bg-slate-900"
              aria-label="Close chatbot"
            >
              Close
            </button>
          </header>

          <div
            ref={messagesRef}
            className="h-80 space-y-3 overflow-y-auto px-4 py-3"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="chat-message-assistant rounded-xl p-3 text-sm text-text-subtle">
                {CHATBOT_AGENT_CONFIG.emptyStateMessage}
              </div>
            ) : null}

            {messages.map((message) => (
              <article
                key={message.id}
                className={cn(
                  "max-w-[90%] rounded-xl p-3 text-sm leading-6",
                  message.role === "user"
                    ? "chat-message-user ml-auto text-text"
                    : "chat-message-assistant mr-auto text-text",
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </article>
            ))}

            {isLoading ? (
              <article className="chat-message-assistant mr-auto max-w-[90%] rounded-xl p-3 text-sm text-text-subtle">
                {CHATBOT_AGENT_CONFIG.loadingMessage}
              </article>
            ) : null}
          </div>

          <div className="border-t border-gray-200 px-4 py-3 dark:border-emerald-500/15">
            {error ? (
              <p className="mb-2 text-xs text-red-600 dark:text-red-400">{error}</p>
            ) : null}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
              className="space-y-2"
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={2}
                placeholder={CHATBOT_AGENT_CONFIG.inputPlaceholder}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-text shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 dark:border-emerald-500/15 dark:bg-slate-950"
                aria-label="Type your question"
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={clearHistory}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-text-subtle transition hover:bg-gray-100 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:hover:bg-slate-900"
                >
                  Clear history
                </button>
                <button
                  type="submit"
                  disabled={!canSend}
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                >
                  Send
                </button>
              </div>
            </form>

            <p className="mt-2 text-[11px] leading-4 text-text-subtle">
              {CHATBOT_AGENT_CONFIG.storageNotice}
            </p>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 dark:border-emerald-400/40 dark:from-emerald-600 dark:to-emerald-500 dark:hover:from-emerald-700 dark:hover:to-emerald-600"
        aria-label="Open chatbot"
      >
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full bg-white/90"
        />
        {CHATBOT_AGENT_CONFIG.launcherLabel}
      </button>
    </div>
  );
}

