"use client";

import {
  useLocale,
  type TranslationKey,
} from "@/components/shared/LocaleProvider";

export function LocalizedText({
  translationKey,
}: {
  translationKey: TranslationKey;
}) {
  const { t } = useLocale();
  return <>{t(translationKey)}</>;
}
