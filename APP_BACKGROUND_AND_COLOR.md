# Pensador Background Style and Colors

This file contains the current background and surface recipe for both light and dark mode.

## 1) Theme setup (required)

Use class-based dark mode on `<html>`, scoped to `html.dark`.

```ts
// tailwind.config.ts
export default {
  darkMode: ["class", "html.dark"],
};
```

Add this in `<head>` to prevent theme flash:

```html
<meta name="color-scheme" content="light dark" />
<script>
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      var theme = stored === "light" || stored === "dark" ? stored : null;
      var prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      var useDark = theme ? theme === "dark" : prefersDark;
      document.documentElement.classList.toggle("dark", useDark);
      if (document.body) document.body.classList.remove("dark");
    } catch (e) {}
  })();
</script>
```

Local storage key used by this app: `theme` with values `light` or `dark`.

## 2) Core classes (copy as-is)

### Root page background (`<body>`)

```txt
min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-950 dark:text-gray-100
```

### Glass surfaces (header/sidebar/footer/mobile nav)

Header:

```txt
border-b border-white/30 bg-white backdrop-blur supports-[backdrop-filter]:bg-white dark:border-emerald-500/10 dark:bg-slate-950/40 dark:supports-[backdrop-filter]:bg-slate-950/30
```

Sidebar:

```txt
border-r border-white/30 bg-white backdrop-blur supports-[backdrop-filter]:bg-white dark:border-emerald-500/10 dark:bg-slate-950/40 dark:supports-[backdrop-filter]:bg-slate-950/30
```

Footer:

```txt
border-t border-white/30 bg-white dark:border-emerald-500/10 dark:bg-slate-950/40
```

Mobile nav:

```txt
border-t border-gray-200 bg-white backdrop-blur supports-[backdrop-filter]:bg-white dark:border-emerald-500/10 dark:bg-slate-950/60 dark:supports-[backdrop-filter]:bg-slate-950/50
```

### Reusable card/surface style

```txt
bg-white backdrop-blur rounded-lg border border-gray-200 shadow-sm dark:border-emerald-500/10 dark:bg-slate-950/30
```

### Hero/CTA inner panel

```txt
bg-white dark:bg-surface/95
```

### Chat bubble surfaces (`app/globals.css`)

```css
@layer components {
  .chat-message-user {
    @apply border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-emerald-500/15 dark:from-slate-950 dark:to-emerald-950/30;
  }

  .chat-message-assistant {
    @apply border border-gray-200 bg-white dark:border-emerald-500/10 dark:bg-slate-950/30;
  }
}
```

## 3) Scrollbar colors

```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

html.dark ::-webkit-scrollbar-track {
  background: #052e16;
}

html.dark ::-webkit-scrollbar-thumb {
  background: #065f46;
}

html.dark ::-webkit-scrollbar-thumb:hover {
  background: #047857;
}
```

## 4) Theme token values used by the app

Light (`:root`):

- `--surface: 255 255 255`
- `--surface-muted: 243 244 246`
- `--text: 17 24 39`
- `--text-subtle: 75 85 99`
- `--accent: 37 99 235`
- `--accent-strong: 29 78 216`
- `--accent-warm: 31 41 55`

Dark (`html.dark`):

- `--surface: 2 6 23`
- `--surface-muted: 15 23 42`
- `--text: 243 244 246`
- `--text-subtle: 209 213 219`
- `--accent: 52 211 153`
- `--accent-strong: 16 185 129`
- `--accent-warm: 6 95 70`

## 5) Plain CSS fallback (non-Tailwind)

```css
:root {
  --bg-start: #eff6ff;
  --bg-end: #e0e7ff;
  --text: #111827;
  --surface: #ffffff;
  --surface-border: #e5e7eb;
}

html.dark {
  --bg-start: #020617;
  --bg-end: #020617;
  --text: #f3f4f6;
  --surface: rgba(2, 6, 23, 0.4);
  --surface-border: rgba(16, 185, 129, 0.1);
}

body {
  min-height: 100vh;
  color: var(--text);
  background: linear-gradient(135deg, var(--bg-start), var(--bg-end));
}

html.dark body {
  background: linear-gradient(
    135deg,
    #020617 0%,
    rgba(2, 44, 34, 0.3) 50%,
    #020617 100%
  );
}

.glass-surface {
  border: 1px solid var(--surface-border);
  background: var(--surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

## 6) Quick checklist

1. Scope dark mode to `html.dark` in Tailwind config.
2. Add the theme init script in `<head>`.
3. Toggle only `document.documentElement.classList` for dark mode.
4. Keep light surfaces as solid white (`bg-white`) if you want a clean light theme.
5. Use the dark surface classes from this document for visual parity.
6. Restart the dev server after changing `tailwind.config.ts`.
