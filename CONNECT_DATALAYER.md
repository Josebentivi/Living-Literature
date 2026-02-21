# Connect `window.dataLayer` to GA4 / GTM

This project already emits marketing events into `window.dataLayer` from `lib/analytics.ts`.

## 1. What the code already does

### Event producers
- `components/cta-link.tsx`
- `components/navigation.tsx`
- `components/behavior-tracker.tsx`

### Event transport
- `lib/analytics.ts`
  - pushes objects into `window.dataLayer`
  - if `window.gtag` exists, also sends `gtag("event", ...)`

### Analytics script loader
- `components/analytics-scripts.tsx`
  - If `NEXT_PUBLIC_GTM_ID` is set: loads GTM
  - If `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set and GTM is empty: loads direct GA4 (`gtag.js`)

### Required emitted events
- `cta_click_primary`
- `cta_click_secondary`
- `nav_click`
- `section_view`
- `faq_expand`
- `tier_compare_interaction`
- `outbound_to_app`

## 2. Environment configuration

Set these in `.env`:

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Use one of these patterns:
- Recommended: set only `NEXT_PUBLIC_GTM_ID` and route GA4 through GTM.
- Alternative: set only `NEXT_PUBLIC_GA4_MEASUREMENT_ID` for direct GA4.

Then rebuild:

```bash
npm run build
```

## 3. Recommended setup: GTM -> GA4

### 3.1 In Google Tag Manager
1. Open GTM container.
2. Add a **Google tag** (or GA4 Configuration tag) with your GA4 Measurement ID.
3. Trigger: **All Pages**.
4. Save.

### 3.2 Create custom event trigger
1. New Trigger -> **Custom Event**.
2. Event name regex:

```text
^(cta_click_primary|cta_click_secondary|nav_click|section_view|faq_expand|tier_compare_interaction|outbound_to_app)$
```

3. Save as `CE - Pensador Marketing Events`.

### 3.3 Create GA4 Event tag
1. New Tag -> **GA4 Event**.
2. Configuration tag: select your GA4 config tag.
3. Event name: `{{Event}}` (built-in variable).
4. Add event parameters (map from dataLayer variables):
   - `label`
   - `placement`
   - `page`
   - `destination`
   - `location`
   - `target`
   - `section`
   - `faq`
   - `interaction`
   - `tier`
5. Trigger: `CE - Pensador Marketing Events`.
6. Save and publish.

### 3.4 Create GTM Data Layer Variables
Create one Data Layer Variable per key you want in GA4:
- `DLV - label` -> `label`
- `DLV - placement` -> `placement`
- `DLV - page` -> `page`
- `DLV - section` -> `section`
- etc.

Use these variables in the GA4 Event tag parameter values.

## 4. Alternative setup: Direct GA4 (`gtag.js`)

If GTM is not used, set only:

```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

The site loads `gtag.js` and sends events via `window.gtag("event", name, params)` in `lib/analytics.ts`.

Note:
- You do not need GTM triggers in this mode.
- You still need GA4 custom dimensions for non-standard params.

## 5. GA4 custom dimensions (important)

GA4 only auto-collects standard fields. For custom parameters, register custom dimensions:

1. GA4 -> Admin -> Custom definitions -> Create custom dimension.
2. Scope: Event.
3. Add dimensions for keys you analyze often:
   - `placement`
   - `page`
   - `section`
   - `tier`
   - `interaction`
   - `destination`
4. Wait for new data (not retroactive).

## 6. How to validate instrumentation

### 6.1 Browser check
Open DevTools console and run:

```js
window.dataLayer?.slice(-5)
```

Click a CTA/nav item and confirm an object like:

```js
{
  event: "cta_click_primary",
  timestamp: "2026-02-15T18:00:00.000Z",
  label: "Start Using Pensador",
  placement: "home_hero_primary",
  page: "/"
}
```

### 6.2 GTM Preview
1. In GTM click **Preview**.
2. Connect to your local or deployed site.
3. Trigger events and confirm:
   - custom event appears
   - GA4 Event tag fires

### 6.3 GA4 DebugView
1. GA4 -> Admin -> DebugView.
2. Trigger events in your browser.
3. Confirm event names and parameter payloads.

## 7. Event-to-business mapping

- `cta_click_primary` / `cta_click_secondary`: conversion intent
- `outbound_to_app`: marketing -> app handoff
- `nav_click`: content discovery behavior
- `section_view`: section engagement depth
- `faq_expand`: onboarding friction topics
- `tier_compare_interaction`: upgrade intent and pricing interest

## 8. Common mistakes and fixes

- No events in GTM Preview:
  - Check `NEXT_PUBLIC_GTM_ID` is set and app rebuilt.
- Events in dataLayer but not GA4:
  - GA4 Event tag trigger mismatch.
  - Missing GA4 config tag.
- Parameters missing in GA4 reports:
  - Custom dimensions not created for those params.
- Double counting:
  - Avoid using GTM and direct GA4 simultaneously unless intentional.

## 9. Launch checklist

1. Set production `NEXT_PUBLIC_GTM_ID` or `NEXT_PUBLIC_GA4_MEASUREMENT_ID`.
2. Publish GTM container (if GTM path).
3. Verify all 7 required events in GTM Preview and GA4 DebugView.
4. Confirm outbound CTA events include `placement` and `page`.
5. Create GA4 Exploration for:
   - event name by landing page
   - CTA clicks by placement
   - tier compare interactions by page
