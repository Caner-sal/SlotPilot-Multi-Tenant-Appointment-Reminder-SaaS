import { db } from "@/lib/db";
import Link from "next/link";

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Organizations ({organizations.length})</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Organization</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Appointments</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Staff</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
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
                  <span className="font-medium">{org.subscription?.plan ?? "FREE"}</span>
                </td>
                <td className="px-4 py-3">{org._count.appointments}</td>
                <td className="px-4 py-3">{org._count.staff}</td>
                <td className="px-4 py-3">
                  {org.suspended ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Suspended</span>
                  ) : org.bookingEnabled ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Booking Off</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/organizations/${org.id}`} className="text-blue-600 hover:underline text-xs">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {organizations.length === 0 && (
          <div className="text-center py-8 text-gray-500">No organizations yet.</div>
        )}
      </div>
    </div>
  );
}
