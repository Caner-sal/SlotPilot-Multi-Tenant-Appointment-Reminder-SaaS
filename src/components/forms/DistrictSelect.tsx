"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDistrictsByProvince } from "@/data/turkey-provinces";
import { cn } from "@/lib/utils";

interface DistrictSelectProps {
  provinceSlug: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export default function DistrictSelect({
  provinceSlug,
  value,
  onChange,
  disabled,
  className,
  placeholder = "Select district",
}: DistrictSelectProps) {
  const districts = getDistrictsByProvince(provinceSlug);

  return (
    <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {districts.map((d) => (
          <SelectItem key={d.slug} value={d.slug}>
            {d.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
