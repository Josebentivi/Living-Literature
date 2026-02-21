# Pensador — AI-Powered Philosophical Reasoning Platform

## The Vision

**Pensador** is a complete AI ecosystem that combines real-time conversational AI with deep philosophical analysis. It spans three interconnected production systems: a full-stack web application, a multi-agent research API, and an MCP-compliant reasoning server — all working together to deliver a unique experience where users can chat with AI, explore ideas through the lens of history's greatest thinkers, and receive structured multi-perspective analysis on any topic.

The name "Pensador" (Portuguese for "Thinker") reflects the platform's core mission: to augment human thought by connecting modern AI with centuries of accumulated philosophical, psychological, and theological wisdom.

---

## The Platform at a Glance

| Component | What It Does | Built With |
|---|---|---|
| **Pensador Web App** | Full-stack AI chat platform with streaming, subscriptions, tools, and admin console | Next.js 16, React 18, TypeScript, Supabase, Stripe |
| **Six Thinking Hats API** | Multi-agent research engine applying 6 parallel reasoning perspectives over a philosophical knowledge base | FastAPI, OpenAI, hnswlib, Supabase |
| **MCP Reasoning Server** | Protocol-compliant server exposing 10+ philosopher search tools and 4 specialized analysis agents | Python, FastMCP, OpenAI, MCP Protocol |

---

## What Makes Pensador Unique

### 1. Real-Time AI Conversations — Production-Ready

The web app delivers a polished, real-time chat experience powered by OpenAI's Responses API with full streaming support. Unlike simple chatbot wrappers, the streaming pipeline is a 1,000+ line implementation that handles every edge case of a production system.

**How streaming works end-to-end:**

1. The user types a message in the `ChatInterface` component and hits send.
2. The frontend opens a `POST` request to `/api/stream`, sending the full message history, the selected model tier, the active tool (if any), and the conversation ID.
3. The server authenticates the user via Supabase cookies, verifies the user's tier allows the selected model, and checks daily tool credit limits by calling the `increment_daily_tool_usage` database function. If credits are exhausted, it returns a `429 Too Many Requests`.
4. The server creates an OpenAI Responses API request with `stream: true`, wraps it in an `AbortController` with a configurable timeout (default 110 seconds), and pipes token-level deltas through a `ReadableStream` via `TextEncoder`.
5. On the frontend, a `ReadableStream` consumer accumulates text in real time, updating the message bubble character by character. It also watches for `[[ERROR]]` markers injected by the server to detect mid-stream failures.
6. When streaming completes, the server persists the full exchange: a `chat_runs` record (request/response payloads, token counts, latency), an `api_usage` record (endpoint, status, response time), and individual `tool_invocations` records for any MCP or function calls the model made.

Users can **stop generation mid-stream** (the AbortController cancels the OpenAI request), **regenerate** a response (replays the last user message), view **reasoning summaries** extracted from the model's chain-of-thought, and read beautifully rendered **Markdown with GitHub Flavored Markdown** support and HTML sanitization to prevent XSS.

**Conversation management** goes well beyond basic chat history. Conversations are persistent, searchable by keyword, and organizable with a flexible **tag system** that supports both AND logic ("show conversations with tag A *and* tag B") and OR logic ("show conversations with tag A *or* tag B"). Users can export any conversation to Markdown or copy it to the clipboard with a single click. Each conversation has full CRUD operations — create, rename, delete — with a responsive sidebar on desktop and bottom navigation on mobile.

### 2. Multi-Agent Philosophical Reasoning

At the heart of the platform is a multi-agent system built on Edward de Bono's **Six Thinking Hats** methodology — a structured decision-making framework where each "hat" represents a distinct mode of thinking. When applied to AI, this means the system doesn't give you one answer; it gives you six complementary perspectives on any question, each grounded in real philosophical texts.

**How the multi-agent orchestration works:**

1. **Query Decomposition** — An orchestrator agent (GPT-5-nano with reasoning enabled) receives the user's question and decomposes it into six structured sub-questions, one for each hat. It uses automatic retry logic (up to 3 attempts) to ensure valid JSON output. Each sub-question is tailored to the hat's perspective — for example, the Black Hat sub-question focuses on risks, while the Green Hat sub-question focuses on creative alternatives.

