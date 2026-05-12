"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { defaultLocale, localeCookieName, localeMetadata, locales, type AppLocale } from "@/i18n/locales";
import { getLocaleFromPath, replacePathLocale } from "@/i18n/pathing";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const activeLocale = useMemo(() => getLocaleFromPath(pathname) ?? defaultLocale, [pathname]);
  const active = localeMetadata[activeLocale];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Dil seçici"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-current hover:bg-white/15"
      >
        <span>{active.flag}</span>
        <span>{active.nativeLabel}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg"
        >
          {locales.map((locale) => {
            const m = localeMetadata[locale];
            const isActive = locale === activeLocale;
            return (
              <button
                key={locale}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSwitch(locale)}
                className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{m.flag}</span>
                <span>{m.nativeLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
