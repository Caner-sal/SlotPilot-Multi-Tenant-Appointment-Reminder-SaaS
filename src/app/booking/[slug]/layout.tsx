import Link from "next/link";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <span className="text-blue-600">✈</span>
            Randevo
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="text-xs text-gray-400">Powered by Randevo</span>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
