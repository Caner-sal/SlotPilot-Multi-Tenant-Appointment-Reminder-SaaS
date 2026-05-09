export function normalizeTRPhone(raw: string): string {
  if (!raw) throw new Error("Telefon numarası boş olamaz.");

  const digits = raw.replace(/\D/g, "");

  // Handle formats: 05321234567, 5321234567, 905321234567, +905321234567
  let national = digits;
  if (digits.startsWith("90") && digits.length === 12) {
    national = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    national = digits.slice(1);
  } else if (digits.length === 10) {
    national = digits;
  } else {
    throw new Error("Geçersiz Türkiye telefon numarası.");
  }

  // Turkish mobile numbers start with 5, landlines with 2-4
  if (national.length !== 10) {
    throw new Error("Geçersiz Türkiye telefon numarası.");
  }

  return `+90${national}`;
}

export function displayTRPhone(normalized: string): string {
  // Expects +905321234567 format
  const match = normalized.match(/^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (!match) return normalized;
  return `+90 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}
