import Link from "next/link";

type FeatureDetail = {
  title: string;
  whatItDoes: string;
  businessImpact: string;
  limits: string;
  complianceNote: string;
};

const FEATURES: FeatureDetail[] = [
  {
    title: "Akıllı Randevu Motoru",
    whatItDoes:
      "Hizmet süresi, çalışan müsaitliği, kapalı günler ve mevcut rezervasyonları birlikte değerlendirerek uygun slot üretir.",
    businessImpact:
      "Çakışmaları azaltır, telefon trafiğini düşürür ve personelin manuel planlama yükünü azaltır.",
    limits:
      "Doğru sonuç için hizmet süreleri, çalışan atamaları ve haftalık müsaitlik kurallarının düzenli tutulması gerekir.",
    complianceNote:
      "Bu özellik yasal karar üretmez; yalnızca operasyonel planlama yapar.",
  },
  {
    title: "E-posta / SMS / WhatsApp Hatırlatmaları",
    whatItDoes:
      "Randevu öncesi tetiklenen bildirim akışlarıyla müşteriye kanal bazlı hatırlatma gönderir.",
    businessImpact:
      "No-show oranını azaltır, müşteri iletişimini standardize eder ve işletme imajını güçlendirir.",
    limits:
      "Kanal bazında sağlayıcı aktivasyonu, doğrulanmış gönderici ve yeterli bakiye/limit gerekir.",
    complianceNote:
      "Ticari içerikli iletilerde açık rıza/izin süreçlerinin işletme tarafından doğru yönetilmesi gerekir.",
  },
  {
    title: "Türkiye İl / İlçe Uyumlu Adres Akışı",
    whatItDoes:
      "81 il ve ilçe bazlı seçimle müşteri ve işletme adresini tutarlı formatta toplar.",
    businessImpact:
      "Yanlış adres girişini azaltır, raporlama ve bölgesel filtrelemeyi kolaylaştırır.",
    limits:
      "Adres doğruluğu kullanıcı beyanına dayanır; mahalle/sokak detaylarında manuel kontrol gerekebilir.",
    complianceNote:
      "Adres verisi kişisel veri niteliğinde olabileceğinden KVKK saklama ve erişim politikaları uygulanmalıdır.",
  },
  {
    title: "Kapora ve Ödeme Altyapısı",
    whatItDoes:
      "Randevuya bağlı kapora tutarı oluşturur, ödeme sonucunu rezervasyonla ilişkilendirir.",
    businessImpact:
      "İptal riskini azaltır, nakit akış öngörüsünü iyileştirir ve finans kayıt disiplini sağlar.",
    limits:
      "Canlı ödeme için sağlayıcı hesapları, webhook doğrulaması ve üretim ortamı güvenlik ayarları gerekir.",
    complianceNote:
      "Tahsilat ve iade süreçlerinde işletmenin vergi/muhasebe süreçleri ayrıca yönetilmelidir.",
  },
  {
    title: "Çoklu Şube ve Ekip Yönetimi",
    whatItDoes:
      "Şube, çalışan, hizmet ve müsaitlik yapılarını aynı tenant altında ayrı ayrı yönetir.",
    businessImpact:
      "Büyüyen işletmelerde operasyon standardı sağlar ve şube bazlı performans takibi sunar.",
    limits:
      "Doğru raporlama için her randevuda şube ve çalışan ilişkisinin eksiksiz olması gerekir.",
    complianceNote:
      "Yetkilendirme rol bazlı yürütülmeli; gereksiz veri erişimi engellenmelidir.",
  },
  {
    title: "KVKK ve Onay Kayıt Yapısı",
    whatItDoes:
      "Aydınlatma/onay alanlarını randevu akışında toplar ve consent metadatasını saklar.",
    businessImpact:
      "Denetim hazırlığını artırır, müşteri itirazlarında kayıtlı iz bırakır.",
    limits:
      "Metinlerin hukuki doğruluğu ve kullanım senaryoları işletmenin sorumluluğundadır.",
    complianceNote:
      "Bu sistem hukuki danışmanlık vermez; nihai uyum kontrolü hukuk danışmanı ile yapılmalıdır.",
  },
  {
    title: "AI Rezervasyon Asistanı",
    whatItDoes:
      "Tanımlı hizmet ve işletme bilgileri üzerinden soruları yanıtlayıp rezervasyon akışına yönlendirir.",
    businessImpact:
      "Yanıt hızını yükseltir, satış öncesi soru trafiğini azaltır.",
    limits:
      "Yanıt kalitesi, sağlanan içerik ve aktif entegrasyon kapsamı ile sınırlıdır.",
    complianceNote:
      "Asistan çıktıları bilgilendirme amaçlıdır; fiyat/uygunluk gibi kritik kararlar backend doğrulamasıyla kesinleşir.",
  },
  {
    title: "Marketplace Görünürlüğü",
    whatItDoes:
      "İşletmeyi kategori/şehir filtreleriyle keşfedilebilir hale getirir ve rezervasyon dönüşüne destek verir.",
    businessImpact:
      "Yeni müşteri edinimi için organik görünürlük sağlar.",
    limits:
      "Listeleme başarısı profil bütünlüğü, aktif hizmetler ve içerik kalitesiyle doğrudan ilişkilidir.",
    complianceNote:
      "Yayınlanan işletme bilgilerinin doğruluğu ve güncelliği işletme sorumluluğundadır.",
  },
];

