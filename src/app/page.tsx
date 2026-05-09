import Link from "next/link";
import {
  BellRing,
  Bot,
  Building2,
  CalendarCheck2,
  CreditCard,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { TURKEY_PLANS } from "@/config/pricing.tr";

const featureCards = [
  {
    icon: CalendarCheck2,
    title: "Akıllı Randevu",
    desc: "Çakışma önlemeli slot motoru ile online randevular otomatik planlanır.",
  },
  {
    icon: BellRing,
    title: "E-posta / SMS / WhatsApp",
    desc: "Hatırlatmalar tek panelden yönetilir, no-show oranı düşer.",
  },
  {
    icon: MapPinned,
    title: "Türkiye İl / İlçe Uyumlu",
    desc: "81 il ve tüm ilçe yapısıyla yerel adres akışına uygun çalışır.",
  },
  {
    icon: CreditCard,
    title: "Kapora ve Ödeme",
    desc: "Online kapora akışı, ödeme kayıtları ve gelir takibi birlikte gelir.",
  },
  {
    icon: Building2,
    title: "Çoklu Şube ve Ekip",
    desc: "Şube, çalışan, hizmet ve müsaitlik yönetimini tek sistemde tutar.",
  },
  {
    icon: ShieldCheck,
    title: "KVKK ve Tenant İzolasyonu",
    desc: "İşletme verileri izole tutulur, onay kayıtları ve audit log korunur.",
  },
  {
    icon: Bot,
    title: "AI Rezervasyon Asistanı",
    desc: "İşletmeye özel chatbot müşteri sorularını hızlıca yanıtlar.",
  },
  {
    icon: Sparkles,
    title: "Marketplace Görünürlüğü",
    desc: "İşletmeler yerel aramada keşfedilir, randevuya dönüşüm artar.",
  },
];

const plans = [
  {
    id: "FREE",
    plan: TURKEY_PLANS.FREE.nameTR,
    price: "₺0/ay",
    features: TURKEY_PLANS.FREE.features.slice(0, 3),
    cta: "Ücretsiz Başla",
    highlight: false,
  },
  {
    id: "STARTER",
    plan: TURKEY_PLANS.STARTER.nameTR,
    price: "₺40/ay",
    features: TURKEY_PLANS.STARTER.features.slice(0, 4),
    cta: "Başlangıç Planı",
    highlight: true,
  },
  {
    id: "PRO",
    plan: TURKEY_PLANS.PRO.nameTR,
    price: "₺249/ay",
    features: [
      "Sınırsız çalışan",
      "Ayda 2.000 randevu",
      "Gelişmiş analitik",
      "Öncelikli destek",
    ],
    cta: "Pro'ya Geç",
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="container mx-auto max-w-6xl px-4 py-20">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            <span className="text-sm font-medium text-blue-300">Türkiye MVP sürümü canlı</span>
          </div>
          <h1 className="mb-5 text-6xl font-bold leading-tight text-white">SlotPilot</h1>
          <p className="mb-3 text-2xl font-light text-blue-200">Türkiye Odaklı Randevu ve Hatırlatma SaaS</p>
          <p className="mx-auto mb-10 max-w-3xl text-lg text-slate-300">
            Berber, güzellik salonu, klinik ve yerel hizmet işletmeleri için; Türkçe arayüz,
            yerel mevzuat uyumu ve büyümeye hazır çok kiracılı altyapı.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Hemen Ücretsiz Başla
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-600 px-8 py-3 text-lg font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
            >
              Giriş Yap
            </Link>
            <Link
              href="/ozellikler"
              className="rounded-lg border border-blue-500/40 px-8 py-3 text-lg font-semibold text-blue-200 transition-colors hover:border-blue-300 hover:text-white"
            >
              Özellikleri Detaylı İncele
            </Link>
          </div>
        </div>

        <div className="mb-20 grid gap-6 md:grid-cols-2">
          {featureCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 transition-colors hover:border-blue-500/60"
              >
                <Icon className="mb-3 h-7 w-7 text-blue-300" />
                <h3 className="mb-2 text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-slate-300">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Fiyatlandırma</h2>
          <p className="mb-10 text-slate-400">İşletmen büyürken seninle ölçeklenen planlar</p>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl border p-6 ${
                  p.highlight ? "border-blue-500 bg-blue-600/10" : "border-slate-700 bg-slate-800/50"
                }`}
              >
                {p.highlight && (
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
                    En Çok Tercih Edilen
                  </div>
                )}
                <div className="mb-1 text-xl font-bold text-white">{p.plan}</div>
                <div className="mb-4 text-4xl font-bold text-white">{p.price}</div>
                <ul className="my-5 space-y-2 text-sm text-slate-300">
                  {p.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block rounded-lg py-2 text-center text-sm font-semibold transition-colors ${
                    p.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "border border-slate-600 text-slate-200 hover:border-slate-400"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 text-center">
          <Link
            href="/ozellikler"
            className="inline-flex items-center rounded-lg border border-blue-400/50 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-200 hover:border-blue-300 hover:text-white"
          >
            Özelliklerin tamamını ve kaynakları görüntüle
          </Link>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>SlotPilot • Türkiye için geliştirilen çok kiracılı randevu platformu</p>
        </div>
      </div>
    </main>
  );
}
