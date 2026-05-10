"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const iconProps = {
  width: 16, height: 16, fill: "none" as const, stroke: "currentColor" as const,
  strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

const navSections = [
  {
    label: "Genel",
    items: [
      {
        href: "/dashboard", label: "Kontrol Paneli",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
      },
      {
        href: "/dashboard/appointments", label: "Randevular",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
      },
      {
        href: "/dashboard/analytics", label: "Analitik",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
      },
    ],
  },
  {
    label: "Yönetim",
    items: [
      {
        href: "/dashboard/services", label: "Hizmetler",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>,
      },
      {
        href: "/dashboard/staff", label: "Çalışanlar",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
      },
      {
        href: "/dashboard/availability", label: "Müsaitlik",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
      },
      {
        href: "/dashboard/locations", label: "Şubeler",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      {
        href: "/dashboard/reminders", label: "Hatırlatmalar",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
      },
      {
        href: "/dashboard/billing", label: "Abonelik",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
      },
      {
        href: "/dashboard/whatsapp", label: "WhatsApp",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
      },
      {
        href: "/dashboard/audit-logs", label: "İşlem Geçmişi",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
      },
      {
        href: "/dashboard/settings", label: "Ayarlar",
        icon: <svg viewBox="0 0 24 24" {...iconProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
      },
    ],
  },
];

function RandevoLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="6" width="28" height="23" rx="5" fill="rgba(119,104,212,0.14)" stroke="#7768d4" strokeWidth="1.4" />
      <path d="M2 12.5h28" stroke="#7768d4" strokeWidth="0.9" opacity="0.4" />
      <line x1="10" y1="3" x2="10" y2="9.5" stroke="#7768d4" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="3" x2="22" y2="9.5" stroke="#7768d4" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 20.5L14.5 25L22 17" stroke="#7768d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
        active
          ? "bg-[rgba(119,104,212,0.14)] text-[#a59cf0]"
          : "text-[#8a8aaa] hover:bg-[rgba(119,104,212,0.1)] hover:text-[#f0eff8]"
      )}
      style={{ fontFamily: "var(--font-body, Nunito, sans-serif)" }}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <div className="flex h-full flex-col" style={{ background: "#0b0b16" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-[18px]" style={{ borderBottom: "1px solid rgba(119,104,212,0.1)" }}>
        <RandevoLogo />
        <span style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.4px" }}>
          Randevo
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-2.5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "#3a3a58", fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
              {section.label}
            </p>
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-3" style={{ borderTop: "1px solid rgba(119,104,212,0.1)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 text-[#8a8aaa] hover:bg-[rgba(119,104,212,0.1)] hover:text-[#f0eff8]"
          style={{ fontFamily: "var(--font-body, Nunito, sans-serif)", background: "none", border: "none", cursor: "pointer" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-30"
        style={{ borderRight: "1px solid rgba(119,104,212,0.1)" }}>
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-40 rounded-lg p-2 shadow-sm"
          style={{ background: "#111120", border: "1px solid rgba(119,104,212,0.15)" }}
          aria-label="Menüyü aç"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a8aaa" strokeWidth="2" strokeLinecap="round">
            <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl" style={{ borderRight: "1px solid rgba(119,104,212,0.15)" }}>
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1"
                style={{ color: "#8a8aaa", background: "none", border: "none", cursor: "pointer" }}
                aria-label="Kapat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
              {sidebarContent}
            </aside>
          </>
        )}
      </div>
    </>
  );
}
