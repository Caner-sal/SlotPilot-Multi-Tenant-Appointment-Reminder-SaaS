/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export interface BusinessCardData {
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  city: string | null;
  province: string | null;
  district: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  _count: { services: number };
}

interface BusinessCardProps {
  business: BusinessCardData;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const location = [business.district, business.province ?? business.city]
    .filter(Boolean)
    .join(", ");

  return (
    <Link href={`/discover/business/${business.slug}`} className="group block h-full">
      <div className="bg-card border border-border rounded-xl p-5 h-full hover:border-primary/40 hover:shadow-md transition-all flex flex-col gap-3">
        {business.coverImageUrl && (
          <img
            src={business.coverImageUrl}
            alt={business.name}
            className="w-full h-32 object-cover rounded-lg"
          />
        )}

        <div className="flex items-center gap-3">
          {business.logoUrl && (
            <img
              src={business.logoUrl}
              alt=""
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div>
            <h2 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
              {business.name}
            </h2>
            {location && (
              <p className="text-xs text-muted-foreground mt-0.5">{location}</p>
            )}
          </div>
        </div>

        {business.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {business.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs mt-auto">
          {business.category && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
              {business.category}
            </span>
          )}
          <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full">
            {business._count.services} hizmet
          </span>
          <span className="text-muted-foreground/50 italic text-xs self-center">
            Henüz değerlendirme yok
          </span>
        </div>

        <Link
          href={`/booking/${business.slug}`}
          className="block w-full text-center bg-primary text-primary-foreground text-sm font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          Randevu Al
        </Link>
      </div>
    </Link>
  );
}
