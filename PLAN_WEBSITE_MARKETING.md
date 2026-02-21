# Pensador Marketing Website Plan (Improved)

## 1. Objective
Build a standalone marketing website for Pensador that increases qualified traffic and converts visitors into product users.

Primary business outcomes:
- Increase sign-up starts from organic and referral traffic.
- Improve trial-to-paid pipeline by explaining tier value clearly.
- Strengthen brand trust through transparent product and research pages.

Primary conversion action:
- `Start Using Pensador` -> redirect to main app URL with UTM parameters.

## 2. Scope and Non-Goals

In scope:
- Static marketing site with 4 core pages.
- Conversion-focused copy, SEO foundations, analytics, and launch checklist.
- Visual alignment with Pensador app design language.

Out of scope:
- Building product features inside the main app.
- CMS, blog engine, or dynamic personalization in phase 1.
- Paid ads execution (site must be ready for ads, but ad ops is separate).

## 3. Audience and Positioning

Primary audiences:
- Curious first-time users exploring AI assistants.
- Power users evaluating tool depth and model capabilities.
- Potential paying users comparing Free vs Pro vs Max value.

Positioning statement:
- Pensador is an AI workspace focused on practical thinking workflows, combining streaming chat, tool integrations, and research-grade capability in one product.

Messaging pillars:
- Fast and usable: real-time streaming and clean workflows.
- Capable and extensible: tools, tiered models, and advanced analysis.
- Trustworthy: transparent architecture, clear pricing, and predictable UX.

## 4. Success Metrics (90-day targets)

Traffic and acquisition:
- Organic sessions: +30% from baseline.
- Branded + non-branded keyword impressions: +40%.

Conversion:
- Landing page CTR to app: >= 8%.
- Visitor to sign-up start: >= 4%.
- Visitor to paid upgrade click-through: >= 1.5%.

Engagement quality:
- Bounce rate on Home: <= 55%.
- Average time on Research and Library pages: >= 90 seconds.

Measurement note:
- Baseline is measured from the 14 days before launch.

## 5. Information Architecture

Routes:
- `/` Home (value proposition + primary conversion).
- `/research` Technology credibility + architecture narrative.
- `/library` Tool and tier value communication.
- `/how-to-use` Onboarding guidance + FAQ.

Navigation:
- Desktop sidebar + mobile bottom navigation, consistent with app feel.
- Persistent CTA in header and page-end CTA blocks.

## 6. Page Strategy and Content Plan

### Home (`/`)
Goal:
- Convert first-time visitors into app visits.

Sections:
- Hero: strong one-line value proposition + CTA.
- Feature proof cards: 3-4 concrete outcomes, not generic claims.
- How it works: 3-step workflow (Ask -> Process -> Deliver).
- Social proof placeholder: testimonials, usage stats, or trust indicators.
- Final CTA band with app link.

Copy guidance:
- Headline should describe user outcome, not just technology.
- Buttons should use action language (`Start Using Pensador`, `Try Free`).

### Research (`/research`)
Goal:
- Build credibility with technical audiences.

Sections:
- Intro: what "research-powered" means in product terms.
- Architecture overview: User -> Next.js -> OpenAI -> Tools -> Response.
- Capability blocks: streaming, MCP tools, deep analysis workflow.
- Model and tier explanation with practical examples.

Copy guidance:
- Keep claims verifiable and avoid overpromising.
- Prefer diagrams and concrete examples over long paragraphs.

### Library (`/library`)
Goal:
- Communicate breadth of tools and motivate upgrade interest.

Sections:
- Tool catalog cards with use case snippets.
- Tool categories (Chat, Search, Analysis, API tools).
- Tier comparison table focused on user benefit and usage limits.
- CTA to start free and optional CTA to compare paid tiers.

Copy guidance:
- Each tool card must answer "when would I use this?"
- Tier table should prioritize clarity over feature density.

### How to Use (`/how-to-use`)
Goal:
- Reduce onboarding friction and increase activation rate.

Sections:
- 4-step quickstart with screenshots/illustrations.
- Common mistakes and best-practice tips.
- FAQ that addresses cost, privacy, tools, and model selection.
- End-of-page CTA to open app and begin first conversation.

Copy guidance:
- Steps must be short, skimmable, and executable in under 3 minutes.

## 7. SEO Plan

Core keyword clusters:
- Brand: `pensador ai`, `pensador app`.
- Generic: `ai assistant with tools`, `streaming ai chat`, `ai research assistant`.
- Intent pages: `how to use ai tools`, `ai tier pricing comparison`.

On-page requirements:
- Unique title and meta description for every page.
- One H1 per page, clear H2 hierarchy.
- Internal links between Home, Research, Library, and How to Use.
- Descriptive alt text for all non-decorative images.

