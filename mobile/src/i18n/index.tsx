import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setApiLocale } from "../api/client";
import { fallbackLocale, supportedLocales, translations, type MobileLocale } from "./config";

const LOCALE_KEY = "slotpilot_mobile_locale";

type I18nContextValue = {
  locale: MobileLocale;
  setLocale: (locale: MobileLocale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function normalizeLocale(raw?: string | null): MobileLocale {
  const base = (raw ?? "").split("-")[0].toLowerCase();
  return supportedLocales.includes(base as MobileLocale) ? (base as MobileLocale) : fallbackLocale;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<MobileLocale>(fallbackLocale);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const persisted = await AsyncStorage.getItem(LOCALE_KEY);
      const detected = normalizeLocale(
        persisted ?? Localization.getLocales()?.[0]?.languageTag ?? fallbackLocale
      );
      if (!mounted) return;
      setLocaleState(detected);
      setApiLocale(detected);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function setLocale(localeValue: MobileLocale) {
    setLocaleState(localeValue);
    setApiLocale(localeValue);
    AsyncStorage.setItem(LOCALE_KEY, localeValue).catch(() => undefined);
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string, vars?: Record<string, string | number>) => {
        const template = translations[locale][key] ?? translations[fallbackLocale][key] ?? key;
        if (!vars) return template;
        return Object.entries(vars).reduce(
          (result, [name, value]) => result.replaceAll(`{{${name}}}`, String(value)),
          template
        );
      }
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return ctx;
}
