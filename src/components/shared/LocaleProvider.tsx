"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import spanishMessages from "../../../messages/es.json";
import englishMessages from "../../../messages/en.json";

type Locale = "es" | "en";
export type TranslationKey = Extract<keyof typeof spanishMessages, string>;
type TranslationValues = Record<string, string | number | Date>;

type Theme = "light" | "dark";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
  initialTheme = "light",
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialTheme?: Theme;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    document.cookie = `cospace_locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    document.cookie = `cospace_theme=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);

  const messages = locale === "es" ? spanishMessages : englishMessages;
  const translate = useCallback(
    (key: TranslationKey, values?: TranslationValues) => {
      let message = String(messages[key] ?? spanishMessages[key]);
      if (values) {
        for (const [name, value] of Object.entries(values)) {
          message = message.replaceAll(`{${name}}`, String(value));
        }
      }
      return message;
    },
    [messages],
  );
  const value = useMemo(
    () => ({ locale, setLocale, theme, setTheme, t: translate }),
    [locale, setLocale, theme, setTheme, translate],
  );

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </NextIntlClientProvider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export function ThemeSwitcher() {
  const { theme, setTheme, t } = useLocale();
  const label = theme === "dark" ? t("lightTheme") : t("darkTheme");

  return (
    <button
      type="button"
      className="theme-switcher"
      aria-label={label}
      title={label}
      aria-pressed={theme === "dark"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className="locale-switcher">
      <span className="visually-hidden">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={locale}
        onChange={(event) =>
          setLocale(event.currentTarget.value === "en" ? "en" : "es")
        }
      >
        <option value="es">{compact ? "ES" : t("spanish")}</option>
        <option value="en">{compact ? "EN" : t("english")}</option>
      </select>
    </label>
  );
}
