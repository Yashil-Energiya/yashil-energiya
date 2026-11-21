"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@/components/GoogleAnalytics/GoogleAnalytics";

type ThirdPartyScriptsProps = {
  gaMeasurementId: string;
};

export function ThirdPartyScripts({ gaMeasurementId }: ThirdPartyScriptsProps) {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(() => setCanLoad(true), {
        timeout: 3000,
      });

      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(() => setCanLoad(true), 2500);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  if (!canLoad) {
    return null;
  }

  return <GoogleAnalytics measurementId={gaMeasurementId} />;
}
