import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, localeCookieName, resolveLocale, type AppLocale } from "./locales";

import tr from "@/messages/tr.json";
import en from "@/messages/en.json";
import de from "@/messages/de.json";
import ar from "@/messages/ar.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import it from "@/messages/it.json";
import fa from "@/messages/fa.json";
import ru from "@/messages/ru.json";
import nl from "@/messages/nl.json";

const allMessages = {
  tr,
  en,
  de,
  ar,
  es,
  fr,
  it,
  fa,
  ru,
  nl,
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
