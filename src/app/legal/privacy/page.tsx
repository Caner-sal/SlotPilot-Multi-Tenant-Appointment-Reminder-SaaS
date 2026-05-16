import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 72px" }}>
      <h1 style={{ fontSize: 34, marginBottom: 10 }}>Privacy Policy</h1>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>Last updated: May 13, 2026</p>
      <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
        This document is a production placeholder and requires lawyer review before final publication.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
        Randevo processes appointment and account data to provide booking, reminder, billing, and support services.
        Personal data is limited to operational needs and retained according to lawful basis and contract obligations.
      </p>
      <p style={{ lineHeight: 1.7 }}>
        Data subject requests are available via export and deletion request flows. For legal requests, contact the
        organization directly and reference your booking email address.
      </p>
      <div style={{ marginTop: 28 }}>
        <Link href="/" style={{ color: "#2563eb" }}>Back to home</Link>
      </div>
    </main>
  );
}
