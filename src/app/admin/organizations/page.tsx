import { db } from "@/lib/db";
import Link from "next/link";

function formatPlan(plan: string | undefined): string {
  switch (plan) {
    case "FREE":
      return "ÜCRETSİZ";
    case "STARTER":
      return "BAŞLANGIÇ";
    case "PRO":
      return "PRO";
    case "ENTERPRISE":
      return "KURUMSAL";
    default:
      return plan ?? "ÜCRETSİZ";
  }
}

export default async function AdminOrganizationsPage() {
  const organizations = await db.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      bookingEnabled: true,
      suspended: true,
      createdAt: true,
      subscription: { select: { plan: true, status: true } },
      _count: { select: { appointments: true, staff: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">İşletmeler ({organizations.length})</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">İşletme</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Randevu</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Çalışan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {organizations.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{org.name}</div>
                  <div className="text-gray-500 text-xs">{org.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{formatPlan(org.subscription?.plan)}</span>
                </td>
                <td className="px-4 py-3">{org._count.appointments}</td>
                <td className="px-4 py-3">{org._count.staff}</td>
                <td className="px-4 py-3">
                  {org.suspended ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Askıda</span>
                  ) : org.bookingEnabled ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Aktif</span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Rezervasyon Kapalı</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/organizations/${org.id}`} className="text-blue-600 hover:underline text-xs">
                    Görüntüle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {organizations.length === 0 && (
          <div className="text-center py-8 text-gray-500">Henüz işletme yok.</div>
        )}
      </div>
    </div>
  );
}
