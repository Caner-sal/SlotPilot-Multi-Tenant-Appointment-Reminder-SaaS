import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { getTranslations } from "next-intl/server";

export default async function BookingLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("bookingLayout");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground font-bold text-lg">
            <span className="text-primary">✈</span>
            Randevo
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="text-xs text-gray-400">{t("poweredBy")}</span>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

