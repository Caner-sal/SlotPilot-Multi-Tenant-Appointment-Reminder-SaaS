"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [inviteInfo, setInviteInfo] = useState<{ email: string; expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setError("Invalid invite link"); setLoading(false); return; }
    fetch(`/api/auth/accept-invite?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setInviteInfo(d.data);
        else setError(d.error ?? "Invalid invite");
        setLoading(false);
      })
      .catch(() => { setError("Failed to load invite"); setLoading(false); });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name: form.name, password: form.password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/login?invited=1");
    } else {
      setError(data.error ?? "Failed to create account");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-gray-500">Loading invite...</div>;
  if (error && !inviteInfo) return <div className="text-red-600">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          You have been invited to join as a staff member. Your email: <strong>{inviteInfo?.email}</strong>
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Full name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          type="password"
          required
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Creating account..." : "Create Staff Account"}
      </button>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff Invite</h1>
        <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  );
}
