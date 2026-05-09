export interface TurkeyHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  type: "national" | "religious";
}

export const TURKEY_HOLIDAYS_2025: TurkeyHoliday[] = [
  { date: "2025-01-01", name: "Yılbaşı",                        type: "national" },
  { date: "2025-03-30", name: "Ramazan Bayramı Arifesi",        type: "religious" },
  { date: "2025-03-31", name: "Ramazan Bayramı 1. Günü",        type: "religious" },
  { date: "2025-04-01", name: "Ramazan Bayramı 2. Günü",        type: "religious" },
  { date: "2025-04-02", name: "Ramazan Bayramı 3. Günü",        type: "religious" },
  { date: "2025-04-23", name: "Ulusal Egemenlik ve Çocuk Bayramı", type: "national" },
  { date: "2025-05-01", name: "Emek ve Dayanışma Günü",         type: "national" },
  { date: "2025-05-19", name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı", type: "national" },
  { date: "2025-06-05", name: "Kurban Bayramı Arifesi",         type: "religious" },
  { date: "2025-06-06", name: "Kurban Bayramı 1. Günü",         type: "religious" },
  { date: "2025-06-07", name: "Kurban Bayramı 2. Günü",         type: "religious" },
  { date: "2025-06-08", name: "Kurban Bayramı 3. Günü",         type: "religious" },
  { date: "2025-06-09", name: "Kurban Bayramı 4. Günü",         type: "religious" },
  { date: "2025-07-15", name: "Demokrasi ve Millî Birlik Günü", type: "national" },
  { date: "2025-08-30", name: "Zafer Bayramı",                  type: "national" },
  { date: "2025-10-29", name: "Cumhuriyet Bayramı",             type: "national" },
];

export const TURKEY_HOLIDAYS_2026: TurkeyHoliday[] = [
  { date: "2026-01-01", name: "Yılbaşı",                        type: "national" },
  { date: "2026-03-19", name: "Ramazan Bayramı Arifesi",        type: "religious" },
  { date: "2026-03-20", name: "Ramazan Bayramı 1. Günü",        type: "religious" },
  { date: "2026-03-21", name: "Ramazan Bayramı 2. Günü",        type: "religious" },
  { date: "2026-03-22", name: "Ramazan Bayramı 3. Günü",        type: "religious" },
  { date: "2026-04-23", name: "Ulusal Egemenlik ve Çocuk Bayramı", type: "national" },
  { date: "2026-05-01", name: "Emek ve Dayanışma Günü",         type: "national" },
  { date: "2026-05-19", name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı", type: "national" },
  { date: "2026-05-26", name: "Kurban Bayramı Arifesi",         type: "religious" },
  { date: "2026-05-27", name: "Kurban Bayramı 1. Günü",         type: "religious" },
  { date: "2026-05-28", name: "Kurban Bayramı 2. Günü",         type: "religious" },
  { date: "2026-05-29", name: "Kurban Bayramı 3. Günü",         type: "religious" },
  { date: "2026-05-30", name: "Kurban Bayramı 4. Günü",         type: "religious" },
  { date: "2026-07-15", name: "Demokrasi ve Millî Birlik Günü", type: "national" },
  { date: "2026-08-30", name: "Zafer Bayramı",                  type: "national" },
  { date: "2026-10-29", name: "Cumhuriyet Bayramı",             type: "national" },
];

export const TURKEY_HOLIDAYS_2027: TurkeyHoliday[] = [
  { date: "2027-01-01", name: "Yılbaşı",                        type: "national" },
  { date: "2027-03-09", name: "Ramazan Bayramı Arifesi",        type: "religious" },
  { date: "2027-03-10", name: "Ramazan Bayramı 1. Günü",        type: "religious" },
  { date: "2027-03-11", name: "Ramazan Bayramı 2. Günü",        type: "religious" },
  { date: "2027-03-12", name: "Ramazan Bayramı 3. Günü",        type: "religious" },
  { date: "2027-04-23", name: "Ulusal Egemenlik ve Çocuk Bayramı", type: "national" },
  { date: "2027-05-01", name: "Emek ve Dayanışma Günü",         type: "national" },
  { date: "2027-05-16", name: "Kurban Bayramı Arifesi",         type: "religious" },
  { date: "2027-05-17", name: "Kurban Bayramı 1. Günü",         type: "religious" },
  { date: "2027-05-18", name: "Kurban Bayramı 2. Günü",         type: "religious" },
  { date: "2027-05-19", name: "Atatürk'ü Anma ve Kurban Bayramı 3. Günü", type: "national" },
  { date: "2027-05-20", name: "Kurban Bayramı 4. Günü",         type: "religious" },
  { date: "2027-07-15", name: "Demokrasi ve Millî Birlik Günü", type: "national" },
  { date: "2027-08-30", name: "Zafer Bayramı",                  type: "national" },
  { date: "2027-10-29", name: "Cumhuriyet Bayramı",             type: "national" },
];

export const ALL_TURKEY_HOLIDAYS: TurkeyHoliday[] = [
  ...TURKEY_HOLIDAYS_2025,
  ...TURKEY_HOLIDAYS_2026,
  ...TURKEY_HOLIDAYS_2027,
];

export function isTurkeyHoliday(dateStr: string): boolean {
  return ALL_TURKEY_HOLIDAYS.some((h) => h.date === dateStr);
}

export function getTurkeyHoliday(dateStr: string): TurkeyHoliday | undefined {
  return ALL_TURKEY_HOLIDAYS.find((h) => h.date === dateStr);
}
