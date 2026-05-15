import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || session.user.platformRole !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">Randevo Yönetim</span>
          <nav className="flex gap-4 text-sm flex-wrap">
            <Link href="/admin" className="hover:text-muted-foreground/70">Genel Bakış</Link>
            <Link href="/admin/organizations" className="hover:text-muted-foreground/70">İşletmeler</Link>
            <Link href="/admin/subscriptions" className="hover:text-muted-foreground/70">Abonelikler</Link>
            <Link href="/admin/usage" className="hover:text-muted-foreground/70">Kullanım</Link>
            <Link href="/admin/audit-logs" className="hover:text-muted-foreground/70">İşlem Kayıtları</Link>
            <Link href="/admin/health" className="hover:text-muted-foreground/70">Sağlık</Link>
            <Link href="/admin/product-events" className="hover:text-muted-foreground/70">Product Events</Link>
          </nav>
        </div>
        <div className="text-sm text-muted-foreground/80">{session.user.email}</div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
