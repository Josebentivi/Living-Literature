# Pensador Dark Background Style + Colors

This file captures the exact dark background recipe used in this project.
It is focused on dark mode only. Light mode should stay unchanged.

## Source of truth in this repo
- `tailwind.config.ts` (dark variant scoping)
- `app/layout.tsx` (theme init script and root body gradient classes)
- `components/theme-toggle.tsx` (theme toggle logic)
- `components/navigation.tsx` (dark translucent header, sidebar, and mobile nav)
- `app/layout.tsx` (dark translucent footer)
- `app/globals.css` (dark tokens, surface utilities, and dark scrollbar)

## 1) Dark mode strategy
Use class-based dark mode on `<html>`, and scope dark utilities to `html.dark`.

Tailwind config:

```ts
// tailwind.config.ts
export default {
  darkMode: ["class", "html.dark"],
};
```

Theme application logic:

```js
document.documentElement.classList.toggle("dark", useDark);
document.body?.classList.remove("dark");
```

The `document.body` cleanup prevents accidental partial dark styling in light mode.

## 2) Main dark background (exact)
Tailwind classes used on `<body>`:

```txt
min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900
dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-950 dark:text-gray-100
```

Dark equivalent in plain CSS:

```css
html.dark body {
  background-image: linear-gradient(
    to bottom right,
    #020617 0%,
    rgba(2, 44, 34, 0.30) 50%,
    #020617 100%
  );
}
```

## 3) Dark surface style (cards, panels, navigation)
Use these together to match the visual language:

- `dark:bg-slate-950/30` default card surface
- `dark:bg-slate-950/40` header/sidebar/footer surface
- `dark:bg-slate-950/60` mobile nav surface
- `dark:border-emerald-500/10` default subtle border
- `dark:border-emerald-500/15` and `dark:border-emerald-500/20` stronger states
- `backdrop-blur` glass effect

Common combinations used in this app:

- Default card: `dark:bg-slate-950/30 dark:border-emerald-500/10 backdrop-blur`
- Header/sidebar/footer: `dark:bg-slate-950/40 dark:border-emerald-500/10 backdrop-blur`
- Mobile nav: `dark:bg-slate-950/60 dark:border-emerald-500/10 backdrop-blur`

## 4) Color token map
Core dark palette:

- `slate-950`: `#020617`
- `slate-900`: `#0f172a`
- `emerald-950`: `#022c22`
- `emerald-900`: `#064e3b`
- `emerald-800`: `#065f46`
- `emerald-500`: `#10b981`
- `emerald-400`: `#34d399`
- `emerald-200`: `#a7f3d0`
- `gray-300`: `#d1d5db`
- `gray-100`: `#f3f4f6`

Opacity conversions used by the UI:

- `slate-950/30`: `rgba(2, 6, 23, 0.30)`
- `slate-950/40`: `rgba(2, 6, 23, 0.40)`
- `slate-950/60`: `rgba(2, 6, 23, 0.60)`
- `emerald-950/30`: `rgba(2, 44, 34, 0.30)`
- `emerald-500/10`: `rgba(16, 185, 129, 0.10)`
- `emerald-500/15`: `rgba(16, 185, 129, 0.15)`
- `emerald-500/20`: `rgba(16, 185, 129, 0.20)`

## 5) Dark scrollbar

```css
html.dark ::-webkit-scrollbar-track { background: #052e16; }
html.dark ::-webkit-scrollbar-thumb { background: #065f46; }
html.dark ::-webkit-scrollbar-thumb:hover { background: #047857; }
```

## 6) Ready-to-copy snippets
Tailwind:

```tsx
<body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-950 dark:text-gray-100">
  <main className="rounded-xl border border-gray-200 bg-white backdrop-blur dark:border-emerald-500/10 dark:bg-slate-950/30">
    ...
  </main>
</body>
```

Plain CSS:

```css
html.dark .surface {
  border: 1px solid rgba(16, 185, 129, 0.10);
  background: rgba(2, 6, 23, 0.30);
  backdrop-filter: blur(8px);
}
```
