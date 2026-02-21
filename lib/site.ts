export type ProductScreenshot = {
  src: string;
  alt: string;
  caption: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Pensador";
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Pensador";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pensador.ai";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.pensador.ai";
export const PRIVACY_URL = process.env.NEXT_PUBLIC_PRIVACY_URL ?? `${SITE_URL}/privacy`;
export const TERMS_URL = process.env.NEXT_PUBLIC_TERMS_URL ?? `${SITE_URL}/terms`;
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@pensador.ai";
export const SUPPORT_URL =
  process.env.NEXT_PUBLIC_SUPPORT_URL ?? `mailto:${SUPPORT_EMAIL}`;
export const SOCIAL_LINKEDIN =
  process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? "https://www.linkedin.com";
export const SOCIAL_X = process.env.NEXT_PUBLIC_SOCIAL_X ?? "https://x.com";

export const DEFAULT_UTM = {
  source: process.env.NEXT_PUBLIC_UTM_SOURCE ?? "pensador_marketing",
  medium: process.env.NEXT_PUBLIC_UTM_MEDIUM ?? "website",
  campaign: process.env.NEXT_PUBLIC_UTM_CAMPAIGN ?? "marketing_launch_2026",
};

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";
export const OG_IMAGE_URL =
  process.env.NEXT_PUBLIC_OG_IMAGE_URL ?? `${SITE_URL}/screenshots/streaming-workspace.svg`;

export const PRODUCT_SCREENSHOTS: ProductScreenshot[] = [
  {
    src:
      process.env.NEXT_PUBLIC_SCREENSHOT_1_SRC ??
      "/screenshots/streaming-workspace.svg",
    alt:
      process.env.NEXT_PUBLIC_SCREENSHOT_1_ALT ??
      "Pensador workspace showing a live streaming assistant response and action checklist.",
    caption:
      process.env.NEXT_PUBLIC_SCREENSHOT_1_CAPTION ??
      "Streaming workspace for fast first-draft answers.",
  },
  {
    src:
      process.env.NEXT_PUBLIC_SCREENSHOT_2_SRC ??
      "/screenshots/tool-orchestration.svg",
    alt:
      process.env.NEXT_PUBLIC_SCREENSHOT_2_ALT ??
      "Pensador tool orchestration view with web search and evidence panel in context.",
    caption:
      process.env.NEXT_PUBLIC_SCREENSHOT_2_CAPTION ??
      "Tool orchestration for source-backed decisions.",
  },
  {
    src:
      process.env.NEXT_PUBLIC_SCREENSHOT_3_SRC ??
      "/screenshots/deep-analysis.svg",
    alt:
      process.env.NEXT_PUBLIC_SCREENSHOT_3_ALT ??
      "Pensador deep analysis mode with model reasoning pass and recommendation table.",
    caption:
      process.env.NEXT_PUBLIC_SCREENSHOT_3_CAPTION ??
      "Deep analysis mode for high-impact work.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      process.env.NEXT_PUBLIC_TESTIMONIAL_1_QUOTE ??
      "Pensador cut our planning time in half. We now go from idea to executable brief in one session.",
    name: process.env.NEXT_PUBLIC_TESTIMONIAL_1_NAME ?? "Marina C.",
    role: process.env.NEXT_PUBLIC_TESTIMONIAL_1_ROLE ?? "Head of Product Operations",
    company: process.env.NEXT_PUBLIC_TESTIMONIAL_1_COMPANY ?? "Pilot Customer (B2B SaaS)",
  },
  {
    quote:
      process.env.NEXT_PUBLIC_TESTIMONIAL_2_QUOTE ??
      "The combination of streaming output and tool-backed evidence made team reviews much faster.",
    name: process.env.NEXT_PUBLIC_TESTIMONIAL_2_NAME ?? "Felipe R.",
    role: process.env.NEXT_PUBLIC_TESTIMONIAL_2_ROLE ?? "Research Lead",
    company:
      process.env.NEXT_PUBLIC_TESTIMONIAL_2_COMPANY ?? "Pilot Customer (Consulting)",
  },
  {
    quote:
      process.env.NEXT_PUBLIC_TESTIMONIAL_3_QUOTE ??
      "We switched from scattered AI tools to one repeatable workflow and improved delivery consistency.",
    name: process.env.NEXT_PUBLIC_TESTIMONIAL_3_NAME ?? "Ana P.",
    role: process.env.NEXT_PUBLIC_TESTIMONIAL_3_ROLE ?? "Strategy Manager",
    company: process.env.NEXT_PUBLIC_TESTIMONIAL_3_COMPANY ?? "Pilot Customer (Fintech)",
  },
];

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/library", label: "Library" },
  { href: "/how-to-use", label: "How To Use" },
] as const;
