import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-blue-600 leading-none">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Sayfa bulunamadı</h1>
        <p className="mt-2 text-gray-500 max-w-sm mx-auto">
          Aradığınız sayfa bulunamadı veya taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  );
}
