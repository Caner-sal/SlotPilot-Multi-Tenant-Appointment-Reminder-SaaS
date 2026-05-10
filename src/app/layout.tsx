import type { Metadata } from "next";
import { Outfit, Nunito } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${outfit.variable} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  );
}
