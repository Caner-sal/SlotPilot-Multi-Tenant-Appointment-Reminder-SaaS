"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrgOption = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export function OrganizationSwitcher() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    Promise.all([
      fetch("/api/organizations").then((r) => r.json()),
      fetch("/api/organization/active").then((r) => r.json()),
    ]).then(([orgsRes, activeRes]) => {
      if (orgsRes.data) setOrgs(orgsRes.data);
      if (activeRes.data?.id) setActiveOrgId(activeRes.data.id);
    });
  }, []);

  if (orgs.length <= 1) return null;

  function handleChange(orgId: string) {
    setActiveOrgId(orgId);
    startTransition(async () => {
      await fetch("/api/organization/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });
      router.refresh();
    });
  }

  return (
    <Select value={activeOrgId} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[200px] text-sm">
        <SelectValue placeholder="İşletme seç..." />
      </SelectTrigger>
      <SelectContent>
        {orgs.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