2. **Parallel Agent Dispatch** — Five hat agents are dispatched simultaneously via Python's `ThreadPoolExecutor` (6 workers max). Each agent receives its sub-question, a detailed system prompt (700+ lines) defining its output contract, and access to 9 semantic search tools (one per philosopher). The agents run on GPT-5.2 with high reasoning effort.

3. **Iterative Tool-Use Loop** — Each agent doesn't just answer from its training data. It enters an iterative function-calling loop (up to 10 iterations) where the LLM can call semantic search tools, receive results from the philosopher knowledge base, reason over them, search again with refined queries, and progressively build a deeply grounded analysis. This means each agent actively researches its answer by querying the works of Freud, Nietzsche, Augustine, and others.

4. **Blue Hat Synthesis** — After all five parallel agents complete, the Blue Hat (meta-cognition) runs sequentially. It receives all five analyses and produces a final synthesis: prioritized recommendations, areas of consensus and conflict across perspectives, and an actionable summary.

**The six perspectives in detail:**

| Hat | Perspective | What It Does |
|---|---|---|
| **White Hat** | Facts & Data | Focuses on objective metrics, verifiable facts, evidence hierarchies, and operational definitions. Proposes measurement strategies. |
| **Red Hat** | Emotions & Values | Explores human motivations, fear, desire, identity, and values in conflict. Maps emotional hypotheses and conflicting values. |
| **Black Hat** | Risks & Criticism | Acts as "devil's advocate" — identifies failure modes, edge cases, legal/compliance risks, and viability concerns. Proposes kill criteria. |
| **Yellow Hat** | Benefits & Optimism | Builds the case for value — identifies value mechanisms, ROI, success metrics, and adoption strategies. |
| **Green Hat** | Creativity & Alternatives | Reframes problems entirely, proposes unconventional solutions, and designs cheap experiments to test hypotheses. |
| **Blue Hat** | Meta-Synthesis | Integrates all five perspectives into a coherent, prioritized, and actionable report. |

Each agent produces **mandatory analytical sections** with deep questions, philosopher references (book name, page number, direct quotes), and structured frameworks — enforced by 700+ lines of system prompts that define the exact output contract.

### 3. Retrieval-Augmented Generation (RAG) at Scale

RAG is the technique that prevents the AI from hallucinating: instead of generating answers purely from training data, the system first retrieves relevant real documents and then reasons over them. Pensador implements a complete, production-grade RAG pipeline:

- **3,072-dimensional embeddings** via OpenAI's `text-embedding-3-large` — each text query is converted into a high-dimensional vector that captures its semantic meaning. The 3,072-dimension space provides fine-grained semantic resolution, allowing the system to distinguish between subtly different philosophical concepts.

- **HNSW vector indices** (Hierarchical Navigable Small World graphs) — 10 pre-built binary indices, one per author, each ranging from 2 to 300 MB. HNSW is an approximate nearest-neighbor algorithm that achieves near-perfect recall with logarithmic search time, even across thousands of documents. The indices are built offline and loaded at startup for fast query response.

- **Supabase (PostgreSQL)** storing full document content with **page-level granularity** — after vector search identifies the most relevant document IDs, the system queries Supabase to retrieve the actual text, the book title, and the exact page number. This means every citation in an analysis links back to a real page in a real book.

- **Iterative tool-use loops** — agents don't make a single search and stop. They can call search tools up to 10 times per analysis, progressively refining their queries based on what they've found so far. An agent might search "Nietzsche on suffering," read the results, then refine to "Nietzsche eternal recurrence as affirmation" — building understanding iteratively, the way a human researcher would.

**The 10 authors in the knowledge base:**

