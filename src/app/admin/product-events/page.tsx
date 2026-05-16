"use client";

import { useEffect, useState } from "react";

type ProductEventItem = {
  id: string;
  eventName: string;
  userId: string | null;
  organizationId: string | null;
  payloadSafe: unknown;
  createdAt: string;
  user: { email: string; name: string } | null;
  organization: { slug: string; name: string } | null;
};

type ProductEventResponse = {
  items: ProductEventItem[];
  pagination: { limit: number; nextCursor: string | null };
};

export default function AdminProductEventsPage() {
  const [eventName, setEventName] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [data, setData] = useState<ProductEventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(nextCursor?: string | null) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("limit", "20");
      if (eventName.trim()) params.set("eventName", eventName.trim());
      if (organizationId.trim()) params.set("organizationId", organizationId.trim());
      if (nextCursor) params.set("cursor", nextCursor);

      const res = await fetch(`/api/admin/product-events?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Product event listesi yuklenemedi");
      }

      const body = (await res.json()) as { data: ProductEventResponse };
      setData(body.data);
      setCursor(nextCursor ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product event listesi yuklenemedi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Product Events</h1>
        <p className="text-sm text-muted-foreground">Signup/onboarding/growth event gorunurlugu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="eventName (ornek: service_created)"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="organizationId"
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            className="px-3 py-2 text-sm rounded bg-gray-900 text-white"
            onClick={() => void load(null)}
          >
            Filtrele
          </button>
          <button
            className="px-3 py-2 text-sm rounded border"
            onClick={() => {
              setEventName("");
              setOrganizationId("");
              void load(null);
            }}
          >
            Temizle
          </button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {loading ? (
        <div className="text-sm text-muted-foreground">Yukleniyor...</div>
      ) : (
        <div className="bg-card rounded border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Event</th>
                <th className="text-left p-3">Organization</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Payload</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="p-3 font-medium text-foreground">{row.eventName}</td>
                  <td className="p-3 text-foreground/90">
                    {row.organization ? `${row.organization.name} (${row.organization.slug})` : row.organizationId ?? "-"}
                  </td>
                  <td className="p-3 text-foreground/90">{row.user?.email ?? row.userId ?? "-"}</td>
                  <td className="p-3 text-muted-foreground max-w-[280px]">
                    <pre className="whitespace-pre-wrap break-all text-xs">
                      {row.payloadSafe ? JSON.stringify(row.payloadSafe) : "-"}
                    </pre>
                  </td>
                  <td className="p-3 text-muted-foreground">{new Date(row.createdAt).toLocaleString("tr-TR")}</td>
                </tr>
              ))}
              {(data?.items.length ?? 0) === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={5}>Kayit bulunamadi.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          className="px-3 py-2 text-sm rounded border disabled:opacity-50"
          onClick={() => void load(cursor)}
          disabled={!cursor}
        >
          Yeniden Yukle
        </button>
        <button
          className="px-3 py-2 text-sm rounded border disabled:opacity-50"
          onClick={() => void load(data?.pagination.nextCursor ?? null)}
          disabled={!data?.pagination.nextCursor}
        >
          Sonraki Sayfa
        </button>
      </div>
    </div>
  );
}

