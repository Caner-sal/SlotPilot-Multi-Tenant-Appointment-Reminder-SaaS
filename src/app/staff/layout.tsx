import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.appRole !== "STAFF_MEMBER") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="flex items-center justify-between border-b bg-card px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-bold text-foreground">Randevo Çalışan</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/staff/dashboard" className="text-muted-foreground hover:text-foreground">
              Panel
            </Link>
            <Link href="/staff/appointments" className="text-muted-foreground hover:text-foreground">
              Randevular
            </Link>
            <Link href="/staff/availability" className="text-muted-foreground hover:text-foreground">
              Müsaitlik
            </Link>
          </nav>
        </div>
        <div className="text-sm text-muted-foreground">{session.user.name ?? session.user.email}</div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
