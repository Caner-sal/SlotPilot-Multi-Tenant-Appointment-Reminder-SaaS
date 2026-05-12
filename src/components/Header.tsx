"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { locales } from "@/i18n/locales";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

function getPageTitle(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const segments =
    parts.length > 0 && locales.includes(parts[0] as (typeof locales)[number])
      ? parts.slice(1)
      : parts;
  if (segments.length === 1 && segments[0] === "dashboard") return "Kontrol Paneli";
  const last = segments[segments.length - 1];
  const titles: Record<string, string> = {
    appointments:  "Randevular",
    services:      "Hizmetler",
    staff:         "Çalışanlar",
    availability:  "Müsaitlik",
    analytics:     "Analitik",
    billing:       "Abonelik",
    reminders:     "Hatırlatmalar",
    "audit-logs":  "İşlem Kayıtları",
    settings:      "Ayarlar",
    locations:     "Şubeler",
    whatsapp:      "WhatsApp",
  };
  return titles[last] ?? last.charAt(0).toUpperCase() + last.slice(1);
}

function UserAvatar({ email, name }: { email?: string | null; name?: string | null }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : email ? email[0].toUpperCase() : "U";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", background: "#7768d4",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 12, fontWeight: 700, color: "#fff",
        flexShrink: 0,
      }}>
        {initials}
      </div>
      <span className="hidden sm:block text-sm truncate max-w-[160px]" style={{ color: "#8a8aaa" }}>
        {name ?? email}
      </span>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
    fetch("/api/organizations/current")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => { if (json?.data) setOrg(json.data); })
      .catch(() => null);
  }, []);

  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className="h-15 flex items-center justify-between px-6"
      style={{
        height: 60,
        background: "#111120",
        borderBottom: "1px solid rgba(119,104,212,0.1)",
        position: "sticky", top: 0, zIndex: 40,
      }}
    >
      <div className="flex flex-col">
        {org && (
          <p style={{ fontSize: 11, color: "#8a8aaa", marginBottom: 2, fontFamily: "var(--font-body, Nunito, sans-serif)" }}>
            {org.name}
          </p>
        )}
        <h1 style={{
          fontSize: 16, fontWeight: 600, lineHeight: 1,
          fontFamily: "var(--font-heading, Outfit, sans-serif)",
          letterSpacing: "-0.02em",
        }}>
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        {org && (
          <a
            href={`/booking/${org.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 12, color: "#a59cf0", fontWeight: 600,
              background: "rgba(119,104,212,0.1)",
              border: "1px solid rgba(119,104,212,0.22)",
              padding: "6px 12px", borderRadius: 8, transition: "all 0.15s",
              fontFamily: "var(--font-heading, Outfit, sans-serif)",
              textDecoration: "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Rezervasyon Sayfası
          </a>
        )}
        {session?.user && (
          <UserAvatar email={session.user.email} name={session.user.name} />
        )}
      </div>
    </header>
  );
}
