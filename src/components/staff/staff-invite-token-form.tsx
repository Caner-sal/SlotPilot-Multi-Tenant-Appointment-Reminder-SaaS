"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type InviteInfo = {
  email: string;
  expiresAt: string;
};

export function StaffInviteTokenForm({ token }: { token: string }) {
  const router = useRouter();

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", password: "", confirmPassword: "" });

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link.");
      setLoading(false);
      return;
    }

    fetch(`/api/auth/accept-invite?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setInviteInfo(d.data);
        } else {
          setError(d.error ?? "Invite is not valid.");
        }
      })
      .catch(() => setError("Failed to load invite details."))
      .finally(() => setLoading(false));
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

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
      return;
    }

    if (data?.code === "INVITE_REQUIRES_LOGIN") {
      router.push(`/login?inviteToken=${encodeURIComponent(token)}`);
      return;
    }

    setError(data.error ?? "Invite could not be accepted.");
    setSubmitting(false);
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-600">Loading invite...</div>;
  }

  if (!inviteInfo) {
    return <div className="p-8 text-center text-sm text-red-600">{error ?? "Invalid invite"}</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Staff invite</h1>
        <p className="mb-6 text-sm text-gray-600">
          Invited email: <strong>{inviteInfo.email}</strong>
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password (again)</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Accept invite"}
          </button>
        </form>
      </div>
    </div>
  );
}
