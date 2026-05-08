import { vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn(), create: vi.fn(), upsert: vi.fn() },
    organization: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    organizationMember: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    service: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    staff: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), count: vi.fn() },
    staffService: { findUnique: vi.fn() },
    availabilityRule: { findUnique: vi.fn(), findMany: vi.fn() },
    appointment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    reminder: { create: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    subscription: { findUnique: vi.fn() },
    auditLog: { create: vi.fn() },
    customer: { findFirst: vi.fn(), create: vi.fn() },
  },
}));
