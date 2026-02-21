import Script from "next/script";

import { GA4_MEASUREMENT_ID, GTM_ID } from "@/lib/site";

export function AnalyticsScripts(): React.JSX.Element | null {
  const hasGtm = GTM_ID.trim().length > 0;
  const hasGa4 = GA4_MEASUREMENT_ID.trim().length > 0;

  if (!hasGtm && !hasGa4) {
    return null;
  }

  return (
    <>
      <Script id="datalayer-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];`}
      </Script>

      {hasGtm ? (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
          <noscript>
            <iframe
              title="Google Tag Manager"
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      ) : null}

      {hasGa4 && !hasGtm ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: true });`}
          </Script>
        </>
      ) : null}
    </>
  );
}
