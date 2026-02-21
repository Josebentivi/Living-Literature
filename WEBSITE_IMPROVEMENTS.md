# Website Improvements and Security Review

## Scope and checks run
- Reviewed website/app code (`app/`, `components/`, `lib/`, `content/`, configs, docs).
- Executed `npm run lint` and `npm run build` (both passed).
- Executed `npm audit --omit=dev` for runtime dependency risk.

## Critical findings

### 1) Exposed credential in tracked documentation
- Evidence: `INSTALL_WEBSITE_UBUNTU_AWS_EC2.md:184`, `INSTALL_WEBSITE_UBUNTU_AWS_EC2.md:252`, `INSTALL_WEBSITE_UBUNTU_AWS_EC2.md:198`
- Issue: A concrete DuckDNS token value is present in a committed file.
- Risk: Token theft can allow DNS record manipulation.
- Recommended action:
  1. Rotate/revoke the DuckDNS token immediately.
  2. Replace all real values in docs with placeholders.
  3. Consider history rewrite if this repo is public/forked.

## High-priority security improvements

### 2) Chatbot API lacks abuse controls (rate limit/auth/origin policy)
- Evidence: `app/api/chatbot/route.ts:236` (public POST handler), no rate limiter/auth layer in route.
- Risk: Cost abuse and denial-of-wallet via automated requests.
- Recommended action:
  1. Add per-IP/session rate limiting.
  2. Add origin checks and optional challenge (captcha/turnstile) for public traffic.
  3. Add server-side request logging/alerts for spikes.

### 3) Request size guard depends on `content-length` header
- Evidence: `app/api/chatbot/route.ts:245`
- Risk: Header can be missing/inaccurate; oversized payloads may still be parsed.
- Recommended action:
  - Read raw body, enforce byte limit server-side before JSON parsing, and reject on overflow.

## Medium-priority improvements

### 4) Client-controlled chat history can be tampered
- Evidence: `lib/chatbot/cookie-store.ts:56`, `lib/chatbot/cookie-store.ts:65`, `app/api/chatbot/route.ts:262`
- Issue: History is persisted in client-readable/writable cookies and then accepted by API.
- Risk: Prompt-context manipulation, noisy logs, degraded answer quality.
- Recommended action:
  - Move history to server-side session storage, or sign/encrypt payload with integrity verification.

### 5) Runtime dependency vulnerabilities in unused package path
- Evidence: `package.json:19` (`serve`), plus `npm audit --omit=dev` (AJV/minimatch advisories via `serve`).
- Risk: Vulnerable transitive dependencies retained unnecessarily.
- Recommended action:
  - Remove `serve` if unused; otherwise pin to a non-vulnerable path and re-audit.

### 6) Version drift and maintenance mismatch
- Evidence: `requirements.txt:6-8` vs `package.json:15,17,18`; `package.json:23-24` types for React 18 while runtime is React 19.
- Recommended action:
  - Align `requirements.txt` with actual runtime, and update React type packages to matching major versions.

## Low-priority UX/maintainability improvements

### 7) Invalid Tailwind utility class
- Evidence: `components/navigation.tsx:138` uses `lg:w-13`.
- Impact: Collapsed sidebar width may not apply as intended.
- Recommended action:
  - Use a valid class (`lg:w-12`, `lg:w-14`) or arbitrary value (`lg:w-[3.25rem]`).

### 8) CTA metadata naming can confuse editors
- Evidence: `content/site-copy.ts:18`, `app/page.tsx:40`, `lib/utm.ts:27`, `lib/utm.ts:34`
- Issue: `primaryCtaPage` looks like destination URL, but is used as UTM page metadata.
- Recommended action:
  - Rename to `utmPage` (or similar) and keep destination concerns separated.
