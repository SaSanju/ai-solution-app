CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WhatsAppIntegration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "whatsappBusinessAccountId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "metaBusinessId" TEXT,
    "displayPhoneNumber" TEXT NOT NULL,
    "verifiedName" TEXT,
    "encryptedAccessToken" TEXT NOT NULL,
    "encryptionIv" TEXT NOT NULL,
    "encryptionTag" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppIntegration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tenant_ownerUserId_key" ON "Tenant"("ownerUserId");
CREATE UNIQUE INDEX "WhatsAppIntegration_tenantId_key" ON "WhatsAppIntegration"("tenantId");
CREATE UNIQUE INDEX "WhatsAppIntegration_whatsappBusinessAccountId_key" ON "WhatsAppIntegration"("whatsappBusinessAccountId");
CREATE UNIQUE INDEX "WhatsAppIntegration_phoneNumberId_key" ON "WhatsAppIntegration"("phoneNumberId");
CREATE INDEX "WhatsAppIntegration_status_idx" ON "WhatsAppIntegration"("status");

ALTER TABLE "Tenant"
ADD CONSTRAINT "Tenant_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WhatsAppIntegration"
ADD CONSTRAINT "WhatsAppIntegration_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;