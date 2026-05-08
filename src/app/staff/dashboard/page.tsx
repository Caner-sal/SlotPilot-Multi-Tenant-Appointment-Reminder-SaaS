import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function StaffDashboardPage() {
  const session = await auth();
  if (!session?.user?.staffId) redirect("/login");

  const staffId = session.user.staffId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayAppts, pendingAppts, upcomingAppts] = await db.$transaction([
    db.appointment.count({
      where: { staffId, startTime: { gte: today, lt: tomorrow } },
    }),
    db.appointment.count({
      where: { staffId, status: "PENDING", startTime: { gte: today } },
    }),
    db.appointment.findMany({
      where: { staffId, startTime: { gte: today } },
      include: {
        service: { select: { name: true } },
        customer: { select: { fullName: true } },
      },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Welcome back, {session.user.name ?? "Staff"}
      </h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Today&apos;s Appointments</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{todayAppts}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingAppts}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Upcoming (5)</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{upcomingAppts.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">Next Appointments</h2>
        </div>
        {upcomingAppts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No upcoming appointments.</div>
        ) : (
          <ul className="divide-y">
            {upcomingAppts.map((apt) => (
              <li key={apt.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{apt.customer.fullName}</p>
                  <p className="text-sm text-gray-500">{apt.service.name}</p>
                </div>
                <div className="text-sm text-right">
                  <p className="text-gray-900">{new Date(apt.startTime).toLocaleDateString()}</p>
                  <p className="text-gray-500">{new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
