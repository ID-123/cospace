"use client";

import { useLocale } from "@/components/shared/LocaleProvider";

export function LocalizedPrice({ amount }: { amount: number }) {
  const { locale } = useLocale();
  return <>${amount.toLocaleString(locale === "en" ? "en-US" : "es-CO")}</>;
}
