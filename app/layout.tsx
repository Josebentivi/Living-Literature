import type { Metadata } from "next";

import { AnalyticsScripts } from "@/components/analytics-scripts";
import { BehaviorTracker } from "@/components/behavior-tracker";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";
import { MobileBottomNav, SidebarNav, TopHeader } from "@/components/navigation";
import { SITE_COPY } from "@/content/site-copy";
import {
  COMPANY_NAME,
  OG_IMAGE_URL,
  PRIVACY_URL,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKEDIN,
  SOCIAL_X,
  SUPPORT_URL,
  TERMS_URL,
} from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pensador | AI Workspace for Practical Thinking",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Pensador is an AI workspace built for practical thinking workflows with streaming chat, tool integrations, and research-grade analysis.",
  icons: {
    icon: [
      { url: "/brand/pensador-mark.png", type: "image/png" },
      {
        url: "/brand/pensador-mark-dark.png",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [{ url: "/brand/pensador-mark.png", type: "image/png" }],
  },
  alternates: {
    canonical: "/",
  },
  keywords: [
    "pensador ai",
    "pensador app",
    "ai assistant with tools",
    "streaming ai chat",
    "ai research assistant",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Pensador | AI Workspace for Practical Thinking",
    description:
      "Move from question to decision faster with streaming chat, integrated tools, and transparent tier value.",
    url: "/",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Pensador AI workspace screenshot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pensador | AI Workspace for Practical Thinking",
    description:
      "Move from question to decision faster with streaming chat, integrated tools, and transparent tier value.",
    images: [OG_IMAGE_URL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  const topHeaderLabel = SITE_COPY.navigation.topHeaderLabel;
  const topHeaderCtaLabel = SITE_COPY.navigation.topHeaderCtaLabel;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
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
})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-950 dark:text-gray-100">
        <AnalyticsScripts />
        <BehaviorTracker />
        <div className="relative min-h-screen lg:flex">
          <SidebarNav />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <TopHeader
              topHeaderLabel={topHeaderLabel}
              topHeaderCtaLabel={topHeaderCtaLabel}
            />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-8 sm:px-6 lg:px-10 lg:pb-10">
              {children}
            </main>
            <footer className="border-t border-white/30 bg-white px-4 py-8 text-xs text-gray-700 dark:border-emerald-500/10 dark:bg-slate-950/40 dark:text-gray-300 sm:px-6 lg:px-10">
              <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
                <p>(c) {new Date().getFullYear()} {COMPANY_NAME}. Built for clear thinking.</p>
                <div className="flex flex-wrap gap-4">
                  <a href={PRIVACY_URL} className="hover:text-gray-900 dark:hover:text-gray-100">
                    Privacy
                  </a>
                  <a href={TERMS_URL} className="hover:text-gray-900 dark:hover:text-gray-100">
                    Terms
                  </a>
                  <a href={SUPPORT_URL} className="hover:text-gray-900 dark:hover:text-gray-100">
                    Support
                  </a>
                  <a
                    href={SOCIAL_LINKEDIN}
                    className="hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    LinkedIn
                  </a>
                  <a href={SOCIAL_X} className="hover:text-gray-900 dark:hover:text-gray-100">
                    X
                  </a>
                </div>
              </div>
            </footer>
          </div>
          <MobileBottomNav />
          <ChatbotWidget />
        </div>
      </body>
    </html>
  );
}
