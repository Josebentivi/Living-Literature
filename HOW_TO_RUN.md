# How To Run

This project is a Next.js marketing website with server runtime enabled.
For reliability, npm scripts in this repository use webpack mode (`--webpack`) by default.

## 1. Requirements

- Node.js `24.x`
- npm `10+`

Check versions:

```bash
node -v
npm -v
```

## 2. Install dependencies

From project root:

```bash
npm install
```

## 3. Configure environment

Create your local env file:

```bash
cp .env.example .env
```

Update `.env` with your URLs and analytics IDs before running.

For chatbot support, also set:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_CHATBOT_ENABLED=true`

Model and generation settings are configured in `content/chatbot-system-prompt.ts`.

## 4. Run in development (hot reload)

```bash
npm run dev
```

Open:

- `http://localhost:3000`

Hot reload is enabled by default; file changes refresh automatically.

Content note:

- Main marketing copy is centralized in `content/site-copy.ts`.
- Route-level structure lives in `app/` pages.

If you explicitly want Turbopack, run:

```bash
npx next dev --turbopack
```

## 5. Lint the project

```bash
npm run lint
```

## 6. Build for production

```bash
npm run build
```

Build output:

- `.next/` (build artifacts)

If you explicitly want Turbopack for build, run:

```bash
npx next build --turbopack
```

## 7. Start production server (optional)

After `npm run build`, run:

```bash
npm start
```

This runs `next start -p 3000`.

## 8. Common issues

- Env changes not appearing:
  - Restart `npm run dev` or re-run `npm run build` after env changes.
- Port 3000 already in use:
  - Run `npm run dev -- -p 3001`.
- Missing dependencies:
  - Delete `node_modules` and run `npm install` again.
