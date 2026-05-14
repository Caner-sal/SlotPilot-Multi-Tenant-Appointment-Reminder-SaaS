-- Redefine StaffInvite for secure token-hash compatibility
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_StaffInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "staffId" TEXT,
    "token" TEXT,
    "tokenHash" TEXT,
    "invitedEmail" TEXT NOT NULL,
    "invitedName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "acceptedAt" DATETIME,
    "createdByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StaffInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StaffInvite_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StaffInvite_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_StaffInvite" (
    "id",
    "organizationId",
    "staffId",
    "token",
    "tokenHash",
    "invitedEmail",
    "invitedName",
    "role",
    "status",
    "expiresAt",
    "usedAt",
    "acceptedAt",
    "createdByUserId",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "organizationId",
    "staffId",
    "token",
    NULL AS "tokenHash",
    "email" AS "invitedEmail",
    NULL AS "invitedName",
    'STAFF' AS "role",
    CASE
        WHEN "usedAt" IS NOT NULL THEN 'ACCEPTED'
        WHEN "expiresAt" < CURRENT_TIMESTAMP THEN 'EXPIRED'
        ELSE 'PENDING'
    END AS "status",
    "expiresAt",
    "usedAt",
    "usedAt" AS "acceptedAt",
    NULL AS "createdByUserId",
    "createdAt",
    CURRENT_TIMESTAMP AS "updatedAt"
FROM "StaffInvite";

DROP TABLE "StaffInvite";
ALTER TABLE "new_StaffInvite" RENAME TO "StaffInvite";

CREATE UNIQUE INDEX "StaffInvite_token_key" ON "StaffInvite"("token");
CREATE UNIQUE INDEX "StaffInvite_tokenHash_key" ON "StaffInvite"("tokenHash");
CREATE INDEX "StaffInvite_token_idx" ON "StaffInvite"("token");
CREATE INDEX "StaffInvite_tokenHash_idx" ON "StaffInvite"("tokenHash");
CREATE INDEX "StaffInvite_organizationId_idx" ON "StaffInvite"("organizationId");
CREATE INDEX "StaffInvite_createdByUserId_idx" ON "StaffInvite"("createdByUserId");
CREATE INDEX "StaffInvite_status_expiresAt_idx" ON "StaffInvite"("status", "expiresAt");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
