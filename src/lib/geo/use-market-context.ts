"use client";

import { useMemo } from "react";
import { getMarketConfig, type MarketConfig } from "@/config/locale-market";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.split("=")[1] ?? null : null;
}

export function useMarketContext(): MarketConfig & { isTurkey: boolean } {
  return useMemo(() => {
    const country = getCookieValue("randevo_country") ?? "TR";
    const config = getMarketConfig(country);
    return { ...config, isTurkey: config.landingVariant === "turkey" };
  }, []);
}