| Author | Domain | Key Works |
|---|---|---|
| **Sigmund Freud** | Psychoanalysis | The Interpretation of Dreams, Civilization and Its Discontents |
| **Carl Jung** | Analytical Psychology | Archetypes, The Red Book |
| **Friedrich Nietzsche** | Philosophy | Thus Spoke Zarathustra, Beyond Good and Evil |
| **Michel Foucault** | Post-structuralism | Discipline and Punish, History of Sexuality |
| **Augustine of Hippo** | Theology | Confessions, City of God |
| **Thomas Aquinas** | Scholastic Philosophy | Summa Theologica |
| **Martin Luther** | Reformation Theology | The 95 Theses, On Christian Liberty |
| **Jiddu Krishnamurti** | Spiritual Philosophy | Freedom from the Known |
| **Paulo (Apostle Paul)** | Biblical Theology | Epistles |
| **Additional authors** | Various | Expanded library |

### 4. MCP Protocol Integration

The **Model Context Protocol (MCP)** is a standard that allows AI models to call external tools in a structured, interoperable way. Pensador's MCP server exposes the entire philosophical knowledge base as standards-compliant tools that any MCP-compatible LLM client can consume — not just the Pensador web app.

**What the MCP server exposes:**

- **10+ semantic search tools** (one per philosopher/author) — each tool accepts a text query and returns the most relevant passages from that author's works, complete with book names, page numbers, and content excerpts.

- **4 specialized analysis agents** — each applying a different philosophical methodology to interpret texts:
  - **Decompositor** — Breaks down complex concepts into constituent parts, analyzing logical structure, premises, and conclusions
  - **Hermeneutico** — Applies hermeneutic methodology: interpreting texts within their historical context, authorial intent, and layers of meaning
  - **Fenomenologo** — Uses phenomenological analysis: examining how concepts appear to consciousness, bracketing presuppositions, and describing lived experience
  - **Critico** — Performs critical analysis: questioning power structures, hidden assumptions, ideological underpinnings, and internal contradictions

- A **tiered access model** built directly into the tool layer:
  - **Free tier**: 5 search results per query, basic author set
  - **Pro tier**: 15 search results per query, extended library
  - **Max tier**: 25-30 search results per query, full library with additional metadata

**How MCP integration works in the web app:**

1. The MCP server URL, authentication token, and label are configured via environment variables (`MCP_SERVER_URL`, `MCP_SERVER_AUTHORIZATION`, `MCP_SERVER_LABEL`).
2. When a user sends a chat message with a tool selected, the `/api/stream` endpoint injects the MCP tools into the OpenAI Responses API request.
3. OpenAI's model decides whether to call a tool based on the conversation context. If it does, the call goes to the MCP server, which performs the semantic search and returns results.
4. The results are fed back into the model, which synthesizes them into the final response.
5. Every tool invocation is tracked in the `tool_invocations` database table with full metadata: call ID, arguments, output, latency, and status.
6. **Graceful fallback**: if the MCP server is unreachable or times out, the system automatically retries without MCP tools, so the user still gets a response (just without the philosophical citations).

### 5. SaaS-Ready Architecture

Pensador is built as a real SaaS product with full subscription infrastructure — not a prototype or demo. Every layer enforces the tier model:

| Tier | Model Access | Tool Credits (Daily) | Features |
|---|---|---|---|
| **Free** | Basic models (gpt-5-nano) | Limited (e.g., 1 search/day) | Chat, basic search, conversation history |
| **Pro** | Expanded models, higher token limits | Moderate (e.g., 10 searches/day, 5 analyses/day) | Deep search, analysis tools, priority support |
| **Max** | Premium models, maximum token limits | Unlimited or very high | All tools, full reasoning effort, all features |
| **Beta** | Early access to experimental features | Configurable | Testing new capabilities before general release |
| **Admin** | All models, all features | Unlimited | Full admin console access, system configuration |

**How billing works:**

