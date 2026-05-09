# Randevo — Database Schema

## Overview

PostgreSQL 16 via Prisma ORM. All tenant data is scoped by `organizationId`.

## Enums

| Enum | Values |
|------|--------|
| `MemberRole` | OWNER, ADMIN, STAFF |
| `AppointmentStatus` | PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW |
| `ReminderType` | EMAIL, SMS |
| `ReminderStatus` | PENDING, SENT, FAILED, CANCELLED |
| `SubscriptionPlan` | FREE, STARTER, PRO |
| `SubscriptionStatus` | ACTIVE, CANCELLED, PAST_DUE |
| `DayOfWeek` | MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY |

## Models

### User
Auth identity. One user can belong to multiple organizations.

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| name | String | Display name |
| email | String | Unique |
| passwordHash | String | bcrypt 12 rounds |
| createdAt | DateTime | |
| updatedAt | DateTime | auto |

Relations: `memberships[]`

### Organization
The tenant unit. Every other resource belongs to one.

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| name | String | Display name |
| slug | String | Unique, URL-safe identifier |
| description | String? | |
| phone | String? | |
| email | String? | |
| address | String? | |
| timezone | String | default "UTC" |
| bookingEnabled | Boolean | default true |
| createdAt | DateTime | |
| updatedAt | DateTime | auto |

Relations: `members[]`, `services[]`, `staff[]`, `customers[]`, `appointments[]`, `availabilityRules[]`, `reminders[]`, `subscription?`, `auditLogs[]`

### OrganizationMember
Junction between User and Organization with role.

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| organizationId | String | FK → Organization |
| role | MemberRole | default OWNER |
| createdAt | DateTime | |

Unique: `(userId, organizationId)`

### Service
A bookable service offered by the business.

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| organizationId | String | FK → Organization |
| name | String | |
| description | String? | |
| durationMinutes | Int | Slot duration |
| price | Decimal? | Optional price |
| currency | String | default "TRY" |
| isActive | Boolean | default true |
| createdAt | DateTime | |
| updatedAt | DateTime | auto |

### Staff
A staff member. Linked to a User via userId (optional for staff-only accounts).

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| organizationId | String | FK → Organization |
| userId | String? | Optional link to User |
| name | String | |
| email | String? | |
| phone | String? | |
| isActive | Boolean | default true |
| createdAt | DateTime | |
| updatedAt | DateTime | auto |

Relations: `staffServices[]` (M2M with Service), `availabilityRules[]`, `appointments[]`

### StaffService
Many-to-many between Staff and Service.

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| staffId | String | FK → Staff |
| serviceId | String | FK → Service |

Unique: `(staffId, serviceId)`

### Customer
A customer who books appointments.

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| organizationId | String | FK → Organization |
| fullName | String | |
| email | String | |
| phone | String? | |
| notes | String? | |
| createdAt | DateTime | |
| updatedAt | DateTime | auto |

Unique: `(organizationId, email)`

### Appointment
A booked time slot.

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| organizationId | String | FK → Organization |
| customerId | String | FK → Customer |
| serviceId | String | FK → Service |
| staffId | String | FK → Staff |
| startTime | DateTime | UTC |
| endTime | DateTime | UTC, derived from service duration |
| status | AppointmentStatus | default PENDING |
| notes | String? | |
| createdAt | DateTime | |
| updatedAt | DateTime | auto |

Indexes: `organizationId`, `customerId`, `staffId`, `(organizationId, startTime)`, `(organizationId, status)`

### AvailabilityRule
Weekly recurring availability for a staff member.

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| organizationId | String | FK → Organization |
| staffId | String | FK → Staff |
| dayOfWeek | DayOfWeek | |
| startTime | String | "HH:MM" format |
| endTime | String | "HH:MM" format |
| isActive | Boolean | default true |
| createdAt | DateTime | |

Unique: `(staffId, dayOfWeek)` — one rule per staff per day

### Reminder
Email/SMS reminder for an appointment.

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| organizationId | String | FK → Organization |
| appointmentId | String | FK → Appointment |
| type | ReminderType | default EMAIL |
| scheduledAt | DateTime | When to send |
| status | ReminderStatus | default PENDING |
| sentAt | DateTime? | When actually sent |
| errorMessage | String? | Error details if FAILED |
| createdAt | DateTime | |

Indexes: `organizationId`, `(status, scheduledAt)`, `appointmentId`

### Subscription
Billing plan for an organization (one per org).

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| organizationId | String | Unique FK → Organization |
| plan | SubscriptionPlan | default FREE |
| status | SubscriptionStatus | default ACTIVE |
| stripeCustomerId | String? | |
| stripeSubscriptionId | String? | |
| currentPeriodEnd | DateTime? | |
| createdAt | DateTime | |
| updatedAt | DateTime | auto |

### AuditLog
Immutable audit trail of important actions.

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| organizationId | String? | Nullable for pre-org events |
| actorUserId | String? | |
| action | String | e.g. "service.created" |
| entityType | String? | e.g. "Service" |
| entityId | String? | |
| metadata | Json? | Additional context |
| createdAt | DateTime | |

## Key Design Decisions

- **Tenant isolation**: Every resource table has `organizationId` and all queries filter by it.
- **Customer deduplication**: `(organizationId, email)` unique constraint prevents duplicates per org.
- **Staff-Service M2M**: A staff member can only book services they're assigned to.
- **Availability unique**: One rule per (staff, dayOfWeek) allows upsert-based management.
- **Cascade deletes**: Organization deletion cascades to all related records.
- **Appointment status machine**: PENDING → CONFIRMED → COMPLETED | NO_SHOW; or any → CANCELLED.
