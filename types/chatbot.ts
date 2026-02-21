export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ChatbotCookiePayload = {
  v: 1;
  messages: ChatMessage[];
};

export type ChatbotApiRequest = {
  message: string;
  history?: ChatMessage[];
};

export type ChatbotApiSuccessResponse = {
  reply: ChatMessage;
  history: ChatMessage[];
};

export type ChatbotApiHistoryResponse = {
  history: ChatMessage[];
};

export type ChatbotApiErrorResponse = {
  error: string;
  reply?: ChatMessage;
  history?: ChatMessage[];
};