1. **Checkout**: When a user clicks "Upgrade" on the `/upgrade` page, the app creates a Stripe Checkout Session via `POST /api/stripe/checkout` with the appropriate price ID (`STRIPE_PRICE_ID_PRO` or `STRIPE_PRICE_ID_MAX`). The user is redirected to Stripe's hosted payment page.
2. **Webhook-driven tier updates**: When Stripe processes the payment, it sends a webhook event to `POST /api/stripe/webhook`. The server verifies the webhook signature (using `STRIPE_WEBHOOK_SECRET`), then automatically updates the user's `user_tier` in the database. This means tier changes happen in real time — the user's access upgrades the moment their payment processes.
3. **Customer portal**: Users can manage their subscription (update payment method, change plan, view invoices) through Stripe's Customer Portal, accessed via `POST /api/stripe/portal`.
4. **Cancellation**: `POST /api/stripe/cancel` handles subscription cancellation. The tier downgrade is again driven by Stripe webhooks when the subscription period ends.
5. **All webhook events are recorded** in the `stripe_webhook_events` table for audit and debugging.

**How credit enforcement works:**

- Each tool has per-tier daily limits configured in `tool_tier_configurations` (e.g., "free users get 1 search per day, pro gets 10").
- When a user makes a tool request, the server calls the PostgreSQL function `increment_daily_tool_usage()`, which atomically checks and increments the counter. It returns `{daily_limit, used_count, remaining, allowed}`.
- If `allowed = false`, the server returns HTTP 429 and the frontend shows a credit notice modal suggesting an upgrade.
- Credits reset daily. The `daily_tool_usages` table tracks per-user, per-tool, per-day usage.

---

## Technical Depth

### Full-Stack Web Application (Next.js)

- **~130 TypeScript files** across app/ and lib/, all in **strict mode** — the entire codebase is type-checked as the only quality gate (`tsc --noEmit`)
- **18+ API route directories** with **40+ endpoints** covering chat, streaming, conversations, messages, tools, billing, admin, analytics, search, preferences, tags, and workers
- **17 database access modules** (one per domain: users, conversations, messages, chatRuns, tags, dailyToolUsage, apiTools, accountTierConfigurations, toolConfigurations, promptConfigurations, appSettings, toolInvocations, and more) — each encapsulating all SQL queries for its bounded context
- **35 database migrations** with **Row-Level Security on all user tables** — user data is scoped so that users can only access their own records, even if the API layer has a bug. Configuration and audit tables (app_settings, api_logs, model_costs, prompt_configurations, tool_configurations, stripe_webhook_events, search_cache) are admin-only under RLS
- **Background worker system** — a queue-based async processor for heavy tool requests (like Deep Emotional Analysis). Requests are stored with status `queued → processing → succeeded | failed` in `api_tool_requests`. The worker claims queued rows, processes them in configurable batches with configurable concurrency, and respects a configurable timeout. Worker settings (batch_size, concurrency, timeout_seconds, cron_schedule) are stored in `app_settings` and editable from the admin console — no redeployment needed
- **Comprehensive admin console** with **10+ sections**:
  - **Prompt Configuration** — manage system prompts that guide the AI's behavior, editable in real time
  - **Model Defaults** — configure which models are available per tier, with token limits and reasoning effort
  - **Tier Configuration** — define per-tier access to models, tools, and features
  - **Tool Configuration** — manage built-in and API tools, including input schemas, fixed parameters, and prompt length limits (min/max characters)
  - **User Manager** — view and manage user accounts, manually adjust tiers
  - **API Logs** — browse structured log entries with sensitive field redaction
  - **Worker Management** — adjust batch size, concurrency, timeout, and cron schedule; view recent tool jobs and their statuses
  - **App Settings** — global settings including loading messages, request timeouts, and worker configuration
  - **System Diagnostics (Test App)** — run full system diagnostics or targeted tool tests from the admin console. Tests run in parallel (configurable concurrency), consume tool credits, and store results in `test_runs`/`test_results` for historical review
  - **Model Costs** — track and configure cost information for each model
- **Security**:
  - RLS on every user-facing table — even a compromised API endpoint can't leak other users' data
  - Sensitive fields (API keys, tokens, cookies) are **redacted before writing to `api_logs`** — logs are safe to review without exposing secrets
  - Stripe webhook **signature verification** — prevents forged billing events
  - Admin routes enforce tier checks via `checkUserTier(userTier, "admin")` — admin pages are inaccessible even if you know the URL
  - Database functions set `search_path = public` to prevent **search_path hijacking** attacks
  - `user_tier` column is **protected by RLS** — clients cannot elevate their own tier; only admin workflows or Stripe webhooks can modify it
