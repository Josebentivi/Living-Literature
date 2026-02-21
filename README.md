# Pensador Website

Marketing website for Pensador/Literatura Viva built with Next.js App Router.
The project uses webpack mode in npm scripts (`next ... --webpack`) for stability.

## Overview

This repository contains:

- Public marketing pages (`/`, `/research`, `/library`, `/library/pensador`, `/how-to-use`)
- A server API route for the chatbot (`/api/chatbot`)
- Centralized content model in `content/site-copy.ts`
- CTA UTM generation and analytics instrumentation (`window.dataLayer`)
- Optional chatbot widget powered by OpenAI Responses API

## Tech Stack

- Node.js `>=24.0.0` (see `package.json`)
- Next.js `16.1.x`
- React `19.2.x`
- TypeScript `5.x`
- Tailwind CSS `3.4.x`
- ESLint `9.x`

## Route Map

| Route | Purpose |
| --- | --- |
| `/` | Home |
| `/research` | Research architecture and methodology |
| `/library` | App catalog overview |
| `/library/pensador` | Pensador detail page |
| `/how-to-use` | Onboarding playbook |
| `/api/chatbot` | Chatbot backend endpoint (`GET`, `POST`, `DELETE`) |
| `/sitemap.xml` | Generated sitemap |
| `/robots.txt` | Robots rules |

## Project Structure

```text
app/
  api/chatbot/route.ts
  how-to-use/page.tsx
  library/page.tsx
  library/pensador/page.tsx
  research/page.tsx
components/
  chatbot/
content/
  site-copy.ts
  chatbot-system-prompt.ts
lib/
  analytics.ts
  site.ts
  utm.ts
public/
  brand/
  screenshots/
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create local environment file:

```bash
cp .env.example .env
```

3. Run development server:

```bash
npm run dev
```

Default local URL: `http://localhost:3000`

## Scripts

```bash
npm run dev    # next dev --webpack
npm run build  # next build --webpack
npm start      # next start -p 3000
npm run lint   # eslint . --max-warnings=0
```

## Environment Variables

Copy `.env.example` and update values.
Full variable list is documented there; key groups are:

- Branding and canonical URLs (`NEXT_PUBLIC_SITE_*`, `NEXT_PUBLIC_APP_URL`)
- Legal/support links (`NEXT_PUBLIC_PRIVACY_URL`, `NEXT_PUBLIC_TERMS_URL`, etc.)
- UTM defaults (`NEXT_PUBLIC_UTM_SOURCE`, `NEXT_PUBLIC_UTM_MEDIUM`, `NEXT_PUBLIC_UTM_CAMPAIGN`)
- Analytics IDs (`NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`)
- Homepage screenshots and testimonials (`NEXT_PUBLIC_SCREENSHOT_*`, `NEXT_PUBLIC_TESTIMONIAL_*`)
- Chatbot:
  - `OPENAI_API_KEY` (server-side, required for chatbot responses)
  - `NEXT_PUBLIC_CHATBOT_ENABLED` (`true`/`false`, toggles widget visibility)
  - Optional guard tuning:
    - `CHATBOT_RATE_LIMIT_WINDOW_MS`
    - `CHATBOT_RATE_LIMIT_PER_IP`
    - `CHATBOT_RATE_LIMIT_PER_SESSION`
    - `CHATBOT_SPIKE_ALERT_PER_MINUTE`
    - `CHATBOT_SPIKE_ALERT_PER_IP_PER_MINUTE`

Important:

- `NEXT_PUBLIC_*` values are embedded at build time.
- Rebuild after changing environment variables.

## Content Editing

Primary content source:

- `content/site-copy.ts`

This file drives copy for:

- Home (`SITE_COPY.home`)
- Research (`SITE_COPY.research`)
- Library overview (`SITE_COPY.libraryOverview`)
- Library Pensador detail (`SITE_COPY.libraryPensador`)
- How To Use (`SITE_COPY.howToUse`)

Chatbot behavior/prompt configuration:

- `content/chatbot-system-prompt.ts`

## Chatbot Implementation Notes

- UI: `components/chatbot/chatbot-widget.tsx`
- State + server session sync: `components/chatbot/use-chatbot.ts`
- API: `app/api/chatbot/route.ts`
- History sanitization and size control: `lib/chatbot/history.ts`
- Server-side history session store: `lib/chatbot/session-store.ts`
- Request protection (rate limit/origin/raw-body/spike alerts): `lib/chatbot/request-guard.ts`

Current behavior includes:

- Server runtime (`runtime = "nodejs"`)
- Server-side history storage keyed by a session cookie
- Per-IP and per-session rate limiting
- Origin checks for chatbot requests
- Server-side traffic spike logging alerts
- Raw-body byte limit enforcement before JSON parsing
- Input/history sanitization
- Retry path when response is incomplete due to `max_output_tokens`
- Graceful fallback reply on API or network errors

## Analytics and Tracking

Events are pushed to `window.dataLayer` from `lib/analytics.ts`.
Producers include CTA clicks, navigation clicks, section views, FAQ expands, and tier-table interactions.

If configured:

- GTM is loaded when `NEXT_PUBLIC_GTM_ID` is set
- Direct GA4 is loaded only when GTM is not set and `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set

Detailed setup: `CONNECT_DATALAYER.md`

## Deployment

Production flow:

```bash
npm ci
npm run lint
npm run build
npm start
```

Comprehensive Ubuntu EC2 + Nginx + HTTPS guide:

- `INSTALL_WEBSITE_UBUNTU_AWS_EC2.md`

Deploy helper script:

- `deploy.sh`

## Additional Documentation

- `HOW_TO_RUN.md`
- `HOW_TO_EDIT_CONTENT.md`
- `CONNECT_DATALAYER.md`
- `INSTALL_WEBSITE_UBUNTU_AWS_EC2.md`
