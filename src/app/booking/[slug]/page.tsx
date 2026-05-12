"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { getLocaleFromPath } from "@/i18n/pathing";
import { defaultLocale, localeMetadata } from "@/i18n/locales";
import { TURKEY_PROVINCES, getDistrictsByProvince } from "@/data/turkey-provinces";

interface BusinessProfile {
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  timezone: string;
  aiChatbotEnabled: boolean;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  staffServices: { staff: { id: string; name: string } }[];
}

interface StaffMember {
  id: string;
  name: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface BookingConfirmation {
  id: string;
  startTime: string;
  service: { name: string };
  staff: { name: string };
  customer: { fullName: string; email: string };
}

type Step = 1 | 2 | 3 | 4 | 5;

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(cents / 100);
}

function getNext14Days() {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDate(d: Date, dateLocale: string) {
  return d.toLocaleDateString(dateLocale, { weekday: "short", month: "short", day: "numeric" });
}

function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const t = useTranslations("booking");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname) ?? defaultLocale;
  const dateLocale = localeMetadata[locale].dateLocale;

  const [step, setStep] = useState<Step>(1);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    notes: "",
    privacyNoticeAcknowledged: false,
    appointmentNotificationConsent: true,
    marketingConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadingProfile(true);
      try {
        const [profileRes, servicesRes] = await Promise.all([
          fetch(`/api/booking/${slug}/profile`),
          fetch(`/api/booking/${slug}/services`),
        ]);

        if (!profileRes.ok) {
          const j = await profileRes.json();
          setProfileError(j.error ?? t("businessNotFound"));
          return;
        }

        const profileJson = await profileRes.json();
        setProfile(profileJson.data);

        if (servicesRes.ok) {
          const servicesJson = await servicesRes.json();
          setServices(servicesJson.data ?? []);
        }
      } catch {
        setProfileError(t("businessLoadError"));
      } finally {
        setLoadingProfile(false);
      }
    }
    load();
  }, [slug, t]);

  const fetchSlots = useCallback(async () => {
    if (!selectedService || !selectedStaff || !selectedDate) return;
    setLoadingSlots(true);
    setSlotsError(null);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const params = new URLSearchParams({
        serviceId: selectedService.id,
        staffId: selectedStaff.id,
        date: toDateString(selectedDate),
      });
      const res = await fetch(`/api/booking/${slug}/slots?${params}`);
      if (!res.ok) {
        const j = await res.json();
        setSlotsError(j.error ?? t("slotsLoadError"));
        return;
      }
      const json = await res.json();
      setSlots(json.data ?? []);
      if ((json.data ?? []).length === 0) {
        setSlotsError(t("noSlotsForDate"));
      }
    } catch {
      setSlotsError(t("slotsError"));
    } finally {
      setLoadingSlots(false);
    }
  }, [slug, selectedService, selectedStaff, selectedDate, t]);

  useEffect(() => {
    if (step === 3 && selectedService && selectedStaff && selectedDate) {
      fetchSlots();
    }
  }, [step, fetchSlots, selectedService, selectedStaff, selectedDate]);

  function selectService(service: Service) {
    setSelectedService(service);
    const staffMembers = service.staffServices.map((ss) => ss.staff);
    setStaffList(staffMembers);
    setSelectedStaff(staffMembers.length === 1 ? staffMembers[0] : null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(2);
  }

  function handleStaffAndDateComplete() {
    if (!selectedStaff || !selectedDate) return;
    setStep(3);
  }

  function selectSlot(slot: TimeSlot) {
    setSelectedSlot(slot);
    setStep(4);
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedStaff || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/booking/${slug}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          staffId: selectedStaff.id,
          startTime: selectedSlot.startTime,
          customerName: customerForm.name,
          customerEmail: customerForm.email,
          customerPhone: customerForm.phone || undefined,
          customerProvince: customerForm.province || undefined,
          customerDistrict: customerForm.district || undefined,
          notes: customerForm.notes || undefined,
          privacyNoticeAcknowledged: customerForm.privacyNoticeAcknowledged,
          appointmentNotificationConsent: customerForm.appointmentNotificationConsent,
          marketingConsent: customerForm.marketingConsent,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        setSubmitError(typeof j.error === "string" ? j.error : t("bookingFailed"));
        return;
      }
      const json = await res.json();
      setConfirmation(json.data);
      setStep(5);
    } finally {
      setSubmitting(false);
    }
  }

  async function sendChatMessage(e: React.FormEvent) {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    const userMsg: ChatMsg = { role: "user", content: msg };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`/api/booking/${slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, conversationHistory: chatMessages.slice(-10) }),
      });
      const json = await res.json() as { data?: { reply: string }; error?: string };
      const reply = json.data?.reply ?? t("aiError1");
      setChatMessages([...updated, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages([...updated, { role: "assistant", content: t("aiError2") }]);
    } finally {
      setChatLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setCustomerForm({ name: "", email: "", phone: "", province: "", district: "", notes: "", privacyNoticeAcknowledged: false, appointmentNotificationConsent: true, marketingConsent: false });
    setSubmitError(null);
    setConfirmation(null);
  }

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-64 p-10">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {profileError.includes("bulunamadı") || profileError.includes("not found")
            ? t("businessNotFound")
            : t("notAvailable")}
        </h1>
        <p className="text-gray-500">{profileError}</p>
      </div>
    );
  }

  const days = getNext14Days();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {profile && (
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
          {profile.description && (
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">{profile.description}</p>
          )}
          {(profile.address || profile.phone) && (
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-400">
              {profile.address && <span>{profile.address}</span>}
              {profile.phone && <span>{profile.phone}</span>}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                step > s
                  ? "bg-blue-600 text-white"
                  : step === s
                  ? "bg-blue-600 text-white ring-4 ring-blue-100"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > s ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                s
              )}
            </div>
            {s < 4 && (
              <div className={`w-12 h-0.5 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-5">{t("step1Title")}</h2>
          {services.length === 0 ? (
            <div className="text-center py-12 text-gray-400">{t("noServices")}</div>
          ) : (
            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => selectService(service)}
                  className="w-full text-left bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md rounded-xl p-5 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {service.durationMinutes} {tCommon("min")}
                        </span>
                        {service.staffServices.length > 0 && (
                          <span className="text-sm text-gray-500">
                            {service.staffServices.length} {tCommon("worker")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <span className="font-bold text-blue-600 text-lg">
                        {formatPrice(service.priceCents, service.currency)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedService && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {t("backToServices")}
          </button>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{t("step2Title")}</h2>
            <div className="text-sm text-gray-500">
              {selectedService.name} · {selectedService.durationMinutes} {tCommon("min")}
            </div>
          </div>

          {staffList.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">{t("selectStaff")}</label>
              <div className="grid grid-cols-2 gap-3">
                {staffList.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                      selectedStaff?.id === staff.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-300 text-gray-700"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 mx-auto mb-1">
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    {staff.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {staffList.length === 1 && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                {staffList[0].name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("appointmentWith")}</p>
                <p className="font-medium text-gray-900">{staffList[0].name}</p>
              </div>
            </div>
          )}

          {staffList.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">
              {t("noStaff")}
            </div>
          )}

          {selectedStaff && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">{t("selectDate")}</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {days.map((day) => (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`p-2.5 rounded-xl border text-center transition-colors ${
                      selectedDate && toDateString(selectedDate) === toDateString(day)
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {day.toLocaleDateString(dateLocale, { weekday: "short" })}
                    </div>
                    <div className="text-sm font-bold mt-0.5">
                      {day.getDate()}
                    </div>
                    <div className="text-xs opacity-70">
                      {day.toLocaleDateString(dateLocale, { month: "short" })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedStaff && selectedDate && (
            <button
              onClick={handleStaffAndDateComplete}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {t("viewSlots")}
            </button>
          )}
        </div>
      )}

      {step === 3 && selectedService && selectedStaff && selectedDate && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {tCommon("back")}
          </button>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{t("step3Title")}</h2>
            <p className="text-sm text-gray-500">
              {selectedStaff.name} · {formatDate(selectedDate, dateLocale)}
            </p>
          </div>

          {loadingSlots && (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingSlots && slotsError && (
            <div className="text-center py-10">
              <p className="text-gray-500">{slotsError}</p>
              <button
                onClick={() => setStep(2)}
                className="mt-4 text-blue-600 hover:underline text-sm"
              >
                {t("differentDate")}
              </button>
            </div>
          )}

          {!loadingSlots && !slotsError && slots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const time = new Date(slot.startTime).toLocaleTimeString(dateLocale, {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <button
                    key={slot.startTime}
                    onClick={() => selectSlot(slot)}
                    className="py-2.5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {step === 4 && selectedService && selectedStaff && selectedSlot && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(3)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {tCommon("back")}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">{t("summaryTitle")}</h3>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>{t("serviceLabel")}</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("staffLabel")}</span>
                <span className="font-medium">{selectedStaff.name}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("dateTime")}</span>
                <span className="font-medium">
                  {new Date(selectedSlot.startTime).toLocaleString(dateLocale, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{tCommon("price")}</span>
                <span className="font-bold text-blue-800">
                  {formatPrice(selectedService.priceCents, selectedService.currency)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("step4Title")}</h2>
            <form onSubmit={handleConfirm} className="space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fullName")}
                </label>
                <input
                  required
                  minLength={2}
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("namePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("emailLabel")}
                </label>
                <input
                  required
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("emailPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("phoneLabel")}{" "}
                  <span className="text-gray-400 font-normal">{t("phoneOptional")}</span>
                </label>
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+90 555 000 0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("province")}{" "}
                    <span className="text-gray-400 font-normal">{t("phoneOptional")}</span>
                  </label>
                  <select
                    value={customerForm.province}
                    onChange={(e) => setCustomerForm({ ...customerForm, province: e.target.value, district: "" })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t("provincePlaceholder")}</option>
                    {TURKEY_PROVINCES.map((p) => (
                      <option key={p.slug} value={p.slug}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("district")}{" "}
                    <span className="text-gray-400 font-normal">{t("phoneOptional")}</span>
                  </label>
                  <select
                    value={customerForm.district}
                    onChange={(e) => setCustomerForm({ ...customerForm, district: e.target.value })}
                    disabled={!customerForm.province}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">{t("districtPlaceholder")}</option>
                    {getDistrictsByProvince(customerForm.province).map((d) => (
                      <option key={d.slug} value={d.slug}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tCommon("notes")}{" "}
                  <span className="text-gray-400 font-normal">{t("phoneOptional")}</span>
                </label>
                <textarea
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder={t("notesPlaceholder")}
                />
              </div>
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={customerForm.privacyNoticeAcknowledged}
                    onChange={(e) => setCustomerForm({ ...customerForm, privacyNoticeAcknowledged: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="text-red-500">*</span>{" "}
                    {t("kvkkConsent")}
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customerForm.appointmentNotificationConsent}
                    onChange={(e) => setCustomerForm({ ...customerForm, appointmentNotificationConsent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {t("reminderConsent")}
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customerForm.marketingConsent}
                    onChange={(e) => setCustomerForm({ ...customerForm, marketingConsent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {t("marketingConsent")}
                  </span>
                </label>
              </div>
              <button
                type="submit"
                disabled={submitting || !customerForm.privacyNoticeAcknowledged}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 text-sm"
              >
                {submitting ? t("confirming") : t("confirm")}
              </button>
            </form>
          </div>
        </div>
      )}

      {profile?.aiChatbotEnabled && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {chatOpen && (
            <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
              <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-semibold">{t("aiAssistant")}</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72 min-h-32">
                {chatMessages.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    {t("aiGreeting")}
                  </p>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-xl px-3 py-2">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={sendChatMessage} className="border-t border-gray-100 p-2 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t("aiPlaceholder")}
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
            aria-label="AI asistanı aç"
          >
            {chatOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {step === 5 && confirmation && profile && (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("confirmed")}</h2>
            <p className="text-gray-500 mt-1">
              {confirmation.customer.email} {t("confirmationEmail")}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left space-y-3">
            <h3 className="font-semibold text-gray-900">{profile.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t("serviceLabel")}</span>
                <span className="font-medium text-gray-900">{confirmation.service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("staffLabel")}</span>
                <span className="font-medium text-gray-900">{confirmation.staff.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("dateTime")}</span>
                <span className="font-medium text-gray-900">
                  {new Date(confirmation.startTime).toLocaleString(dateLocale, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("customerLabel")}</span>
                <span className="font-medium text-gray-900">{confirmation.customer.fullName}</span>
              </div>
              {profile.address && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{tCommon("address")}</span>
                  <span className="font-medium text-gray-900">{profile.address}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{tCommon("phone")}</span>
                  <span className="font-medium text-gray-900">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={reset}
            className="inline-flex items-center gap-2 border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {t("newBooking")}
          </button>
        </div>
      )}
    </div>
  );
}
