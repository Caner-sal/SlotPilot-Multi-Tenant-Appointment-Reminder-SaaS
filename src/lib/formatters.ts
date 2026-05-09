const TR_LOCALE = "tr-TR";
const TR_TIMEZONE = "Europe/Istanbul";
const TR_CURRENCY = "TRY";

export function formatCurrencyTRY(cents: number): string {
  return new Intl.NumberFormat(TR_LOCALE, {
    style: "currency",
    currency: TR_CURRENCY,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDateTR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(TR_LOCALE, {
    dateStyle: "long",
    timeZone: TR_TIMEZONE,
  }).format(d);
}

export function formatTimeTR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(TR_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TR_TIMEZONE,
    hour12: false,
  }).format(d);
}

export function formatDateTimeTR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(TR_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TR_TIMEZONE,
  }).format(d);
}

export function formatShortDateTR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(TR_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TR_TIMEZONE,
  }).format(d);
}

export function formatDurationTR(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}