Technical SEO:
- Static generation/export for speed and crawlability.
- XML sitemap and robots.txt.
- Canonical URLs.
- Open Graph and Twitter cards.
- 404 page with CTA back to Home.

Content quality guardrails:
- Avoid duplicate marketing copy across pages.
- Match search intent per page instead of keyword stuffing.

## 8. Analytics and Attribution

Required analytics events:
- `cta_click_primary`
- `cta_click_secondary`
- `nav_click`
- `section_view`
- `faq_expand`
- `tier_compare_interaction`
- `outbound_to_app`

Attribution:
- Append UTM tags for all app redirects.
- Preserve referrer context from page-level CTAs.

Reporting cadence:
- Weekly dashboard review for first 6 weeks.
- Bi-weekly optimization decisions after stabilization.

## 9. Design and UX Direction

Principles:
- Keep visual continuity with the app (fonts, gradient, glass surfaces, theme toggle).
- Prioritize readability and hierarchy over decorative effects.
- Design for fast scanning on mobile first, then enrich desktop layout.

Accessibility baseline:
- Semantic landmarks (`header`, `nav`, `main`, `footer`, `section`).
- Keyboard navigability for all interactions.
- Visible focus states and adequate contrast in light and dark themes.
- Informative link/button labels (no "click here").

Performance baseline:
- Target Lighthouse >= 90 for Performance, Accessibility, SEO, Best Practices.
- Keep initial payload lean; avoid unnecessary client-side JS.

## 10. Technical Constraints

Stack:
- Node.js 24.x
- Next.js 16 (App Router)
- React 18.3
- TypeScript 5
- Tailwind CSS 3.4

Architecture:
- Fully static output (`output: "export"`).
- No backend, auth, DB, OpenAI, Supabase, or Stripe dependencies for marketing site runtime.
- Deployable on Vercel, Netlify, GitHub Pages, S3 + CloudFront, or equivalent static hosts.

## 11. Execution Plan (Phased)

### Phase 0 - Discovery and Copy Brief (2-3 days)
Deliverables:
- Message hierarchy (headline, subheadline, CTA variants).
- Audience pain points and objection list.
- Final page outlines and section goals.

Exit criteria:
- Stakeholder sign-off on messaging and conversion goals.

### Phase 1 - UX/Wireframe and Design Tokens (2-3 days)
Deliverables:
- Low-fidelity wireframes for all 4 pages.
- Reusable section components and token decisions.
- Mobile and desktop layout approval.

Exit criteria:
- Approved wireframes and visual direction.

### Phase 2 - Build and Content Integration (3-5 days)
Deliverables:
- Complete static site with all pages and navigation.
- Final copy applied and CTA wiring to app URL with UTM.
- Responsive behavior and theme toggle parity.

Exit criteria:
- Functional and visual QA pass.

### Phase 3 - SEO, Analytics, and QA Hardening (2 days)
Deliverables:
- Metadata, sitemap, robots, canonical setup.
- Event tracking instrumentation and dashboard checks.
- Performance/accessibility optimization.

Exit criteria:
- Metrics instrumentation validated and Lighthouse targets met.

### Phase 4 - Launch and Optimization Loop (ongoing)
Deliverables:
- Production deployment and monitoring.
- Weekly experiment backlog (headline tests, CTA placement, tier table variants).

Exit criteria:
- First 30-day report with prioritized improvements.

## 12. Launch Checklist

Pre-launch:
- All page metadata finalized.
- UTM links validated on every CTA.
- Event tracking verified in analytics.
- Mobile and desktop cross-browser QA complete.
- Legal links and contact/support references present.

Launch day:
- Deploy and verify canonical domain + HTTPS.
- Smoke test all routes and CTA redirects.
- Confirm indexability settings (no accidental `noindex`).

Post-launch (first 72 hours):
- Check 404s, broken links, and event ingestion.
- Validate performance and Core Web Vitals trends.
- Capture first optimization hypotheses from real behavior.

## 13. Risks and Mitigations

Risk:
- High traffic but low conversion.
Mitigation:
- A/B test hero message, shorten first fold, strengthen CTA copy.

Risk:
- Unclear differentiation from generic AI tools.
Mitigation:
- Emphasize tool workflows, tier value, and practical outcomes.

Risk:
- SEO impressions grow without ranking gains.
Mitigation:
- Improve intent alignment, internal linking, and content specificity.

Risk:
- Marketing site drifts from product reality.
Mitigation:
- Monthly content audit aligned with current app features.

## 14. Acceptance Criteria

This plan is complete when:
- All 4 pages are published with approved messaging and CTA flows.
- SEO essentials are in place and validated.
- Analytics events are firing and dashboard is usable.
- Performance and accessibility thresholds are met.
- A documented 30-day optimization backlog exists.
