import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SlotPilot — Randevu ve Hatırlatma Platformu",
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
