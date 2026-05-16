/* eslint-disable @next/next/no-img-element */
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const org = await db.organization.findFirst({
    where: { slug, marketplaceEnabled: true },
    select: { name: true, description: true },
  });
  if (!org) return { title: "İşletme Bulunamadı" };
  return {
    title: `${org.name} — Randevo`,
    description: org.description ?? `${org.name} için randevu alın.`,
  };
}

export default async function DiscoverBusinessPage({ params }: Props) {
  const { slug } = await params;

  const org = await db.organization.findFirst({
    where: {
      slug,
      marketplaceEnabled: true,
      bookingEnabled: true,
      suspended: false,
      status: "ACTIVE",
    },
    select: {
      name: true,
      slug: true,
      description: true,
      category: true,
      city: true,
      province: true,
      district: true,
      coverImageUrl: true,
      logoUrl: true,
      phone: true,
      address: true,
      services: {
        where: { isActive: true },
        select: { id: true, name: true, durationMinutes: true, priceCents: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!org) notFound();

  const location = [org.district, org.province ?? org.city].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/discover" className="text-primary text-sm hover:underline">
            ← Keşfete Dön
          </Link>
        </div>
        {org.coverImageUrl && (
          <img src={org.coverImageUrl} alt={org.name} className="w-full h-48 object-cover" />
        )}
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          {org.logoUrl && (
            <img
              src={org.logoUrl}
              alt=""
              className="w-16 h-16 rounded-full object-cover border border-border"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{org.name}</h1>
            <div className="flex flex-wrap gap-2 mt-1 text-sm">
              {org.category && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {org.category}
                </span>
              )}
              {location && (
                <span className="text-muted-foreground">{location}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {org.description && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Hakkında</h2>
            <p className="text-muted-foreground">{org.description}</p>
          </section>
        )}

        {(org.phone || org.address) && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">İletişim</h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              {org.phone && <p>Telefon: {org.phone}</p>}
              {org.address && <p>Adres: {org.address}</p>}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Hizmetler</h2>
          {org.services.length === 0 ? (
            <p className="text-muted-foreground">Henüz hizmet eklenmemiş.</p>
          ) : (
            <div className="grid gap-3">
              {org.services.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-card border border-border rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-foreground">{svc.name}</p>
                    <p className="text-sm text-muted-foreground">{svc.durationMinutes} dakika</p>
                  </div>
                  {svc.priceCents > 0 && (
                    <span className="font-semibold text-foreground">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(svc.priceCents / 100)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="sticky bottom-6">
          <Link
            href={`/booking/${org.slug}`}
            className="block text-center bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            Randevu Al
          </Link>
        </div>
      </main>
    </div>
  );
}
