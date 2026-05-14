import { db } from "@/lib/db";
import { requireSuperAdmin, SuperAdminError } from "@/lib/superadmin";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const org = await db.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        address: true,
        timezone: true,
        bookingEnabled: true,
        status: true,
        suspended: true,
        suspendedAt: true,
        suspendedReason: true,
        suspendedByUserId: true,
        createdAt: true,
        subscription: {
          select: { plan: true, status: true, currentPeriodEnd: true },
        },
        _count: {
          select: { appointments: true, staff: true, services: true, members: true },
        },
      },
    });

    if (!org) {
      return NextResponse.json({ error: "İşletme bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ data: org });
  } catch (err) {
    if (err instanceof SuperAdminError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();

    const existing = await db.organization.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        suspended: true,
        bookingEnabled: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "İşletme bulunamadı" }, { status: 404 });
    }

    const update: {
      bookingEnabled?: boolean;
      status?: "ACTIVE" | "SUSPENDED" | "CANCELLED";
      suspended?: boolean;
      suspendedAt?: Date | null;
      suspendedReason?: string | null;
      suspendedByUserId?: string | null;
    } = {};

    if (typeof body.bookingEnabled === "boolean") {
      update.bookingEnabled = body.bookingEnabled;
    }

    const requestedStatus =
      typeof body.status === "string" && ["ACTIVE", "SUSPENDED", "CANCELLED"].includes(body.status)
        ? (body.status as "ACTIVE" | "SUSPENDED" | "CANCELLED")
        : undefined;
    const requestedSuspended = typeof body.suspended === "boolean" ? body.suspended : undefined;

    let nextStatus: "ACTIVE" | "SUSPENDED" | "CANCELLED" | undefined = requestedStatus;
    if (!nextStatus && typeof requestedSuspended === "boolean") {
      nextStatus = requestedSuspended ? "SUSPENDED" : "ACTIVE";
    }

    if (nextStatus) {
      update.status = nextStatus;
      update.suspended = nextStatus !== "ACTIVE";

      if (nextStatus === "ACTIVE") {
        update.suspendedAt = null;
        update.suspendedReason = null;
        update.suspendedByUserId = null;
      } else {
        const reasonFromBody =
          typeof body.suspendedReason === "string" && body.suspendedReason.trim().length > 0
            ? body.suspendedReason.trim()
            : null;
        update.suspendedAt = new Date();
        update.suspendedReason =
          reasonFromBody ?? (nextStatus === "CANCELLED" ? "Cancelled by superadmin" : "Suspended by superadmin");
        update.suspendedByUserId = userId;
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const org = await db.organization.update({ where: { id }, data: update });

    if (nextStatus && nextStatus !== existing.status) {
      await db.auditLog.create({
        data: {
          organizationId: id,
          actorUserId: userId,
          action: nextStatus === "ACTIVE" ? "ORGANIZATION_ACTIVATED" : "ORGANIZATION_SUSPENDED",
          entityType: "Organization",
          entityId: id,
          metadata: {
            previousStatus: existing.status,
            nextStatus,
            suspendedReason: update.suspendedReason,
          },
        },
      });
    }

    return NextResponse.json({ data: org });
  } catch (err) {
    if (err instanceof SuperAdminError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

