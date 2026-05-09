export interface TurkeyCategory {
  id: string;
  nameTR: string;
  slug: string;
  icon: string;
}

export const TURKEY_CATEGORIES: TurkeyCategory[] = [
  { id: "kuafor",         nameTR: "Kuaför",           slug: "kuafor",         icon: "✂️" },
  { id: "berber",         nameTR: "Berber",            slug: "berber",         icon: "💈" },
  { id: "guzellik",       nameTR: "Güzellik Salonu",   slug: "guzellik",       icon: "💅" },
  { id: "nail-art",       nameTR: "Nail Art",          slug: "nail-art",       icon: "💅" },
  { id: "diyetisyen",     nameTR: "Diyetisyen",        slug: "diyetisyen",     icon: "🥗" },
  { id: "spor",           nameTR: "Spor Eğitmeni",     slug: "spor",           icon: "🏋️" },
  { id: "pilates-yoga",   nameTR: "Pilates / Yoga",    slug: "pilates-yoga",   icon: "🧘" },
  { id: "ozel-ders",      nameTR: "Özel Ders",         slug: "ozel-ders",      icon: "📚" },
  { id: "danismanlik",    nameTR: "Danışmanlık",        slug: "danismanlik",    icon: "🤝" },
  { id: "kurs-atolye",    nameTR: "Kurs ve Atölye",    slug: "kurs-atolye",    icon: "🎨" },
  { id: "oto-bakim",      nameTR: "Oto Bakım",         slug: "oto-bakim",      icon: "🚗" },
  { id: "pet-kuafor",     nameTR: "Pet Kuaför",        slug: "pet-kuafor",     icon: "🐾" },
];

export function getCategoryBySlug(slug: string): TurkeyCategory | undefined {
  return TURKEY_CATEGORIES.find((c) => c.slug === slug);
}
