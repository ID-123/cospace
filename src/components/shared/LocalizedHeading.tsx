"use client";

import {
  useLocale,
  type TranslationKey,
} from "@/components/shared/LocaleProvider";

type LocalizedHeadingProps = {
  translationKey: TranslationKey;
  as?: "h1" | "h2" | "p";
};

export function LocalizedHeading({
  translationKey,
  as = "h1",
}: LocalizedHeadingProps) {
  const { t } = useLocale();
  const Element = as;
  return <Element>{t(translationKey)}</Element>;
}
