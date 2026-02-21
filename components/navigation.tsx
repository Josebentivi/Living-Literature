"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CtaLink } from "@/components/cta-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/site";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItemIcon({ href }: { href: string }): React.JSX.Element {
  if (href === "/") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9.8V20h14V9.8" />
      </svg>
    );
  }

  if (href === "/research") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
    );
  }

  if (href === "/library") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M4.5 4h6v16h-6z" />
        <path d="M13.5 4h6v16h-6z" />
        <path d="M4.5 8h6" />
        <path d="M13.5 8h6" />
      </svg>
    );
  }

  if (href === "/how-to-use") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M4 7h8" />
        <path d="M4 12h7" />
        <path d="M4 17h9" />
        <circle cx="17.5" cy="11.5" r="3.5" />
        <path d="M16.4 11.5h2.2" />
        <path d="M17.5 10.4v2.2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  );
}

function NavLinks({
  location,
  collapsed = false,
}: {
  location: "sidebar" | "mobile";
  collapsed?: boolean;
}): React.JSX.Element {
  const pathname = usePathname();
  const compact = location === "sidebar" && collapsed;

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              trackEvent("nav_click", {
                location,
                target: item.href,
                label: item.label,
              });
            }}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 dark:focus-visible:ring-emerald-400/70",
              location === "sidebar" && "block",
              compact && "flex h-12 items-center justify-center px-0",
              active
                ? "bg-blue-100 text-gray-900 dark:bg-emerald-500/20 dark:text-emerald-200"
                : "text-gray-700 hover:bg-white hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-950/30 dark:hover:text-gray-100",
            )}
            title={compact ? item.label : undefined}
            aria-label={compact ? item.label : undefined}
            aria-current={active ? "page" : undefined}
          >
            {compact ? <NavItemIcon href={item.href} /> : item.label}
          </Link>
        );
      })}
    </>
  );
}

export function SidebarNav(): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(true);

  function toggleSidebar(): void {
    setIsCollapsed((current) => {
      const next = !current;
      trackEvent("nav_click", {
        location: "sidebar",
        target: next ? "collapse" : "expand",
        label: "Sidebar Toggle",
      });
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "hidden border-r border-white/30 bg-white backdrop-blur supports-[backdrop-filter]:bg-white transition-[width,padding] duration-200 dark:border-emerald-500/10 dark:bg-slate-950/40 dark:supports-[backdrop-filter]:bg-slate-950/30 lg:flex lg:min-h-screen lg:flex-col lg:py-6",
        isCollapsed ? "lg:w-14 lg:px-3" : "lg:w-72 lg:px-6",
      )}
    >
      <div className={cn("mb-6 flex flex-col gap-2", isCollapsed ? "items-center" : "items-start")}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-blue-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 dark:border-emerald-500/10 dark:bg-slate-950/30 dark:text-gray-200 dark:hover:border-emerald-500/20 dark:hover:text-gray-100 dark:focus-visible:ring-emerald-400/70"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 6-6 6 6 6" />
          </svg>
        </button>

        <Link
          href="/"
          onClick={() =>
            trackEvent("nav_click", { location: "sidebar", target: "/", label: "Pensador" })
          }
          className={cn(
            "inline-flex rounded-xl border border-white/40 bg-white dark:border-emerald-500/10 dark:bg-slate-950/30",
            isCollapsed ? "h-12 w-12 items-center justify-center" : "px-4 py-3",
          )}
          aria-label="Go to Pensador home"
        >
          {isCollapsed ? (
            <>
              <Image
                src="/brand/pensador-mark.png"
                alt="Pensador"
                width={28}
                height={28}
                className="h-7 w-7 dark:hidden"
                priority
              />
              <Image
                src="/brand/pensador-mark-dark.png"
                alt="Pensador"
                width={28}
                height={28}
                className="hidden h-7 w-7 dark:block"
                priority
              />
            </>
          ) : (
            <>
              <Image
                src="/brand/pensador-logo.png"
                alt="Pensador"
                width={205}
                height={55}
                className="h-auto w-44 dark:hidden"
                priority
              />
              <Image
                src="/brand/pensador-logo-dark.png"
                alt="Pensador"
                width={205}
                height={55}
                className="hidden h-auto w-44 dark:block"
                priority
              />
            </>
          )}
        </Link>
      </div>

      <nav aria-label="Main navigation" className={cn("space-y-2", isCollapsed && "space-y-1")}>
        <NavLinks location="sidebar" collapsed={isCollapsed} />
      </nav>

      {!isCollapsed && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm backdrop-blur dark:border-emerald-500/10 dark:bg-slate-950/30">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Ready to try Pensador?
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-300">
            Move from idea to decision with streaming chat, tools, and deep analysis.
          </p>
          <CtaLink
            label="Start Using Pensador"
            placement="sidebar_primary"
            className="mt-4 w-full"
          />
        </div>
      )}

      <div
        className={cn(
          "mt-auto flex items-center border-t border-white/40 pt-5 dark:border-emerald-500/10",
          isCollapsed ? "justify-center" : "justify-between",
        )}
      >
        {!isCollapsed && <span className="text-xs text-gray-600 dark:text-gray-300">Theme</span>}
        <ThemeToggle />
      </div>
    </aside>
  );
}

export function TopHeader({
  topHeaderLabel,
  topHeaderCtaLabel,
}: {
  topHeaderLabel: string;
  topHeaderCtaLabel: string;
}): React.JSX.Element {
  const pathname = usePathname();
  const activePage =
    NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href))?.label ?? "Home";

  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-white px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-white dark:border-emerald-500/10 dark:bg-slate-950/40 dark:supports-[backdrop-filter]:bg-slate-950/30 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() =>
              trackEvent("nav_click", { location: "header", target: "/", label: "Pensador" })
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-emerald-500/10 dark:bg-slate-950/30"
            aria-label="Go to Pensador home"
          >
            <Image
              src="/brand/pensador-mark.png"
              alt="Pensador mark"
              width={28}
              height={28}
              className="h-7 w-7 dark:hidden"
            />
            <Image
              src="/brand/pensador-mark-dark.png"
              alt="Pensador mark"
              width={28}
              height={28}
              className="hidden h-7 w-7 dark:block"
            />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300">
              {topHeaderLabel}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activePage}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CtaLink
            label={topHeaderCtaLabel}
            placement="header_primary"
            className="hidden sm:inline-flex"
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav(): React.JSX.Element {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-white dark:border-emerald-500/10 dark:bg-slate-950/60 dark:supports-[backdrop-filter]:bg-slate-950/50 lg:hidden"
    >
      <div className="grid grid-cols-4 gap-1">
        <NavLinks location="mobile" />
      </div>
    </nav>
  );
}
