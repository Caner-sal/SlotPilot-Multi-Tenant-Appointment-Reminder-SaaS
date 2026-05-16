import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 72px" }}>
      <h1 style={{ fontSize: 34, marginBottom: 10 }}>Terms of Service</h1>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>Last updated: May 13, 2026</p>
      <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
        This document is a production placeholder and requires lawyer review before final publication.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
        Randevo is provided as a multi-tenant appointment and reminder platform. By using the service, organizations
        agree to maintain lawful data processing practices and keep account credentials secure.
      </p>
      <p style={{ lineHeight: 1.7 }}>
        Platform features, limits, and paid plans may evolve. Operational incidents and maintenance windows are managed
        according to the published deployment and runbook process.
      </p>
      <div style={{ marginTop: 28 }}>
        <Link href="/" style={{ color: "#2563eb" }}>Back to home</Link>
      </div>
    </main>
  );
}
