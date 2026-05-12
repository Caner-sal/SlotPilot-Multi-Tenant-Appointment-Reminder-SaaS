import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, localeCookieName, resolveLocale, type AppLocale } from "./locales";

import tr from "@/messages/tr.json";
import en from "@/messages/en.json";
import de from "@/messages/de.json";
import ar from "@/messages/ar.json";

const allMessages = {
  tr,
  en,
  de,
  ar,
} as const;

export function getMessagesForLocale(locale: AppLocale) {
  return allMessages[locale] ?? allMessages[defaultLocale];
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);

  return {
    locale,
    messages: getMessagesForLocale(locale),
  };
});
