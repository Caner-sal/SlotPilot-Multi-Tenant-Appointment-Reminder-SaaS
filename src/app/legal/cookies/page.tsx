import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 72px" }}>
      <h1 style={{ fontSize: 34, marginBottom: 10 }}>Cookie Policy</h1>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>Last updated: May 13, 2026</p>
      <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
        This document is a production placeholder and requires lawyer review before final publication.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
        Randevo uses essential cookies for authentication, session integrity, locale persistence, and security controls
        such as rate-limiting context.
      </p>
      <p style={{ lineHeight: 1.7 }}>
        Optional analytics and marketing cookie behavior is controlled by consent configuration and can be restricted by
        organization policy and applicable regulations.
      </p>
      <div style={{ marginTop: 28 }}>
        <Link href="/" style={{ color: "#2563eb" }}>Back to home</Link>
      </div>
    </main>
  );
}