const SOURCES = [
  { label: "KVKK – 6698 Sayılı Kanun", href: "https://www.kvkk.gov.tr/Icerik/6649/Personal-Data-Protection-Law" },
  { label: "KVKK – 2024 Değişiklik Duyurusu", href: "https://www.kvkk.gov.tr/Icerik/7834/6698-Sayili-Kisisel-Verilerin-Korunmasi-Kanununda-Yapilan-Degisiklikler-Hakkinda-Kamuoyu-Duyurusu" },
  { label: "KVKK – VERBİS Kayıt Hatırlatması", href: "https://www.kvkk.gov.tr/Icerik/6574/VERBIS-E-KAYIT-SURELERI-HAKKINDA-HATIRLATMA" },
  { label: "İYS – 6563 Kapsamında Ulusal İzin Sistemi Açıklaması", href: "https://anket.iys.org.tr/web/login" },
  { label: "GİB eBelge Portalı", href: "https://ebelge.gib.gov.tr/" },
  { label: "GİB – e-Arşiv Fatura Bilgilendirme", href: "https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv%2Fyardim-kaynaklar%2Finfografikler%2Fpdfs%2Fe_arsiv_fatura.pdf" },
  { label: "iyzico API Dokümantasyonu", href: "https://docs.iyzico.com/en/payment-methods/api" },
  { label: "PayTR iFrame API Dokümantasyonu", href: "https://dev.paytr.com/iframe-api" },
  { label: "Twilio Messaging API", href: "https://www.twilio.com/docs/messaging/api" },
  { label: "Resend API Introduction", href: "https://resend.com/docs/api-reference/introduction" },
  { label: "Meta WhatsApp Cloud API", href: "https://developers.facebook.com/docs/whatsapp/cloud-api" },
  { label: "Meta WhatsApp Pricing", href: "https://developers.facebook.com/docs/whatsapp/pricing" },
];

export default function OzelliklerPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-10">
          <Link href="/" className="text-sm text-blue-300 hover:text-blue-200">
            ← Ana sayfaya dön
          </Link>
          <h1 className="mt-4 text-4xl font-bold">SlotPilot Özellikleri ve Uyum Notları</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Bu sayfa, özelliklerin işlevini ve Türkiye pazarı için operasyonel/uyum etkilerini açıklar.
            Bilgilendirme amaçlıdır; hukuki ve mali kararlar için uzman görüşü alınmalıdır.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <section key={feature.title} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-blue-200">Ne yapar?</dt>
                  <dd className="mt-1 text-slate-300">{feature.whatItDoes}</dd>
                </div>
                <div>
                  <dt className="font-medium text-blue-200">İşletmeye etkisi</dt>
                  <dd className="mt-1 text-slate-300">{feature.businessImpact}</dd>
                </div>
                <div>
                  <dt className="font-medium text-blue-200">Sınırlar / ön koşullar</dt>
                  <dd className="mt-1 text-slate-300">{feature.limits}</dd>
                </div>
                <div>
                  <dt className="font-medium text-blue-200">Uyumluluk notu</dt>
                  <dd className="mt-1 text-slate-300">{feature.complianceNote}</dd>
                </div>
              </dl>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold">Kaynaklar</h2>
          <p className="mt-2 text-sm text-slate-300">
            Aşağıdaki bağlantılar resmi/primer kaynak önceliğiyle derlenmiştir.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {SOURCES.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-200 hover:underline">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
