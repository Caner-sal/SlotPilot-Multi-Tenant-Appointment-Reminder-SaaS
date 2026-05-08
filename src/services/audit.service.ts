import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

interface AuditLogParams {
  organizationId?: string;
  actorUserId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        organizationId: params.organizationId,
        actorUserId: params.actorUserId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    console.error("Failed to create audit log:", params);
  }
}
