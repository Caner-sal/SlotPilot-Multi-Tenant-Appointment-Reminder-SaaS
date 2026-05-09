export interface TurkeyPlan {
  id: string;
  nameTR: string;
  priceCentsMonthly: number | null;
  maxStaff: number;
  maxApptsPerMonth: number;
  features: string[];
  stripePriceIdEnvVar: string | null;
}

export const TURKEY_PLANS: Record<string, TurkeyPlan> = {
  FREE: {
    id: "FREE",
    nameTR: "Ücretsiz",
    priceCentsMonthly: 0,
    maxStaff: 1,
    maxApptsPerMonth: 20,
    features: [
      "1 çalışan",
      "Ayda 20 randevu",
      "Online rezervasyon sayfası",
      "E-posta hatırlatmaları",
    ],
    stripePriceIdEnvVar: null,
  },
  STARTER: {
    id: "STARTER",
    nameTR: "Başlangıç",
    priceCentsMonthly: 4000,
    maxStaff: 3,
    maxApptsPerMonth: 300,
    features: [
      "3 çalışan",
      "Ayda 300 randevu",
      "SMS hatırlatmaları",
      "Marketplace listesi",
      "Analitik paneli",
    ],
    stripePriceIdEnvVar: "STRIPE_TR_STARTER_PRICE_ID",
  },
  PRO: {
    id: "PRO",
    nameTR: "Pro",
    priceCentsMonthly: 24900,
    maxStaff: Infinity,
    maxApptsPerMonth: 2000,
    features: [
      "Sınırsız çalışan",
      "Ayda 2.000 randevu",
      "WhatsApp hatırlatmaları",
      "AI sohbet asistanı",
      "Çoklu şube desteği",
      "Öncelikli destek",
    ],
    stripePriceIdEnvVar: "STRIPE_TR_PRO_PRICE_ID",
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    nameTR: "Kurumsal",
    priceCentsMonthly: null,
    maxStaff: Infinity,
    maxApptsPerMonth: Infinity,
    features: [
      "Sınırsız çalışan",
      "Sınırsız randevu",
      "Özel entegrasyonlar",
      "SLA garantisi",
      "Özel fiyatlandırma",
    ],
    stripePriceIdEnvVar: null,
  },
};

export function getPlanTR(planId: string): TurkeyPlan {
  return TURKEY_PLANS[planId] ?? TURKEY_PLANS.FREE;
}

export function formatPlanPriceTR(plan: TurkeyPlan): string {
  if (plan.priceCentsMonthly === null) return "İletişime Geçin";
  if (plan.priceCentsMonthly === 0) return "Ücretsiz";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(plan.priceCentsMonthly / 100) + "/ay";
}
