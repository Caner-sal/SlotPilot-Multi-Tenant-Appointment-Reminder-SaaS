import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessagesForLocale } from "@/i18n/request";
import { localeCookieName, localeMetadata, resolveLocale } from "@/i18n/locales";
import { getBaseUrl, localeAlternates } from "@/lib/seo/i18n";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Randevo - Appointment and Reminder Platform",
  description: "Affordable appointment and reminder SaaS for local service businesses",
  alternates: {
    canonical: "/",
    languages: localeAlternates("/")
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const locale = resolveLocale(
    headerStore.get("x-app-locale") ?? cookieStore.get(localeCookieName)?.value
  );

  const messages = getMessagesForLocale(locale);

  return (
    <html lang={locale} dir={localeMetadata[locale].direction} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
