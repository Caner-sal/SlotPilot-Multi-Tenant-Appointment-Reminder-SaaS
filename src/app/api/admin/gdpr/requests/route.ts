import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import { requireSuperAdmin, SuperAdminError } from "@/lib/superadmin";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  type: z.enum(["all", "deletion", "export"]).default("all"),
  status: z.string().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

type UnifiedRequest = {
  id: string;
  type: "deletion" | "export";
  organizationId: string;
  customerId: string | null;
  email: string;
  reason: string | null;
  status: string;
  format: string | null;
  downloadUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/admin/gdpr/requests";
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      type: searchParams.get("type") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400, headers: { "x-request-id": requestId } });
    }

    const { type, status, page, limit } = parsed.data;
    const take = limit * page;

    const [deletions, exports] = await Promise.all([
      type === "export"
        ? Promise.resolve([])
        : db.dataDeletionRequest.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: "desc" },
            take,
            select: {
              id: true,
              organizationId: true,
              customerId: true,
              email: true,
              reason: true,
              status: true,
              createdAt: true,
            },
          }),
      type === "deletion"
        ? Promise.resolve([])
        : db.dataExportRequest.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: "desc" },
            take,
            select: {
              id: true,
              organizationId: true,
              customerId: true,
              email: true,
              reason: true,
              status: true,
              format: true,
              downloadUrl: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
    ]);

    const unified: UnifiedRequest[] = [
      ...deletions.map((item) => ({
        id: item.id,
        type: "deletion" as const,
        organizationId: item.organizationId,
        customerId: item.customerId,
        email: item.email,
        reason: item.reason,
        status: item.status,
        format: null,
        downloadUrl: null,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      })),
      ...exports.map((item) => ({
        id: item.id,
        type: "export" as const,
        organizationId: item.organizationId,
        customerId: item.customerId,
        email: item.email,
        reason: item.reason,
        status: item.status,
        format: item.format,
        downloadUrl: item.downloadUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    ]
      .sort((a, b) => {
        const diff = b.createdAt.getTime() - a.createdAt.getTime();
        if (diff !== 0) return diff;
        if (a.type === b.type) return b.id.localeCompare(a.id);
        return a.type.localeCompare(b.type);
      });

    const total = unified.length;
    const start = (page - 1) * limit;
    const items = unified.slice(start, start + limit);

    logger.info("admin gdpr requests queried", {
      requestId,
      route,
      outcome: "success",
      type,
      page,
      limit,
      count: items.length,
    });

    return NextResponse.json(
      {
        data: {
          items,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
          },
        },
      },
      { headers: { "x-request-id": requestId } }
    );
  } catch (err) {
    if (err instanceof SuperAdminError) {
      return NextResponse.json({ error: err.message }, { status: 403, headers: { "x-request-id": requestId } });
    }
    logger.error("admin gdpr requests failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
