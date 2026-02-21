# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router routes, layout, metadata, and API endpoints (notably `app/api/chatbot/route.ts`).
- `components/`: Reusable UI and client logic (`components/chatbot/` for widget/hooks).
- `content/`: Centralized editable copy and chatbot prompt/config (`site-copy.ts`, `chatbot-system-prompt.ts`).
- `lib/`: Shared utilities (analytics, UTM builder, site config, chatbot history/cookies).
- `public/`: Static assets (`brand/`, `screenshots/`).
- Root docs: operational guides such as `HOW_TO_RUN.md`, `HOW_TO_EDIT_CONTENT.md`, and deployment notes.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: run local server with webpack (`next dev --webpack`) at `http://localhost:3000`.
- `npm run lint`: run ESLint with zero warnings allowed.
- `npm run build`: production build (`next build --webpack`).
- `npm start`: run production server on port `3000`.

Use `npm run lint && npm run build` before opening a PR.

## Coding Style & Naming Conventions
- Language: TypeScript (`strict` mode enabled in `tsconfig.json`).
- Indentation: 2 spaces; keep formatting consistent with existing files.
- React components: PascalCase exports; route files follow Next conventions (`page.tsx`, `layout.tsx`).
- Utility/module files: lowercase with hyphens where appropriate (for example, `page-cta.tsx`, `chatbot-widget.tsx`).
- Styling: Tailwind utility classes in JSX; shared styles in `app/globals.css`.
- Imports: prefer alias paths like `@/lib/site` over deep relative paths.

## Testing Guidelines
- No dedicated test framework is currently configured.
- Minimum quality gate is: `npm run lint` and `npm run build` must pass.
- For UI/content changes, include manual verification for affected routes (for example, `/`, `/library/pensador`, `/how-to-use`).
- If adding tests, colocate as `*.test.ts` or `*.test.tsx` near the feature.

## Commit & Pull Request Guidelines
- Existing history uses short imperative messages (for example, `Update site-copy.ts`, `up home`).
- Prefer clear imperative commits with scope, such as:
  - `content: update home hero copy`
  - `chatbot: handle max token retry`
- PRs should include:
  - concise summary of changes,
  - files/areas impacted,
  - validation steps run (`lint`, `build`, manual route checks),
  - screenshots for visual/UI updates,
  - env/config changes (and `.env.example` updates when needed).

## Security & Configuration Notes
- Never commit secrets; keep `OPENAI_API_KEY` only in local/server `.env`.
- Treat `NEXT_PUBLIC_*` values as public and build-time embedded.
- Rebuild after environment variable changes.
