import Link from "next/link";

export default function KvkkNoticePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 72px" }}>
      <h1 style={{ fontSize: 34, marginBottom: 10 }}>KVKK Aydınlatma Metni</h1>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>Güncelleme tarihi: 13 Mayıs 2026</p>
      <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
        Bu metin üretim ortamı için geçici yer tutucudur ve yayına alınmadan önce hukuk incelemesi gerektirir.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
        Randevo, randevu oluşturma ve hatırlatma hizmetlerini sunmak amacıyla müşteri adı, iletişim bilgileri ve randevu
        detaylarını işler. Veriler, hizmet gerekliliği ve yasal yükümlülükler kapsamında sınırlı tutulur.
      </p>
      <p style={{ lineHeight: 1.7 }}>
        Veri sahibi talepleri için silme ve dışa aktarma başvuru akışları kullanılabilir. Talep durum takibi yönetim
        panelinde kayıt altına alınır.
      </p>
      <div style={{ marginTop: 28 }}>
        <Link href="/" style={{ color: "#2563eb" }}>Ana sayfaya dön</Link>
      </div>
    </main>
  );
}
