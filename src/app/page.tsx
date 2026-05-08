import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-400 text-sm font-medium">Now in MVP</span>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            SlotPilot
          </h1>
          <p className="text-2xl text-blue-200 mb-4 font-light">
            Appointment & Reminder SaaS
          </p>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Help local businesses manage appointments, staff, and customers — with
            automated reminders and a public booking page.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: "📅",
              title: "Smart Booking",
              desc: "Public booking page with real-time slot availability. No double bookings, ever.",
            },
            {
              icon: "🔔",
              title: "Auto Reminders",
              desc: "Automated email reminders reduce no-shows and keep customers informed.",
            },
            {
              icon: "📊",
              title: "Analytics",
              desc: "Track appointments, revenue, and staff performance from one dashboard.",
            },
            {
              icon: "👥",
              title: "Multi-Staff",
              desc: "Manage multiple staff members with individual schedules and services.",
            },
            {
              icon: "🔒",
              title: "Secure & Isolated",
              desc: "Each business has its own isolated data. No cross-tenant access.",
            },
            {
              icon: "💳",
              title: "Flexible Plans",
              desc: "Free, Starter, and Pro plans to grow with your business needs.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Simple Pricing</h2>
          <p className="text-slate-400 mb-10">Start free, scale as you grow</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                plan: "Free",
                price: "$0",
                features: ["1 Staff", "20 Appts/month", "Public booking page"],
                cta: "Start Free",
                highlight: false,
              },
              {
                plan: "Starter",
                price: "$9",
                features: ["3 Staff", "300 Appts/month", "Email reminders", "Analytics"],
                cta: "Get Starter",
                highlight: true,
              },
              {
                plan: "Pro",
                price: "$19",
                features: [
                  "Unlimited Staff",
                  "Unlimited Appts",
                  "Advanced analytics",
                  "Priority support",
                ],
                cta: "Go Pro",
                highlight: false,
              },
            ].map((p) => (
              <div
                key={p.plan}
                className={`rounded-xl p-6 border ${
                  p.highlight
                    ? "border-blue-500 bg-blue-600/10"
                    : "border-slate-700 bg-slate-800/50"
                }`}
              >
                {p.highlight && (
                  <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Most Popular
                  </div>
                )}
                <div className="text-white font-bold text-xl mb-1">{p.plan}</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {p.price}
                  <span className="text-slate-400 text-sm font-normal">/mo</span>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 my-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-2 rounded-lg font-semibold transition-colors text-sm ${
                    p.highlight
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "border border-slate-600 hover:border-slate-400 text-slate-300"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-600 text-sm border-t border-slate-800 pt-8">
          <p>SlotPilot — Built with Next.js, Prisma, and TypeScript</p>
        </div>
      </div>
    </main>
  );
}
