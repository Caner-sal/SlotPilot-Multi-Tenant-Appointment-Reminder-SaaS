import type { Metadata } from "next";
import { Outfit, Nunito } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessagesForLocale } from "@/i18n/request";
import { localeCookieName, localeMetadata, resolveLocale } from "@/i18n/locales";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Randevo — Randevu ve Hatırlatma Platformu",
  description:
    "Küçük işletmeler için Türkçe, uygun fiyatlı randevu yönetimi ve hatırlatma SaaS platformu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const messages = getMessagesForLocale(locale);

  return (
    <html
      lang={locale}
      dir={localeMetadata[locale].direction}
      suppressHydrationWarning
    >
      <body className={`${outfit.variable} ${nunito.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
