"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

interface BusinessProfile {
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  timezone: string;
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

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;

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
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

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
          setProfileError(j.error ?? "Business not found");
          return;
        }

        const profileJson = await profileRes.json();
        setProfile(profileJson.data);

        if (servicesRes.ok) {
          const servicesJson = await servicesRes.json();
          setServices(servicesJson.data ?? []);
        }
      } catch {
        setProfileError("Failed to load business information.");
      } finally {
        setLoadingProfile(false);
      }
    }
    load();
  }, [slug]);

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
        setSlotsError(j.error ?? "Failed to load slots");
        return;
      }
      const json = await res.json();
      setSlots(json.data ?? []);
      if ((json.data ?? []).length === 0) {
        setSlotsError("No available slots for this date.");
      }
    } catch {
      setSlotsError("Failed to load slots.");
    } finally {
      setLoadingSlots(false);
    }
  }, [slug, selectedService, selectedStaff, selectedDate]);

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
          notes: customerForm.notes || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        setSubmitError(typeof j.error === "string" ? j.error : "Failed to create booking");
        return;
      }
      const json = await res.json();
      setConfirmation(json.data);
      setStep(5);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep(1);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setCustomerForm({ name: "", email: "", phone: "", notes: "" });
    setSubmitError(null);
    setConfirmation(null);
  }

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-64 p-10">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {profileError.includes("not found") ? "Business Not Found" : "Booking Not Available"}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Select a Service</h2>
          {services.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No services available at this time.</div>
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
                          {service.durationMinutes} min
                        </span>
                        {service.staffServices.length > 0 && (
                          <span className="text-sm text-gray-500">
                            {service.staffServices.length} staff
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
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
            Back to Services
          </button>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose Staff & Date</h2>
            <div className="text-sm text-gray-500">
              {selectedService.name} · {selectedService.durationMinutes} min
            </div>
          </div>

          {staffList.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Staff</label>
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
                <p className="text-sm text-gray-500">Your appointment will be with</p>
                <p className="font-medium text-gray-900">{staffList[0].name}</p>
              </div>
            </div>
          )}

          {staffList.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">
              No staff available for this service.
            </div>
          )}

          {selectedStaff && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select a Date</label>
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
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div className="text-sm font-bold mt-0.5">
                      {day.getDate()}
                    </div>
                    <div className="text-xs opacity-70">
                      {day.toLocaleDateString("en-US", { month: "short" })}
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
              View Available Times
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
            Back
          </button>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Select a Time</h2>
            <p className="text-sm text-gray-500">
              {selectedStaff.name} · {formatDate(selectedDate)}
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
                Choose a different date
              </button>
            </div>
          )}

          {!loadingSlots && !slotsError && slots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const time = new Date(slot.startTime).toLocaleTimeString([], {
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
            Back
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Booking Summary</h3>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>Service</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Staff</span>
                <span className="font-medium">{selectedStaff.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time</span>
                <span className="font-medium">
                  {new Date(selectedSlot.startTime).toLocaleString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price</span>
                <span className="font-bold text-blue-800">
                  {formatPrice(selectedService.priceCents, selectedService.currency)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
            <form onSubmit={handleConfirm} className="space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  required
                  minLength={2}
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  required
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+90 555 000 0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Any special requests?"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 text-sm"
              >
                {submitting ? "Confirming..." : "Confirm Booking"}
              </button>
            </form>
          </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
            <p className="text-gray-500 mt-1">
              A confirmation will be sent to {confirmation.customer.email}.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left space-y-3">
            <h3 className="font-semibold text-gray-900">{profile.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium text-gray-900">{confirmation.service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Staff</span>
                <span className="font-medium text-gray-900">{confirmation.staff.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Time</span>
                <span className="font-medium text-gray-900">
                  {new Date(confirmation.startTime).toLocaleString([], {
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
                <span className="text-gray-500">Name</span>
                <span className="font-medium text-gray-900">{confirmation.customer.fullName}</span>
              </div>
              {profile.address && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-gray-900">{profile.address}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={reset}
            className="inline-flex items-center gap-2 border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Book Another Appointment
          </button>
        </div>
      )}
    </div>
  );
}
