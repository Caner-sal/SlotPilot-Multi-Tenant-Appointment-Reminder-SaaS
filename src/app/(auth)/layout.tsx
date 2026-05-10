import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Randevo — Giriş",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Login, Register ve Onboarding sayfaları kendi tam ekran layout'larını yönetiyor.
  // Bu wrapper sadece sade bir geçiş katmanı.
  return (
    <div className="min-h-screen" style={{ background: "#09090e" }}>
      {children}
    </div>
  );
}
