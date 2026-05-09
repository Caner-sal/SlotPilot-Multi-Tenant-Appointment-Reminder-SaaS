import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || session.user.platformRole !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">SlotPilot Yönetim</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="hover:text-gray-300">Genel Bakış</Link>
            <Link href="/admin/organizations" className="hover:text-gray-300">İşletmeler</Link>
            <Link href="/admin/audit-logs" className="hover:text-gray-300">İşlem Kayıtları</Link>
          </nav>
        </div>
        <div className="text-sm text-gray-400">{session.user.email}</div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
