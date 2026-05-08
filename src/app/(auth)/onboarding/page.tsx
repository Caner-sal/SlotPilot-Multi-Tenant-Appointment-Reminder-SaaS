"use client";

import React, { useState, useEffect } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
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
  const [timezone, setTimezone] = useState("America/New_York");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(businessName));
    }
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
        setError(
          "That URL slug is already taken. Please choose a different one."
        );
      } else {
        setError(data.message ?? "Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-2xl px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">✈️</span>
          <span className="text-3xl font-bold text-white tracking-tight">
            SlotPilot
          </span>
        </div>
        <p className="text-blue-300 text-sm">
          Set up your business — you&apos;re almost there!
        </p>
      </div>

      <Card className="border-0 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Set up your organization
          </CardTitle>
          <CardDescription>
            Tell us about your business so clients can find and book with you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name *</Label>
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
                <Label htmlFor="slug">URL slug *</Label>
                <div className="flex items-center gap-0">
                  <span className="flex items-center h-10 px-3 text-xs text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md whitespace-nowrap">
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="A short description of your business"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgEmail">Business email</Label>
                <Input
                  id="orgEmail"
                  type="email"
                  placeholder="hello@yourbusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, City, State 00000"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone *</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select a timezone" />
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
              {loading ? "Creating organization…" : "Create organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
