# Chatbot Implementation Plan (Bottom-Right Widget + OpenAI SDK + Cookie History)

## 1. Objective
Implement a production-ready chatbot anchored in the bottom-right corner of the website so prospective customers can ask questions and receive helpful answers about Pensador.

Required outcomes:
- Chatbot is visible on all pages as a floating launcher.
- Conversation uses the OpenAI SDK through a secure server endpoint.
- System prompt and model/runtime settings are editable in one dedicated file.
- Each visitor keeps their own chat history in browser cookies.

## 2. Current Project Constraints
- The project is a Next.js App Router app.
- `next.config.ts` currently uses `output: "export"` (fully static export).
- A secure OpenAI SDK integration needs server-side code (API route), which is not compatible with a purely static export-only deployment.

Decision required before coding:
- Recommended: switch from static export to server-capable deployment (Vercel/Node) and add an API route in this repo.
- Alternative: keep static frontend and call a separate backend service that hosts OpenAI logic.

This plan assumes the recommended approach (server-capable Next.js deployment).

## 3. Target Architecture
1. Frontend widget:
- Floating button in bottom-right.
- Expandable chat panel with message list, input, send button, clear history, and close action.

2. Backend API:
- `POST /api/chatbot` route handler.
- Receives user message + recent cookie history.
- Loads prompt and model settings from one editable file.
- Calls OpenAI SDK server-side.
- Returns assistant response as JSON.

3. Prompt and model management:
- Dedicated editable file for prompt and OpenAI runtime config.
- This file controls model, temperature, max output tokens, and style rules.
- Config imported by API route at runtime.

4. Per-user persistence:
- Cookie stores recent conversation history.
- History is read on widget load and rewritten after each turn.
- Because cookies are per browser/user, each visitor has an independent chat history.

## 4. File-by-File Implementation Map

New files:
- `content/chatbot-system-prompt.ts`
- `types/chatbot.ts`
- `lib/chatbot/cookie-store.ts`
- `lib/chatbot/history.ts`
- `app/api/chatbot/route.ts`
- `components/chatbot/chatbot-widget.tsx`
- `components/chatbot/use-chatbot.ts`
- `components/chatbot/chatbot-types.ts` (optional if shared types remain frontend-only)
- `CHATBOT_IMPLEMENTATION.md` (this file)

Modified files:
- `next.config.ts` (remove `output: "export"` or gate by env)
- `app/layout.tsx` (mount chatbot widget globally)
- `.env.example` (add OpenAI variables)
- `package.json` (add `openai` dependency)
- `README.md` and/or `HOW_TO_RUN.md` (document chatbot setup)

## 5. Detailed Execution Plan

## Phase 0 - Deployment Mode Alignment (Blocker)
1. Update deployment strategy:
- Remove `output: "export"` from `next.config.ts` for environments where chatbot is enabled.

2. Keep optional static mode if needed:
- Add environment flag:
  - `CHATBOT_ENABLED=true|false`
  - If `false`, hide chatbot component and skip API route usage.

Exit criteria:
- Local `npm run dev` supports API routes.
- Production target supports server runtime.

## Phase 1 - Dependencies and Environment
1. Install OpenAI SDK:
- `npm install openai`

2. Add environment variables to `.env.example`:
- `OPENAI_API_KEY=`
- `CHATBOT_ENABLED=true`
- `CHATBOT_MAX_HISTORY_MESSAGES=12`

3. Document environment setup in `HOW_TO_RUN.md`.

Exit criteria:
- App boots with no missing env errors.

## Phase 2 - Editable Prompt + Model Config (Single File)
1. Create `content/chatbot-system-prompt.ts` with one exported config object:
- `CHATBOT_AGENT_CONFIG`

2. Keep this file business-editable:
- Plain text blocks only.
- Minimal logic; mostly declarative configuration.

Example structure:
```ts
export const CHATBOT_AGENT_CONFIG = {
  model: "gpt-4.1-mini",
  temperature: 0.4,
  maxOutputTokens: 500,
  topP: 1,
  systemPrompt: `
You are Pensador's website assistant.
Help prospective customers understand features, pricing tiers, and onboarding steps.
If information is uncertain, say so clearly.
`,
  toneRules: [
    "Be concise and practical.",
    "Do not invent unavailable product details."
  ],
  scopeRules: [
    "Focus on product, pricing, onboarding, and support questions."
  ]
} as const;
```

3. Import `CHATBOT_AGENT_CONFIG` in the API route so prompt and model edits apply without touching route logic.

Exit criteria:
- Prompt plus model/runtime settings can be changed from one file and reflected in responses.

## Phase 3 - Chat Types and Data Contract
1. Add shared chat types in `types/chatbot.ts`:
- `ChatRole = "user" | "assistant"`
- `ChatMessage { id, role, content, createdAt }`
- Request/response DTOs for API route.

2. Define API request payload:
- `message: string`
- `history: ChatMessage[]` (recent turns from cookie)

3. Define API response payload:
- `reply: ChatMessage`
- `history: ChatMessage[]` (sanitized and trimmed)

Exit criteria:
- Strict typing exists for frontend/backend exchange.

## Phase 4 - Cookie History Store
1. Build `lib/chatbot/cookie-store.ts`:
- `readChatCookie()`
- `writeChatCookie(history)`
- `clearChatCookie()`

2. Cookie spec:
- Name: `pensador_chat_v1`
- Max age: 30 days
- Path: `/`
- `sameSite=lax`
- `secure=true` in production

3. Size-safe strategy (important):
- Cookie limit is about 4 KB.
- Keep only most recent N messages (for example 8 to 12).
- Trim message length (for example 400 to 600 chars per message).
- If serialized payload is too large, drop oldest messages until it fits.

