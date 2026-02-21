"use client";

import { useEffect } from "react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  document.body?.classList.remove("dark");
}

function resolveTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeToggle(): React.JSX.Element {
  useEffect(() => {
    const theme = resolveTheme();
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, []);

  function toggleTheme(): void {
    const isDark = document.documentElement.classList.contains("dark");
    const nextTheme: Theme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-blue-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 dark:border-emerald-500/10 dark:bg-slate-950/30 dark:text-gray-200 dark:hover:border-emerald-500/20 dark:hover:text-gray-100 dark:focus-visible:ring-emerald-400/70"
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="theme-icon-light hidden h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.45 5.55l-1.65 1.65M7.2 16.8l-1.65 1.65M18.45 18.45l-1.65-1.65M7.2 7.2L5.55 5.55" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="theme-icon-dark h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M20.2 15.4A8.8 8.8 0 1 1 11.4 2a7.2 7.2 0 0 0 8.8 13.4Z" />
      </svg>
    </button>
  );
}
