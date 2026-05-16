import { cookies } from "next/headers";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { getTranslations } from "next-intl/server";
import { getMarketConfig } from "@/config/locale-market";

const RandevoLogo = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
    <rect x="2" y="6" width="28" height="23" rx="5" fill="rgba(119,104,212,0.14)" stroke="#7768d4" strokeWidth="1.4" />
    <path d="M2 12.5h28" stroke="#7768d4" strokeWidth="0.9" opacity="0.4" />
    <line x1="10" y1="3" x2="10" y2="9.5" stroke="#7768d4" strokeWidth="2" strokeLinecap="round" />
    <line x1="22" y1="3" x2="22" y2="9.5" stroke="#7768d4" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 20.5L14.5 25L22 17" stroke="#7768d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = ({ color = "#7768d4" }: { color?: string }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="7.5" cy="7.5" r="6.5" stroke={color} />
    <path d="M4.5 7.5 L6.5 9.5 L10.5 5.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default async function HomePage() {
  const t = await getTranslations("landing");
  const cookieStore = await cookies();
  const country = cookieStore.get("randevo_country")?.value ?? "TR";
  const market = getMarketConfig(country);
  const isTurkey = market.landingVariant === "turkey";

  const featureCards = [
    {
      title: t("f1Title"),
      desc: t("f1Desc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      title: t("f2Title"),
      desc: t("f2Desc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    ...(isTurkey ? [{
      title: t("f3Title"),
      desc: t("f3Desc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
      ),
    }] : []),
    {
      title: t("f4Title"),
      desc: t("f4Desc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      title: t("f5Title"),
      desc: t("f5Desc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: t("f6Title"),
      desc: t("f6Desc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      title: t("f7Title"),
      desc: t("f7Desc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: t("f8Title"),
      desc: t("f8Desc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      ),
    },
  ];

  const plans = [
    {
      id: "FREE",
      name: t("ctaFree"),
      price: "₺0",
      per: t("freeForever"),
      features: [t("f1Title"), t("f2Title"), t("f3Title")],
      cta: t("ctaFree"),
      featured: false,
    },
    {
      id: "STARTER",
      name: t("ctaStarter"),
      price: "₺40",
      per: t("monthly"),
      features: [t("f1Title"), t("f2Title"), t("f3Title"), t("f4Title")],
      cta: t("ctaStarter"),
      featured: true,
    },
    {
      id: "PRO",
      name: t("ctaPro"),
      price: "₺249",
      per: t("monthly"),
      features: [t("f1Title"), t("f2Title"), t("f4Title"), t("f5Title")],
      cta: t("ctaPro"),
      featured: false,
    },
  ];

  return (
    <main className="min-h-screen" style={{ background: "#09090e", color: "#f0eff8", fontFamily: "var(--font-body, Nunito, sans-serif)" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: "66px", background: "rgba(9,9,14,0.85)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(119,104,212,0.1)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: "66px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RandevoLogo />
            <span style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px" }}>Randevo</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LanguageSwitcher />
            <Link href="/login" style={{ padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(119,104,212,0.18)", color: "#8a8aaa", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-heading, Outfit, sans-serif)", transition: "all 0.18s" }}>
              {t("navSignIn")}
            </Link>
            <Link href="/register" style={{ padding: "8px 18px", borderRadius: 10, background: "#7768d4", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-heading, Outfit, sans-serif)", boxShadow: "0 0 22px rgba(119,104,212,0.32)", transition: "all 0.2s" }}>
              {t("navStartFree")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 164, paddingBottom: 88, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* bg glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 900px 600px at 50% 30%, rgba(119,104,212,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        {/* dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.35,
          backgroundImage: "radial-gradient(circle, rgba(120,108,230,0.18) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          WebkitMaskImage: "radial-gradient(ellipse 900px 600px at 50% 40%, black 0%, transparent 75%)",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 1 }}>
          {/* badge — TR only */}
          {isTurkey && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(119,104,212,0.1)", border: "1px solid rgba(119,104,212,0.28)", borderRadius: 100, padding: "5px 16px", marginBottom: 30 }}>
              <span style={{ width: 6, height: 6, background: "#a59cf0", borderRadius: "50%", animation: "blink 2.2s infinite", flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#a59cf0", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>{t("heroBadge")}</span>
            </div>
          )}
          <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

          <h1 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: "clamp(46px,7.5vw,84px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.04em", marginBottom: 22 }}>
            {t("heroTitle1")}<br />
            <span style={{ background: "linear-gradient(128deg,#b3aaff 0%,#d49cf5 50%,#f9a8d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t("heroTitle2")}
            </span><br />
            {t("heroTitle3")}
          </h1>

          <p style={{ fontSize: "clamp(15px,2vw,19px)", color: "#8a8aaa", maxWidth: 560, margin: "0 auto 44px", lineHeight: 1.75 }}>
            {t("heroDesc")}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 14, background: "#7768d4", color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "var(--font-heading, Outfit, sans-serif)", boxShadow: "0 0 28px rgba(119,104,212,0.32)" }}>
              {t("heroStartFree")}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
            <Link href="/booking/barber-demo" style={{ display: "inline-flex", alignItems: "center", padding: "14px 32px", borderRadius: 14, border: "1px solid rgba(119,104,212,0.22)", color: "#8a8aaa", fontSize: 17, fontWeight: 600, fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
              {t("heroDemo")}
            </Link>
          </div>

          {/* stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap", marginTop: 72, paddingTop: 44, borderTop: "1px solid rgba(119,104,212,0.1)" }}>
            {[
              ["500+", t("statBusinesses")],
              ["12K+", t("statMonthly")],
              ...(isTurkey ? [[t("statSupportValue"), t("statSupport")] as [string, string]] : []),
              ["%94", t("statCompletion")],
            ].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em" }}>{num}</div>
                <div style={{ fontSize: 13, color: "#8a8aaa", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section style={{ padding: "48px 0", textAlign: "center" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <p style={{ fontSize: 11, color: "#3a3a58", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, fontFamily: "var(--font-heading, Outfit, sans-serif)", marginBottom: 18 }}>{t("industriesLabel")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {[t("i1"), t("i2"), t("i3"), t("i4"), t("i5"), t("i6"), t("i7"), t("i8")].map((tag) => (
              <span key={tag} style={{ background: "#111120", border: "1px solid rgba(119,104,212,0.1)", borderRadius: 100, padding: "7px 18px", fontSize: 14, color: "#8a8aaa", fontWeight: 500 }}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "72px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <p style={{ fontSize: 11, color: "#a59cf0", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, fontFamily: "var(--font-heading, Outfit, sans-serif)", marginBottom: 10 }}>{t("featuresLabel")}</p>
          <h2 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: "clamp(26px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 14 }}>{t("featuresTitle")}</h2>
          <p style={{ fontSize: 16, color: "#8a8aaa", maxWidth: 520, lineHeight: 1.7, marginBottom: 52 }}>{t("featuresDesc")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))", gap: 18 }}>
            {featureCards.map((card) => (
              <div key={card.title} style={{ background: "#111120", border: "1px solid rgba(119,104,212,0.1)", borderRadius: 20, padding: "26px", transition: "all 0.22s" }}>
                <div style={{ width: 42, height: 42, background: "rgba(119,104,212,0.12)", borderRadius: 11, display: "grid", placeItems: "center", marginBottom: 16, color: "#a59cf0" }}>
                  {card.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 15, fontWeight: 600, marginBottom: 7 }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: "#8a8aaa", lineHeight: 1.65 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "72px 0", textAlign: "center" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <p style={{ fontSize: 11, color: "#a59cf0", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, fontFamily: "var(--font-heading, Outfit, sans-serif)", marginBottom: 10 }}>{t("pricingLabel")}</p>
          <h2 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: "clamp(26px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 10 }}>{t("pricingTitle")}</h2>
          <p style={{ fontSize: 15, color: "#8a8aaa", marginBottom: 52 }}>{t("pricingDesc")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, maxWidth: 880, margin: "0 auto" }}>
            {plans.map((p) => (
              <div key={p.id} style={{
                background: p.featured ? "linear-gradient(160deg, rgba(119,104,212,0.16), rgba(119,104,212,0.06))" : "#111120",
                border: p.featured ? "1px solid rgba(119,104,212,0.38)" : "1px solid rgba(119,104,212,0.1)",
                borderRadius: 20, padding: "30px 26px", textAlign: "left", position: "relative",
              }}>
                {p.featured && (
                  <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#7768d4", color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "3px 14px", borderRadius: 100, fontFamily: "var(--font-heading, Outfit, sans-serif)", whiteSpace: "nowrap" }}>
                    {t("mostPopular")}
                  </div>
                )}
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8a8aaa", marginBottom: 10, fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>{p.name}</div>
                <div style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 46, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {p.price}<span style={{ fontSize: 16, fontWeight: 500, color: "#8a8aaa", verticalAlign: "text-bottom" }}>{t("perMonth")}</span>
                </div>
                <p style={{ fontSize: 13, color: "#8a8aaa", margin: "7px 0 26px" }}>{p.per}</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ fontSize: 13, color: "#8a8aaa", display: "flex", alignItems: "center", gap: 9 }}>
                      <CheckIcon color={p.featured ? "#a59cf0" : "#7768d4"} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" style={{
                  display: "block", width: "100%", textAlign: "center", padding: 11, borderRadius: 11,
                  fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 14, fontWeight: 600,
                  background: p.featured ? "#7768d4" : "transparent",
                  color: p.featured ? "#fff" : "#8a8aaa",
                  border: p.featured ? "none" : "1px solid rgba(119,104,212,0.2)",
                  boxShadow: p.featured ? "0 0 20px rgba(119,104,212,0.28)" : "none",
                }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "72px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ background: "linear-gradient(140deg, rgba(119,104,212,0.2) 0%, rgba(180,120,250,0.1) 100%)", border: "1px solid rgba(119,104,212,0.3)", borderRadius: 28, padding: "76px 48px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 12 }}>{t("ctaTitle")}</h2>
            <p style={{ fontSize: 16, color: "#8a8aaa", marginBottom: 36 }}>{t("ctaDesc")}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 14, background: "#7768d4", color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "var(--font-heading, Outfit, sans-serif)", boxShadow: "0 0 28px rgba(119,104,212,0.32)" }}>
                {t("ctaCreateAccount")}
              </Link>
              <Link href="/marketplace" style={{ display: "inline-flex", alignItems: "center", padding: "14px 32px", borderRadius: 14, border: "1px solid rgba(119,104,212,0.35)", color: "#a59cf0", fontSize: 17, fontWeight: 600, fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
                {t("ctaExplore")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(119,104,212,0.1)", padding: "32px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RandevoLogo />
            <span style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 15, fontWeight: 600, color: "#8a8aaa" }}>Randevo</span>
          </Link>
          <div style={{ display: "flex", gap: 22 }}>
            <Link href="/legal/privacy" style={{ fontSize: 13, color: "#3a3a58" }}>{t("footerPrivacy")}</Link>
            <Link href="/legal/kvkk" style={{ fontSize: 13, color: "#3a3a58" }}>{t("footerKVKK")}</Link>
            <Link href="/legal/terms" style={{ fontSize: 13, color: "#3a3a58" }}>{t("footerTerms")}</Link>
            <Link href="/legal/cookies" style={{ fontSize: 13, color: "#3a3a58" }}>Cookies</Link>
          </div>
          <p style={{ fontSize: 13, color: "#3a3a58" }}>{t("footerCopyright")}</p>
        </div>
      </footer>
    </main>
  );
}