4. Validation:
- Parse JSON defensively.
- If malformed, reset cookie and start new history.

Exit criteria:
- Each browser session retains recent history and survives reloads.

## Phase 5 - API Route with OpenAI SDK
1. Create `app/api/chatbot/route.ts`:
- Validate method and payload.
- Load `CHATBOT_AGENT_CONFIG` from `content/chatbot-system-prompt.ts`.
- Sanitize and cap incoming history.

2. Call OpenAI SDK server-side:
```ts
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```
- Use `responses.create` (or the current recommended endpoint/version in SDK).
- Use `CHATBOT_AGENT_CONFIG.model`, `temperature`, and `maxOutputTokens` in request params.
- Input order:
  1. System prompt
  2. Trimmed history
  3. New user message

3. Return structured JSON reply:
- Assistant text
- Updated history for frontend cookie write

4. Add error handling:
- User-friendly fallback message
- Avoid leaking internal errors
- HTTP status mapping (`400`, `429`, `500`)

5. Basic abuse controls:
- Optional simple rate limiting by IP + session cookie key.
- Request body size limits.

Exit criteria:
- API returns coherent response using OpenAI with safe error handling.

## Phase 6 - Bottom-Right Chat UI
1. Create `components/chatbot/chatbot-widget.tsx`:
- `position: fixed; right: 16px; bottom: 16px; z-index` above navigation.
- Mobile-safe spacing so it does not clash with bottom nav.

2. UI features:
- Collapsed launcher button (chat icon + label).
- Expanded panel with:
  - Header/title
  - Scrollable messages
  - Textarea/input
  - Send button
  - Clear history button
  - Typing/loading state

3. Accessibility:
- Keyboard focus management.
- `aria-label` on controls.
- Escape key closes panel.
- Sufficient color contrast and focus states.

4. Integrate globally:
- Add `<ChatbotWidget />` to `app/layout.tsx` so all pages get it.

Exit criteria:
- Widget is usable on desktop and mobile on every page.

## Phase 7 - Frontend Chat State Hook
1. Create `components/chatbot/use-chatbot.ts`:
- Load history from cookie on mount.
- Maintain state: `isOpen`, `messages`, `input`, `isLoading`, `error`.
- On send:
  - Optimistically append user message
  - Call `/api/chatbot`
  - Append assistant reply
  - Rewrite cookie with trimmed history

2. Handle edge cases:
- Empty input
- Slow network
- API failure fallback message
- Prevent double send while request is in-flight

Exit criteria:
- End-to-end chat loop works with cookie persistence.

## Phase 8 - Content Guardrails for Customer Support Context
1. Prompt rules should include:
- Stay focused on product/site doubts.
- Provide concise, accurate guidance.
- Avoid inventing pricing/features not present in known content.
- If uncertain, direct user to support/contact channels.

2. Optional knowledge grounding:
- Import key text from `content/site-copy.ts` so answers stay aligned with site messaging.

Exit criteria:
- Bot responses are relevant to customer questions and consistent with website copy.

## Phase 9 - QA, Testing, and Validation
1. Manual QA checklist:
- Open/close behavior on all routes.
- Cookie persistence after refresh.
- History is isolated per browser profile.
- Clear history removes cookie data.
- Mobile layout does not overlap bottom nav.
- Dark/light mode readability.

2. API QA:
- Missing/invalid payload handling.
- Error fallback rendering.
- Very long input trimming.

3. Dev checks:
- `npm run lint`
- Build/start in server mode.

Exit criteria:
- No blocking UX or runtime errors in manual test matrix.

## Phase 10 - Rollout and Monitoring
1. Controlled rollout:
- Enable behind `CHATBOT_ENABLED`.
- Start in staging, then production.

2. Track key metrics:
- Chat opens
- Messages sent
- Resolved vs escalated conversations
- CTA click after chat interaction

3. Maintenance loop:
- Weekly tuning of prompt and generation settings in `content/chatbot-system-prompt.ts`.
- Monthly model/cost review using the same config file.

Exit criteria:
- Stable production behavior with observable usage metrics.

## 6. Cookie Data Model (Proposed)
```json
{
  "v": 1,
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "What is Pensador?",
      "createdAt": "2026-02-19T15:30:00.000Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Pensador is ...",
      "createdAt": "2026-02-19T15:30:02.000Z"
    }
  ]
}
```

Storage policy:
- Keep newest messages only.
- Enforce a serialized byte limit under cookie cap.

## 7. Security and Privacy Requirements
- Never expose `OPENAI_API_KEY` to the client.
- Keep OpenAI requests server-side only.
- Do not store sensitive personal data intentionally in cookies.
- Add short privacy notice in chat UI:
  - "Conversation is stored in your browser cookies to preserve context."
- Provide clear-history control.

## 8. Acceptance Criteria
- Chat launcher appears in the bottom-right corner across site pages.
- User can send and receive messages through OpenAI SDK-backed API.
- System prompt, model, and generation parameters can be edited in one dedicated source file.
- Chat history persists in cookies and reloads for that same browser/user.
- History can be cleared by the user.
- Implementation passes lint and manual QA checklist.

## 9. Estimated Delivery (Single Developer)
- Day 1:
  - Deployment mode alignment
  - Dependency/env setup
  - Prompt file + API route scaffold
- Day 2:
  - Chat widget UI
  - Cookie storage + hook logic
  - End-to-end integration
- Day 3:
  - QA hardening
  - Error handling
  - Docs and rollout flag

## 10. Post-Launch Enhancements (Optional)
- Stream token-by-token responses in UI.
- Add multilingual support.
- Add retrieval from FAQ/content docs.
- Persist long-term history server-side (if cookie limits become restrictive).
