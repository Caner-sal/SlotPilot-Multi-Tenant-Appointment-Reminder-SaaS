"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CustomerPortalLoginPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const err = searchParams.get("error");
    if (err === "MissingToken" || err === "InvalidToken") {
      setError("Giriş bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/booking/${slug}/portal/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bir hata oluştu.");
      }

      setSuccess(data.message || "Giriş bağlantısı gönderildi.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Müşteri Portalı</h1>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Geçmiş randevularınızı görmek veya yaklaşan randevularınızı iptal etmek için e-posta adresinizi girin.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-6">
            {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta Adresiniz
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="siz@ornek.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? "Bağlantı Gönderiliyor..." : "Giriş Bağlantısı Gönder"}
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push(`/booking/${slug}`)}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            &larr; Randevu Sayfasına Dön
          </button>
        </div>
      </div>
    </div>
  );
}
