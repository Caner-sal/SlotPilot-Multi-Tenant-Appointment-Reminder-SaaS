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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Tekrar hoş geldiniz, {session.user.name ?? "Çalışan"}
      </h1>
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Bugünkü Randevular</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{todayAppts}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Bekleyen</p>
          <p className="mt-1 text-3xl font-bold text-yellow-600">{pendingAppts}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Yaklaşan (5)</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{upcomingAppts.length}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold text-gray-900">Sıradaki Randevular</h2>
        </div>
        {upcomingAppts.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Yaklaşan randevu yok.</div>
        ) : (
          <ul className="divide-y">
            {upcomingAppts.map((apt) => (
              <li key={apt.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{apt.customer.fullName}</p>
                  <p className="text-sm text-gray-500">{apt.service.name}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-900">
                    {new Date(apt.startTime).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}
                  </p>
                  <p className="text-gray-500">
                    {new Date(apt.startTime).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Istanbul",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
