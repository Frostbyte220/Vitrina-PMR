"use client";

import dynamic from "next/dynamic";

const SellerOnboardingWidget = dynamic(
  () =>
    import("@/components/onboarding/SellerOnboardingWidget").then(
      (m) => m.SellerOnboardingWidget
    ),
  { ssr: false }
);

export function SellerOnboardingWidgetLazy() {
  return <SellerOnboardingWidget />;
}
