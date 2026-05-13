"use client";

import { useEffect, useMemo, useState } from "react";

interface AddressSuggestion {
  provider: string;
  placeId: string;
  label: string;
  secondaryLabel?: string;
}

interface NormalizedAddress {
  countryCode?: string;
  adminLevel1?: string;
  adminLevel2?: string;
  locality?: string;
  postalCode?: string;
  formattedAddress: string;
}

interface AddressAutocompleteProps {
  locale: string;
  countryCode?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: NormalizedAddress) => void;
}

const debounceMs = Number(process.env.NEXT_PUBLIC_ADDRESS_AUTOCOMPLETE_DEBOUNCE_MS ?? 350);

export default function AddressAutocomplete({
  locale,
  countryCode,
  placeholder,
  value,
  onChange,
  onSelect,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const sessionToken = useMemo(
    () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`,
    [],
  );

  useEffect(() => {
    if (value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          q: value,
          locale,
          sessionToken,
        });
        if (countryCode) {
          params.set("countryCode", countryCode);
        }
        const response = await fetch(`/api/address/autocomplete?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json()) as { data?: AddressSuggestion[]; error?: string };
        if (!response.ok) {
          setError(payload.error ?? "Address search failed");
          setSuggestions([]);
          setOpen(false);
          return;
        }
        setSuggestions(payload.data ?? []);
        setOpen((payload.data ?? []).length > 0);
      } catch {
        setError("Address search failed");
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [countryCode, locale, sessionToken, value]);

  async function handleSelect(suggestion: AddressSuggestion) {
    onChange(suggestion.label);
    setOpen(false);
    setSuggestions([]);
    try {
      const response = await fetch("/api/address/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: suggestion.placeId,
          locale,
          sessionToken,
        }),
      });
      const payload = (await response.json()) as { data?: NormalizedAddress; error?: string };
      if (!response.ok || !payload.data) return;
      onSelect(payload.data);
    } catch {
      // Silent fallback to manual entry.
    }
  }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading ? (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ) : null}
      {open && suggestions.length > 0 ? (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.map((item) => (
            <button
              key={item.placeId}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors"
            >
              <div className="text-sm text-gray-800">{item.label}</div>
              {item.secondaryLabel ? (
                <div className="text-xs text-gray-500">{item.secondaryLabel}</div>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-1 text-xs text-amber-600">{error}</p> : null}
    </div>
  );
}
