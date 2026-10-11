-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "industry" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "website" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "supportEmail" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "catalogNotes" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "timezone" TEXT DEFAULT 'Asia/Kolkata';
ALTER TABLE "Tenant" ADD COLUMN "enabledWorkflows" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "CommerceIntegration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    "config" JSONB,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommerceIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommerceConversation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "channel" TEXT NOT NULL DEFAULT 'whatsapp',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommerceConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommerceApproval" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommerceApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommerceIntegration_tenantId_type_key" ON "CommerceIntegration"("tenantId", "type");
CREATE INDEX "CommerceIntegration_status_idx" ON "CommerceIntegration"("status");
CREATE INDEX "CommerceConversation_tenantId_createdAt_idx" ON "CommerceConversation"("tenantId", "createdAt");
CREATE INDEX "CommerceApproval_tenantId_status_idx" ON "CommerceApproval"("tenantId", "status");

-- AddForeignKey
ALTER TABLE "CommerceIntegration"
ADD CONSTRAINT "CommerceIntegration_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommerceConversation"
ADD CONSTRAINT "CommerceConversation_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommerceApproval"
ADD CONSTRAINT "CommerceApproval_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