- **Observability**:
  - `api_usage` table captures every API call: endpoint, response time, status code, optional error message
  - `api_logs` table stores structured log entries with full context (written via `logApiEvent()`/`logApiError()`)
  - `instrumentation.ts` captures console logs into `api_logs` when configured
  - Usage analytics (`GET /api/analytics/usage`) and performance metrics (`GET /api/analytics/performance`) available via API
  - Every error gets a **unique UUID** for correlation between frontend errors, backend logs, and user support tickets
- **Dark/light theme** with **system-aware detection** (respects OS preference), **persistent preference** (stored in user preferences), and **cross-tab sync** (changing theme in one tab updates all open tabs)
- **Responsive design**: collapsible sidebar navigation on desktop, bottom navigation bar on mobile — the full feature set is accessible on any screen size

### Multi-Agent Research API (FastAPI)

- **Orchestrator pattern** — a reasoning-enabled LLM (GPT-5-nano) decomposes user queries into structured sub-questions with **automatic retry logic** (up to 3 attempts). The orchestrator produces valid JSON mapping each hat to a specific sub-question tailored to its perspective
- **5 concurrent agents** via `ThreadPoolExecutor` (6 workers max) — each agent is an independent GPT-5.2 instance with high reasoning effort, its own system prompt, and access to all 9 author search tools. Agents run fully in parallel; only the Blue Hat synthesis runs sequentially after all others complete
- **10 pre-built HNSW indices** covering **22,000+ philosophical documents** — binary index files ranging from 2 to 300 MB per author, loaded at startup for instant k-NN search with cosine similarity
- **Configurable reasoning effort** levels (`minimal`, `low`, `medium`, `high`) on the LLM — allowing the system to balance response quality against latency and cost
- **Two API endpoints**: `/api/query` (full six-hats analysis) and `/api/hat` (individual hat analysis) — enabling both comprehensive multi-perspective reports and targeted single-perspective deep dives
- **Serverless deployment** on Vercel using ASGI (Uvicorn) with Python 3.12

### MCP Server (Python / FastMCP)

- **6 concurrent reasoning agents** (Six Hats) + **4 specialized analysis agents** (Decompositor, Hermeneutico, Fenomenologo, Critico) — 10 agents total, each with distinct analytical methodologies
- **700+ lines** of structured system prompts per agent — these aren't simple instructions; they define mandatory output sections, citation formats, analytical depth requirements, and reasoning guidelines. The prompts enforce consistent, high-quality output across all agents
- **`GenericAgentMCP()` orchestrator** — a single flexible function that can run any agent by swapping in different prompts, models, and tool sets. This enables hot-swapping configurations without code changes
- **Tiered tool variants** — the server exposes different tool versions for each tier (Free/Pro/Max), controlling result volume and library access at the protocol level
- **Cloud-deployable** with auth header support — the server can run on FastMCP Cloud with `MCP_SERVER_AUTHORIZATION` for secure remote access
- **Dual transport**: supports both SSE (Server-Sent Events) for web clients and stdio for local CLI integration

---

## How the Three Systems Connect

```
User
  |
  v
+---------------------------+
|   Pensador Web App        |  Next.js + React + Supabase + Stripe
|   (Chat, Tools, Admin)    |
+---------------------------+
  |              |
  | Chat API     | MCP Tools
  v              v
+-------------+ +-------------------------+
| OpenAI      | | MCP Server              |  FastMCP + OpenAI
| Responses   | | (Philosopher Search +   |
| API         | |  Analysis Agents)       |
+-------------+ +-------------------------+
                   |
                   | Semantic Search
                   v
               +-------------------------+
               | Six Thinking Hats API   |  FastAPI + hnswlib + Supabase
               | (RAG + Multi-Agent      |
               |  Research Engine)        |
               +-------------------------+
                   |
                   v
               +-------------------------+
               | Knowledge Base           |
               | 22k+ docs from 10       |
               | philosophers/thinkers   |
               +-------------------------+
```

**Data flow in a typical request:**

