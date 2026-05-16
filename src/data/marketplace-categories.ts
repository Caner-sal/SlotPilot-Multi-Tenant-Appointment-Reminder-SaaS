import { AppLocale, resolveLocale } from "@/i18n/locales";

export interface MarketplaceCategory {
  slug: string;
  icon: string;
  labels: Record<AppLocale, string>;
  legacyAliases: string[];
}

export const MARKETPLACE_CATEGORIES: readonly MarketplaceCategory[] = [
  {
    slug: "hair-salon",
    icon: "✂️",
    labels: {
      tr: "Kuafor",
      en: "Hair Salon",
      de: "Friseursalon",
      ar: "صالون شعر",
      es: "Peluqueria",
      fr: "Salon de coiffure",
      it: "Parrucchiere",
      fa: "سالن مو",
      ru: "Салон красоты",
      nl: "Kapsalon",
    },
    legacyAliases: ["Kuafor", "Kuaför", "Hair Salon", "Parrucchiere"],
  },
  {
    slug: "barber",
    icon: "💈",
    labels: {
      tr: "Berber",
      en: "Barber",
      de: "Barbier",
      ar: "حلاق",
      es: "Barberia",
      fr: "Barbier",
      it: "Barbiere",
      fa: "آرایشگر",
      ru: "Барбершоп",
      nl: "Barbier",
    },
    legacyAliases: ["Berber", "Barber", "Barbiere"],
  },
  {
    slug: "beauty-salon",
    icon: "💅",
    labels: {
      tr: "Guzellik Salonu",
      en: "Beauty Salon",
      de: "Kosmetikstudio",
      ar: "صالون تجميل",
      es: "Salon de belleza",
      fr: "Institut de beaute",
      it: "Centro estetico",
      fa: "سالن زیبایی",
      ru: "Салон красоты",
      nl: "Schoonheidssalon",
    },
    legacyAliases: ["Guzellik Salonu", "Güzellik Salonu", "Beauty Salon", "Centro estetico"],
  },
  {
    slug: "spa-wellness",
    icon: "🧖",
    labels: {
      tr: "Spa ve Wellness",
      en: "Spa and Wellness",
      de: "Spa und Wellness",
      ar: "سبا وعافية",
      es: "Spa y bienestar",
      fr: "Spa et bien-etre",
      it: "Spa e benessere",
      fa: "اسپا و تندرستی",
      ru: "Спа и велнес",
      nl: "Spa en wellness",
    },
    legacyAliases: ["Spa", "Wellness", "Spa and Wellness"],
  },
  {
    slug: "fitness",
    icon: "🏋️",
    labels: {
      tr: "Spor Egitmeni",
      en: "Fitness Coach",
      de: "Fitness Trainer",
      ar: "مدرب لياقة",
      es: "Entrenador fitness",
      fr: "Coach fitness",
      it: "Trainer fitness",
      fa: "مربی بدنسازی",
      ru: "Фитнес тренер",
      nl: "Fitnesstrainer",
    },
    legacyAliases: ["Spor Egitmeni", "Spor Eğitmeni", "Fitness Coach"],
  },
  {
    slug: "medical-clinic",
    icon: "🏥",
    labels: {
      tr: "Klinik",
      en: "Clinic",
      de: "Klinik",
      ar: "عيادة",
      es: "Clinica",
      fr: "Clinique",
      it: "Clinica",
      fa: "کلینیک",
      ru: "Клиника",
      nl: "Kliniek",
    },
    legacyAliases: ["Klinik", "Clinic", "Clinica"],
  },
  {
    slug: "consulting",
    icon: "🤝",
    labels: {
      tr: "Danismanlik",
      en: "Consulting",
      de: "Beratung",
      ar: "استشارات",
      es: "Consultoria",
      fr: "Conseil",
      it: "Consulenza",
      fa: "مشاوره",
      ru: "Консалтинг",
      nl: "Consultancy",
    },
    legacyAliases: ["Danismanlik", "Danışmanlık", "Consulting", "Consulenza"],
  },
];

export interface MarketplaceCategoryOption {
  slug: string;
  icon: string;
  label: string;
}

export function getMarketplaceCategoryOptions(locale: string): MarketplaceCategoryOption[] {
  const resolved = resolveLocale(locale);
  return MARKETPLACE_CATEGORIES.map((category) => ({
    slug: category.slug,
    icon: category.icon,
    label: category.labels[resolved],
  }));
}

export function getMarketplaceCategoryAliases(slugOrLabel: string): string[] {
  const normalizedInput = slugOrLabel.trim().toLowerCase();
  const category = MARKETPLACE_CATEGORIES.find((item) => {
    if (item.slug === normalizedInput) return true;
    return Object.values(item.labels).some((label) => label.toLowerCase() === normalizedInput);
  });

  if (!category) {
    return [slugOrLabel];
  }

  const aliases = new Set<string>([category.slug, ...category.legacyAliases, ...Object.values(category.labels)]);
  return [...aliases];
}
