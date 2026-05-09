import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.appRole !== "STAFF_MEMBER") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-900">SlotPilot Çalışan</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/staff/dashboard" className="text-gray-600 hover:text-gray-900">
              Panel
            </Link>
            <Link href="/staff/appointments" className="text-gray-600 hover:text-gray-900">
              Randevular
            </Link>
            <Link href="/staff/availability" className="text-gray-600 hover:text-gray-900">
              Müsaitlik
            </Link>
          </nav>
        </div>
        <div className="text-sm text-gray-500">{session.user.name ?? session.user.email}</div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
