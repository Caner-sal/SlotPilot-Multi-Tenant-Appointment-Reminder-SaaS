/* eslint-disable @next/next/no-img-element */
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getProvinceBySlug } from "@/data/turkey-provinces";
import type { Metadata } from "next";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const province = getProvinceBySlug(slug);
  if (province) {
    return {
      title: `${province.name} Businesses - Randevo Marketplace`,
      description: `Browse businesses in ${province.name}.`,
    };
  }
  return { title: "Randevo Marketplace" };
}

export default async function MarketplaceSlugPage({ params }: Props) {
  const { slug } = await params;

  const province = getProvinceBySlug(slug);
  if (province) {
    permanentRedirect(`/marketplace/location/tr/${province.slug}`);
  }

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
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/marketplace" className="text-primary text-sm hover:underline">
            Back to Marketplace
          </Link>
        </div>
        {org.coverImageUrl && (
          <img src={org.coverImageUrl} alt={org.name} className="w-full h-48 object-cover" />
        )}
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          {org.logoUrl && (
            <img src={org.logoUrl} alt="" className="w-16 h-16 rounded-full object-cover border border-border" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{org.name}</h1>
            <div className="flex gap-2 mt-1 text-sm">
              {org.category && <span className="text-primary">{org.category}</span>}
              {org.city && <span className="text-muted-foreground">{org.city}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {org.description && (
          <section>
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-muted-foreground">{org.description}</p>
          </section>
        )}

        {(org.phone || org.email || org.address) && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              {org.phone && <p>Phone: {org.phone}</p>}
              {org.email && <p>Email: {org.email}</p>}
              {org.address && <p>Address: {org.address}</p>}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4">Services</h2>
          {org.services.length === 0 ? (
            <p className="text-muted-foreground">No services listed yet.</p>
          ) : (
            <div className="grid gap-3">
              {(org.services as Service[]).map((svc) => (
                <div key={svc.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{svc.name}</p>
                    <p className="text-sm text-muted-foreground">{svc.durationMinutes} min</p>
                  </div>
                  {svc.priceCents > 0 && (
                    <span className="font-semibold text-foreground">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(svc.priceCents / 100)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="text-center pt-4">
          <Link
            href={`/booking/${org.slug}`}
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </main>
    </div>
  );
}
