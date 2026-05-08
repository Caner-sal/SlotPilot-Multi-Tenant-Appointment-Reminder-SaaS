# SlotPilot — Product Requirements

## Product Summary

SlotPilot is a multi-tenant SaaS platform that enables local service businesses to manage appointments, staff, customers, and automated reminders. It provides a public booking page for each business so customers can self-book without calling or messaging.

## Target Customers

- Barbershops
- Beauty salons and nail studios
- Private tutors and coaches
- Dietitians and consultants
- Personal trainers
- Small workshops and course centers
- Any appointment-based local service business

## Core Problem

Small businesses manage appointments via WhatsApp, phone calls, notebooks, or Excel. This leads to:
- Double bookings (same time slot, two customers)
- Customer no-shows (no reminders)
- Revenue leakage (missed slots)
- No analytics (can't track performance)
- No 24/7 booking (business must be available to accept appointments)

## Solution

SlotPilot provides:
1. A unique public booking URL per business (`/booking/[slug]`)
2. Real-time slot availability based on staff schedules
3. Automated email reminders 24h before appointments
4. A management dashboard for owners to oversee all bookings

## Monetization Model

| Plan | Price | Staff | Appts/month | Email Reminders |
|------|-------|-------|-------------|-----------------|
| Free | $0 | 1 | 20 | No |
| Starter | $9/mo | 3 | 300 | Yes |
| Pro | $19/mo | Unlimited | Unlimited | Yes |

## User Stories

### Business Owner
- As an owner, I can register and create my business profile
- As an owner, I can define my services with price and duration
- As an owner, I can add staff members and assign them to services
- As an owner, I can set weekly availability hours per staff
- As an owner, I can view all upcoming appointments
- As an owner, I can update appointment statuses (confirm, cancel, complete)
- As an owner, I can see analytics (revenue, counts, top services)
- As an owner, I can manage my subscription plan

### Customer (Public)
- As a customer, I can visit the business booking page
- As a customer, I can select a service and preferred staff
- As a customer, I can see available time slots for a date
- As a customer, I can book an appointment with my name, email, and phone
- As a customer, I can see a confirmation after booking

## Out-of-Scope (MVP)

- Native mobile app
- SMS reminders
- WhatsApp integration
- Google Calendar sync
- Staff login portal
- Multi-location support
- Online deposit payments
- Marketplace
- AI features
- Super admin panel

## Acceptance Criteria

- Build passes with no TypeScript errors
- All unit tests pass
- Tenant data isolation verified by tests
- Plan limits enforced on backend
- No real secrets in codebase
- README is complete and accurate
