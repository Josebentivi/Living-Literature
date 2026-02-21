export type AnalyticsEventName =
  | "cta_click_primary"
  | "cta_click_secondary"
  | "nav_click"
  | "section_view"
  | "faq_expand"
  | "tier_compare_interaction"
  | "outbound_to_app";

type AnalyticsPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(
  event: AnalyticsEventName,
  payload: AnalyticsPayload = {},
): void {
  if (typeof window === "undefined") {
    return;
  }

  const entry = {
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(entry);

  if (typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", entry);
  }
}
