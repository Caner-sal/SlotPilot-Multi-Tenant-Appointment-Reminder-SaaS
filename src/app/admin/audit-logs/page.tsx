import { db } from "@/lib/db";

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1"));
  const limit = 50;
  const skip = (page - 1) * limit;

  const [logs, total] = await db.$transaction([
    db.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { name: true } },
        actor: { select: { name: true, email: true } },
      },
    }),
    db.auditLog.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">İşlem Kayıtları ({total})</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Zaman</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Aksiyon</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">İşletme</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kullanıcı</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Varlık</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{log.action}</span>
                </td>
                <td className="px-4 py-3 text-gray-700">{log.organization?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700">{log.actor?.name ?? log.actor?.email ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {log.entityType && <span>{log.entityType}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <div className="text-center py-8 text-gray-500">Henüz işlem kaydı yok.</div>}
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-end text-sm">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="px-3 py-1 border rounded hover:bg-gray-50">
              Önceki
            </a>
          )}
          <span className="px-3 py-1 text-gray-500">Sayfa {page} / {totalPages}</span>
          {page < totalPages && (
            <a href={`?page=${page + 1}`} className="px-3 py-1 border rounded hover:bg-gray-50">
              Sonraki
            </a>
          )}
        </div>
      )}
    </div>
  );
}
