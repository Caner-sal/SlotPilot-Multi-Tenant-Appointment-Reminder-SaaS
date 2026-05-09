# Randevo — API Contract

All authenticated endpoints require a valid session cookie (NextAuth JWT).
All responses use `{ data: ... }` for success and `{ error: ... }` for failure.

## Authentication

### POST /api/auth/register
Register a new user.

**Body:** `{ name: string, email: string, password: string }`  
**Response 201:** `{ data: { user: { id, email, name } } }`  
**Response 409:** `{ error: "Email already in use" }`

### POST /api/auth/[...nextauth]
NextAuth handler — handles `/api/auth/signin`, `/api/auth/signout`, `/api/auth/session`, etc.

---

## Organizations

### POST /api/organizations
Create an organization (called during onboarding).

**Auth:** Required  
**Body:** `{ name: string, slug: string, description?, phone?, email?, address?, timezone? }`  
**Response 201:** `{ data: { organization } }`  
**Response 409:** `{ error: "Slug already taken" }`

### GET /api/organizations/current
Get the current user's organization.

**Auth:** Required  
**Response 200:** `{ data: { organization } }`

### PATCH /api/organizations/current
Update organization settings.

**Auth:** Required  
**Body:** Partial organization fields  
**Response 200:** `{ data: { organization } }`

---

## Services

### GET /api/services
List all services for the current organization.

**Auth:** Required  
**Response 200:** `{ data: { services: Service[] } }`

### POST /api/services
Create a service.

**Auth:** Required  
**Body:** `{ name, durationMinutes, description?, price?, currency?, isActive? }`  
**Response 201:** `{ data: { service } }`

### PATCH /api/services/[id]
Update a service.

**Auth:** Required  
**Body:** Partial service fields  
**Response 200:** `{ data: { service } }`

### DELETE /api/services/[id]
Delete a service.

**Auth:** Required  
**Response 200:** `{ data: { id } }`

---

## Staff

### GET /api/staff
List all staff for the current organization.

**Auth:** Required  
**Response 200:** `{ data: { staff: Staff[] } }`  
Each staff member includes `staffServices` with service IDs.

### POST /api/staff
Create a staff member.

**Auth:** Required  
**Body:** `{ name, email?, phone?, serviceIds?: string[], isActive? }`  
**Response 201:** `{ data: { staff } }`  
**Response 403:** `{ error: "Staff limit reached for your plan" }`

### PATCH /api/staff/[id]
Update a staff member.

**Auth:** Required  
**Body:** Partial staff fields + `serviceIds?`  
**Response 200:** `{ data: { staff } }`

### DELETE /api/staff/[id]
Delete a staff member.

**Auth:** Required  
**Response 200:** `{ data: { id } }`

---

## Availability

### GET /api/availability
List availability rules.

**Auth:** Required  
**Query:** `?staffId=` (optional filter)  
**Response 200:** `{ data: AvailabilityRule[] }`

### POST /api/availability
Create or update an availability rule (upsert by staffId+dayOfWeek).

**Auth:** Required  
**Body:** `{ staffId, dayOfWeek, startTime: "HH:MM", endTime: "HH:MM", isActive? }`  
**Response 201:** `{ data: AvailabilityRule }`

### PATCH /api/availability/[id]
Update an availability rule.

**Auth:** Required  
**Body:** Partial availability fields  
**Response 200:** `{ data: AvailabilityRule }`

### DELETE /api/availability/[id]
Delete an availability rule.

**Auth:** Required  
**Response 200:** `{ data: { id } }`

---

## Appointments

### GET /api/appointments
List appointments for the current organization.

**Auth:** Required  
**Query:** `?date=YYYY-MM-DD&status=&staffId=&serviceId=`  
**Response 200:** `{ data: { appointments: Appointment[] } }`  
Each appointment includes customer, service, and staff relations.

### PATCH /api/appointments/[id]/status
Update appointment status.

**Auth:** Required  
**Body:** `{ status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" }`  
**Response 200:** `{ data: { appointment } }`

---

## Public Booking (no auth required)

### GET /api/booking/[slug]/profile
Get public business info.

**Response 200:** `{ data: { name, slug, description, phone, email, address, timezone } }`  
**Response 403:** If booking is disabled  
**Response 404:** If org not found

### GET /api/booking/[slug]/services
Get active services for booking.

**Response 200:** `{ data: { services: Service[] } }`

### GET /api/booking/[slug]/slots
Get available time slots.

**Query:** `?date=YYYY-MM-DD&serviceId=&staffId=`  
**Response 200:** `{ data: { slots: Array<{ startTime, endTime, staffId, staffName }> } }`

### POST /api/booking/[slug]/appointments
Create a booking (public endpoint).

**Body:** `{ serviceId, staffId, startTime, endTime, customerFullName, customerEmail, customerPhone?, notes? }`  
**Response 201:** `{ data: { appointment } }`  
**Response 409:** `{ error: "Time slot is no longer available" }` (conflict)  
**Response 403:** `{ error: "Appointment limit reached" }` (plan limit)

---

## Billing

### GET /api/billing/subscription
Get current subscription.

**Auth:** Required  
**Response 200:** `{ data: { subscription, limits } }`  
`limits`: `{ maxStaff, maxAppointmentsPerMonth }`

### POST /api/billing/checkout
Create Stripe checkout session.

**Auth:** Required  
**Body:** `{ plan: "STARTER" | "PRO" }`  
**Response 200 (Stripe configured):** `{ url: checkoutUrl }`  
**Response 200 (demo mode):** `{ mode: "test", message: "Stripe not configured..." }`

### POST /api/webhooks/stripe
Stripe webhook handler (raw body, no auth).

**Headers:** `stripe-signature` required  
**Events handled:** `customer.subscription.updated`, `customer.subscription.deleted`

---

## Reminders

### GET /api/reminders
List reminders for the current organization.

**Auth:** Required  
**Query:** `?status=&appointmentId=`  
**Response 200:** `{ data: { reminders: Reminder[] } }`

### POST /api/reminders/process
Process pending reminders (send overdue ones).

**Auth:** Required  
**Response 200:** `{ data: { processed, sent, failed } }`

---

## Analytics

### GET /api/analytics
Dashboard metrics.

**Auth:** Required  
**Response 200:**
```json
{
  "data": {
    "todayAppointments": 0,
    "weekAppointments": 0,
    "monthAppointments": 0,
    "cancelledThisMonth": 0,
    "completedThisMonth": 0,
    "noShowThisMonth": 0,
    "revenue": 0,
    "topService": { "name": "...", "count": 0 } | null,
    "busiestStaff": { "name": "...", "count": 0 } | null
  }
}
```

---

## Audit Logs

### GET /api/audit-logs
List audit log entries.

**Auth:** Required  
**Query:** `?entityType=&action=&limit=50`  
**Response 200:** `{ data: { logs: AuditLog[] } }`

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Validation error (Zod) |
| 401 | Not authenticated |
| 403 | Access denied (wrong org / plan limit) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, slug taken, slot taken) |
| 500 | Internal server error |
