"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TIMEZONES = [
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Dubai",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function OnboardingPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("Europe/Istanbul");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(businessName));
  }, [businessName, slugEdited]);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    setSlug(slugify(e.target.value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: businessName,
        slug,
        description,
        phone,
        email,
        address,
        timezone,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 409 || data.message?.toLowerCase().includes("slug")) {
        setError("Bu URL kısa adı kullanımda. Lütfen farklı bir kısa ad seçin.");
      } else {
        setError(data.message ?? "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="text-3xl">✈️</span>
          <span className="text-3xl font-bold tracking-tight text-white">SlotPilot</span>
        </div>
        <p className="text-sm text-blue-300">İşletmenizi kurun, son adımdasınız.</p>
      </div>

      <Card className="border-0 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">İşletme Kurulumu</CardTitle>
          <CardDescription>Müşterilerinizin sizi bulabilmesi için işletme bilgilerinizi girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">İşletme adı *</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Bella Hair Studio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL kısa adı *</Label>
                <div className="flex items-center gap-0">
                  <span className="flex h-10 items-center whitespace-nowrap rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground">
                    slotpilot.com/
                  </span>
                  <Input
                    id="slug"
                    type="text"
                    placeholder="bella-hair-studio"
                    value={slug}
                    onChange={handleSlugChange}
                    required
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                type="text"
                placeholder="İşletmeniz için kısa bir açıklama"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+90 555 000 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgEmail">İşletme e-postası</Label>
                <Input
                  id="orgEmail"
                  type="email"
                  placeholder="merhaba@isletmeniz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                type="text"
                placeholder="Cadde/Sokak, İlçe, İl"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Saat dilimi *</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Saat dilimi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "İşletme oluşturuluyor..." : "İşletmeyi Oluştur"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
