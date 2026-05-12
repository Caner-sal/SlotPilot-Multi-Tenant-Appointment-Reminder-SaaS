"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { defaultLocale, localeCookieName, localeMetadata, locales, type AppLocale } from "@/i18n/locales";
import { getLocaleFromPath, replacePathLocale } from "@/i18n/pathing";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeLocale = useMemo(() => getLocaleFromPath(pathname) ?? defaultLocale, [pathname]);
  const active = localeMetadata[activeLocale];
  const listboxId = "language-switcher-options";

  useEffect(() => {
    const index = Math.max(locales.indexOf(activeLocale), 0);
    setFocusedIndex(index);
  }, [activeLocale]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  function focusOption(index: number) {
    const bounded = Math.max(0, Math.min(index, locales.length - 1));
    setFocusedIndex(bounded);
    requestAnimationFrame(() => optionRefs.current[bounded]?.focus());
  }

  function handleSwitch(nextLocale: AppLocale) {
    if (nextLocale === activeLocale) {
      setOpen(false);
      return;
    }
    const nextPath = replacePathLocale(pathname, nextLocale);
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.replace(nextPath);
    setOpen(false);
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      focusOption(focusedIndex);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      focusOption(focusedIndex);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
      if (!open) {
        focusOption(focusedIndex);
      }
    }
  }

  function handleOptionKeyDown(index: number, locale: AppLocale, e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusOption((index + 1) % locales.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      focusOption((index - 1 + locales.length) % locales.length);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      focusOption(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      focusOption(locales.length - 1);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSwitch(locale);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t("language")}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-current hover:bg-white/15"
      >
        <span aria-hidden>{active.flag}</span>
        <span>{active.nativeLabel}</span>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 z-50 mt-2 min-w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg"
        >
          {locales.map((locale, index) => {
            const m = localeMetadata[locale];
            const isActive = locale === activeLocale;
            return (
              <button
                key={locale}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                role="option"
                tabIndex={focusedIndex === index ? 0 : -1}
                aria-selected={isActive}
                onClick={() => handleSwitch(locale)}
                onKeyDown={(e) => handleOptionKeyDown(index, locale, e)}
                className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span aria-hidden>{m.flag}</span>
                <span>{m.nativeLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
