/* eslint-disable @next/next/no-img-element */
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function MarketplaceBusinessPage({ params }: Props) {
  const { slug } = await params;

  const org = await db.organization.findFirst({
    where: { slug, marketplaceEnabled: true, bookingEnabled: true, suspended: false },
    select: {
      name: true,
      slug: true,
      description: true,
      category: true,
      city: true,
      coverImageUrl: true,
      logoUrl: true,
      phone: true,
      email: true,
      address: true,
      services: {
        where: { isActive: true },
        select: { id: true, name: true, durationMinutes: true, priceCents: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!org) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/marketplace" className="text-blue-600 text-sm hover:underline">
            ← Back to Marketplace
          </Link>
        </div>
        {org.coverImageUrl && (
          <img src={org.coverImageUrl} alt={org.name} className="w-full h-48 object-cover" />
        )}
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          {org.logoUrl && (
            <img src={org.logoUrl} alt="" className="w-16 h-16 rounded-full object-cover border" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            <div className="flex gap-2 mt-1 text-sm">
              {org.category && <span className="text-blue-600">{org.category}</span>}
              {org.city && <span className="text-gray-500">{org.city}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {org.description && (
          <section>
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-600">{org.description}</p>
          </section>
        )}

        {(org.phone || org.email || org.address) && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <div className="space-y-1 text-sm text-gray-600">
              {org.phone && <p>📞 {org.phone}</p>}
              {org.email && <p>✉️ {org.email}</p>}
              {org.address && <p>📍 {org.address}</p>}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4">Services</h2>
          {org.services.length === 0 ? (
            <p className="text-gray-400">No services listed.</p>
          ) : (
            <div className="grid gap-3">
              {(org.services as Service[]).map((svc) => (
                <div key={svc.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{svc.name}</p>
                    <p className="text-sm text-gray-500">{svc.durationMinutes} min</p>
                  </div>
                  {svc.priceCents > 0 && (
                    <span className="font-semibold text-gray-900">₺{(svc.priceCents / 100).toFixed(2)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="text-center pt-4">
          <Link
            href={`/booking/${org.slug}`}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Book an Appointment
          </Link>
        </div>
      </main>
    </div>
  );
}
