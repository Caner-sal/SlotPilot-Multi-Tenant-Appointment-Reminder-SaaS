"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1 && segments[0] === "dashboard") return "Genel Bakış";
  const last = segments[segments.length - 1];
  const titles: Record<string, string> = {
    appointments: "Randevular",
    services: "Hizmetler",
    staff: "Çalışanlar",
    availability: "Müsaitlik",
    analytics: "Analitik",
    billing: "Abonelik",
    reminders: "Hatırlatmalar",
    "audit-logs": "İşlem Kayıtları",
    settings: "Ayarlar",
    locations: "Şubeler",
  };
  return titles[last] ?? last.charAt(0).toUpperCase() + last.slice(1);
}

function UserAvatar({ email, name }: { email?: string | null; name?: string | null }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : email
    ? email[0].toUpperCase()
    : "U";

  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
        {initials}
      </div>
      <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[160px]">
        {name ?? email}
      </span>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
    fetch("/api/organizations/current")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setOrg(data);
      })
      .catch(() => null);
  }, []);

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="md:hidden w-10" />
        <div>
          {org && (
            <p className="text-xs text-muted-foreground leading-none mb-0.5">
              {org.name}
            </p>
          )}
          <h1 className="text-lg font-semibold leading-none">{pageTitle}</h1>
        </div>
      </div>

      {session?.user && (
        <UserAvatar
          email={session.user.email}
          name={session.user.name}
        />
      )}
    </header>
  );
}