1. A user asks a philosophical question in the Pensador web app.
2. The web app sends the message to OpenAI's Responses API with MCP tools injected.
3. OpenAI decides to call a philosopher search tool — the call goes to the MCP Server.
4. The MCP Server forwards the search query to the Six Thinking Hats API.
5. The API generates a vector embedding, performs HNSW nearest-neighbor search across the relevant author index, retrieves full document text from Supabase, and returns the results.
6. The MCP Server returns the results to OpenAI, which incorporates the real philosophical citations into its response.
7. The streaming response flows back to the user in real time, with tool invocations tracked in the database.

For a full Six Hats analysis, the process scales: 5 agents run in parallel, each making multiple searches across multiple authors, before the Blue Hat synthesizes everything into a final report.

---

## The Streaming Pipeline in Detail

```
User types message
  |
  v
ChatInterface.tsx
  |  POST /api/stream {messages, tool, model_tier, conversationId}
  v
/api/stream/route.ts (1,000+ lines)
  |
  ├─ [1] Authentication: Supabase cookie → user profile → tier check
  ├─ [2] Tier validation: Is the selected model allowed for this tier?
  ├─ [3] Tool credit check: increment_daily_tool_usage() → 429 if exhausted
  ├─ [4] Build OpenAI request: inject MCP tools, set reasoning effort, configure truncation
  |
  v
OpenAI Responses API (streaming)
  |
  ├─ Text deltas → TextEncoder → ReadableStream → Browser
  ├─ Tool calls (MCP) → Tracked in tool_invocations table
  ├─ Reasoning summaries → Extracted via splitReasoningSummary()
  └─ Completion → Persist chat_runs + api_usage + messages
  |
  v
Browser ReadableStream consumer
  |
  ├─ Accumulates text character by character
  ├─ Detects [[ERROR]] markers for mid-stream failures
  ├─ Renders Markdown in real time (react-markdown + remark-gfm)
  └─ Sanitizes HTML output (rehype-sanitize) to prevent XSS

Failure handling:
  |
  OpenAI or MCP error detected
  ├─ Can fallback? → Retry entire request without MCP tools
  └─ Cannot fallback? → Inject [[ERROR]] marker into stream
```

**Idempotent message creation**: Messages use sequence numbering with retry logic (3 attempts). If a PostgreSQL unique constraint violation is detected (e.g., from a network retry), the system re-attempts with an incremented sequence number, ensuring no duplicate messages.

**Token usage tracking**: OpenAI's response includes `input_tokens` and `output_tokens`. These are persisted in `chat_runs` (for per-conversation analysis) and `api_usage` (for platform-wide analytics), enabling accurate cost tracking per user, per tier, and per model.

---

## The Tool System in Detail

### Built-in Tools

The chat interface includes a **tool picker** supporting three categories:
- **Search** — web search powered by OpenAI's built-in capabilities, with citations derived from URL annotations
- **Analysis** — deep analysis tools backed by the MCP server and philosophical knowledge base
- **Explorer** — exploratory tools for open-ended research

Tool labels and descriptions are loaded dynamically from `/api/public-tools`, so the tool catalog can be updated from the admin console without redeploying the app.

### Deep Emotional Analysis

A specialized tool that sends user prompts to an external analysis API for in-depth emotional and psychological examination:

1. **Submission**: User writes a prompt on `/tools/deep-emotional-analysis/new`. The form enforces configurable character limits (`min_prompt_chars` / `max_prompt_chars`) with live character feedback.
2. **Queueing**: The request is saved to `api_tool_requests` with status `queued`.
3. **Processing**: Either triggered immediately (`POST /api/deep-emotional-analysis/requests/[requestId]/process`) or picked up by the background worker in batch.
4. **Completion**: Status updates to `succeeded` (with results) or `failed` (with error details).
5. **History**: Users can view all their past requests and results on `/tools/deep-emotional-analysis`.

### Generic API Tools

The platform supports dynamically configured API tools — administrators can create new tools from the admin console (`/admin/tools/api/new`) without writing code:

