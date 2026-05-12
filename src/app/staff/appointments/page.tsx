import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-gray-100 text-gray-700",
};

export default async function StaffAppointmentsPage() {
  const t = await getTranslations("staffPortal");
  const tCommon = await getTranslations("common");
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

  const STATUS_LABELS: Record<string, string> = {
    PENDING: tCommon("pending"),
    CONFIRMED: tCommon("confirmed"),
    COMPLETED: tCommon("completed"),
    CANCELLED: tCommon("cancelled"),
    NO_SHOW: tCommon("noShow"),
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("myAppointments")}</h1>
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t("customerCol")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t("serviceCol")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t("dateTimeCol")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{tCommon("status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{apt.customer.fullName}</div>
                  <div className="text-xs text-gray-500">{apt.customer.phone ?? apt.customer.email ?? ""}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{apt.service.name}</div>
                  <div className="text-xs text-gray-500">{apt.service.durationMinutes} {tCommon("min")}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{new Date(apt.startTime).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(apt.startTime).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Istanbul",
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLORS[apt.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABELS[apt.status] ?? apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && <div className="py-8 text-center text-gray-500">{t("noAppointments")}</div>}
      </div>
    </div>
  );
}
