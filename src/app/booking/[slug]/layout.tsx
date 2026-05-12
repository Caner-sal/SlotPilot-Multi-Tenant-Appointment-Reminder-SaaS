import Link from "next/link";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        // Override dark theme CSS vars for this light-themed public booking page
        // Without this, inputs inherit the dark foreground color (white text on white bg)
        "--foreground": "0 0% 9%",
        "--card-foreground": "0 0% 9%",
        "--popover-foreground": "0 0% 9%",
        color: "hsl(0 0% 9%)",
      } as React.CSSProperties}
    >
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <span className="text-blue-600">✈</span>
            Randevo
          </Link>
          <span className="text-xs text-gray-400">Powered by Randevo</span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

