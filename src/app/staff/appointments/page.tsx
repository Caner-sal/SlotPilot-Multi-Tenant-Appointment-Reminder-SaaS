import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-gray-100 text-gray-700",
};

export default async function StaffAppointmentsPage() {
  const session = await auth();
  if (!session?.user?.staffId) redirect("/login");

  const staffId = session.user.staffId;

  const appointments = await db.appointment.findMany({
    where: { staffId },
    include: {
      service: { select: { name: true, durationMinutes: true } },
      customer: { select: { fullName: true, phone: true, email: true } },
    },
    orderBy: { startTime: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Service</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date & Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{apt.customer.fullName}</div>
                  <div className="text-gray-500 text-xs">{apt.customer.phone ?? apt.customer.email ?? ""}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{apt.service.name}</div>
                  <div className="text-gray-500 text-xs">{apt.service.durationMinutes} min</div>
                </td>
                <td className="px-4 py-3">
                  <div>{new Date(apt.startTime).toLocaleDateString()}</div>
                  <div className="text-gray-500 text-xs">
                    {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[apt.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">No appointments yet.</div>
        )}
      </div>
    </div>
  );
}