- Define the external API endpoint and timeout
- Specify an `input_schema` (what fields the user fills in) and `primary_input_key`
- Set `fixed_parameters` (values sent with every request)
- Configure `min_prompt_chars` and `max_prompt_chars` for user input validation
- The tool automatically gets a user-facing page at `/tools/api/[toolKey]`

This makes the tool system **extensible without code changes** — new analysis capabilities can be added entirely through the admin interface.

---

## Key Engineering Achievements

- **End-to-end streaming architecture** — from OpenAI to the browser with `ReadableStream` and `AbortController` timeout handling, including mid-stream error detection, graceful MCP fallback, and real-time Markdown rendering with XSS sanitization
- **Production multi-agent orchestration** — parallel agent execution with structured output contracts, iterative tool-use loops (up to 10 iterations per agent), and sequential synthesis — delivering comprehensive multi-perspective analysis in a single request
- **Full RAG pipeline** — 3,072-dim embedding generation, HNSW indexing across 10 author-specific indices (22,000+ documents), vector search with cosine similarity, page-level document retrieval from PostgreSQL, and LLM synthesis with real citations
- **MCP protocol compliance** — standard tool interface enabling interoperability with any MCP-compatible client, with tiered access control and graceful fallback when the server is unavailable
- **Complete SaaS infrastructure** — OAuth authentication (Google), 5-tier access control enforced at every layer (frontend, API, database), Stripe subscription billing with webhook-driven tier management, and a customer portal for self-service
- **Database-driven configurability** — models, prompts, tools, tiers, worker settings, and app settings are all configurable through the admin console without code changes or redeployment. The system behavior is defined by data, not hardcoded logic
- **Security by design** — Row-Level Security on all user tables (even a compromised API can't leak cross-user data), sensitive field redaction in logs, webhook signature verification, admin-only configuration tables, search_path hardening on database functions, and RLS-protected tier columns that prevent client-side privilege escalation
- **Comprehensive observability** — structured API logging, usage analytics, performance metrics, system diagnostics, error correlation via unique UUIDs, and full tool invocation audit trails

---

## Technology Summary

| Category | Technologies |
|---|---|
| **Frontend** | Next.js 16, React 18, TypeScript 5 (strict), Tailwind CSS 3.4, react-markdown, remark-gfm, rehype-sanitize |
| **Backend** | Next.js API Routes (40+ endpoints), FastAPI, Python 3.12, Node.js 24.x |
| **AI / LLM** | OpenAI Responses API, GPT-5-nano, GPT-5.2, text-embedding-3-large (3072-dim) |
| **Database** | Supabase (PostgreSQL), Row-Level Security, 35 migrations, 17 access modules |
| **Vector Search** | hnswlib (HNSW), 3072-dim embeddings, 10 author-specific binary indices |
| **Protocol** | Model Context Protocol (MCP) via FastMCP 2.14.1, SSE + stdio transports |
| **Payments** | Stripe 16 (subscriptions, webhooks, checkout sessions, customer portal) |
| **Auth** | Supabase Auth (OAuth / Google), @supabase/ssr, cookie-based SSR sessions |
| **Infrastructure** | Vercel (serverless, 120s function timeout), background workers, systemd scheduling |
| **Concurrency** | ThreadPoolExecutor (parallel agents), ReadableStream (streaming), AbortController (cancellation) |
| **Security** | RLS, field redaction, webhook verification, search_path hardening, tier-protected columns |

---

## Project Scale

| Metric | Value |
|---|---|
| TypeScript files (web app) | ~130 |
| API route directories | 18+ |
| API endpoints | 40+ |
| Database access modules | 17 |
| Database migrations | 35 |
| Database tables | 20+ |
| Philosophical documents indexed | 22,000+ |
| Author-specific vector indices | 10 |
| Embedding dimensions | 3,072 |
| MCP tools exposed | 10+ |
| AI reasoning agents | 10 (6 hats + 4 analysis) |
| System prompt lines per agent | 700+ |
| Streaming route handler | 1,000+ lines |
| Environment variables | 30+ |
| Documentation files | 23 |
| User tiers | 5 (Free, Pro, Max, Beta, Admin) |
