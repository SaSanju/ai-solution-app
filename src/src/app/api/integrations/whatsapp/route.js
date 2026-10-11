import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { encryptWhatsAppToken } from "@/lib/whatsapp-credentials";

const DEFAULT_GRAPH_VERSION = "v23.0";

function getMetaConfiguration() {
  const appId = process.env.META_APP_ID || "";
  const configId = process.env.META_WHATSAPP_CONFIG_ID || "";
  const graphVersion = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_VERSION;
  const encodedEncryptionKey = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY || "";
  const decodedEncryptionKey = Buffer.from(encodedEncryptionKey, "base64");
  const encryptionKeyValid = /^[A-Za-z0-9+/]+={0,2}$/.test(encodedEncryptionKey)
    && decodedEncryptionKey.length === 32
    && decodedEncryptionKey.toString("base64") === encodedEncryptionKey;
  const required = [
    ["META_APP_ID", appId],
    ["META_APP_SECRET", process.env.META_APP_SECRET],
    ["META_WHATSAPP_CONFIG_ID", configId],
  ];
  const missing = required.filter(([, value]) => !value).map(([name]) => name);
  if (!encryptionKeyValid) missing.push("WHATSAPP_TOKEN_ENCRYPTION_KEY (base64-encoded 32-byte key)");
  const graphVersionValid = /^v\d+\.\d+$/.test(graphVersion);

  if (!graphVersionValid) missing.push("META_GRAPH_API_VERSION (for example v23.0)");

  return {
    appId: appId || null,
    configId: configId || null,
    graphVersion,
    configured: missing.length === 0,
    missing,
  };
}

function serializeIntegration(integration) {
  if (!integration) return null;

  return {
    status: integration.status,
    displayPhoneNumber: integration.displayPhoneNumber,
    verifiedName: integration.verifiedName,
    connectedAt: integration.connectedAt,
  };
}

async function metaRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error?.message || "Meta could not complete the WhatsApp setup request.");
  }

  return payload;
}

function graphUrl(version, path, params) {
  const url = new URL(`https://graph.facebook.com/${version}/${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  }
  return url;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to manage a business WhatsApp connection." }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { ownerUserId: session.user.id },
      include: { whatsappIntegration: true },
    });

    return NextResponse.json(
      {
        workspace: tenant ? { id: tenant.id, name: tenant.name } : null,
        integration: serializeIntegration(tenant?.whatsappIntegration),
        meta: getMetaConfiguration(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Could not load the WhatsApp connection." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to connect a business WhatsApp account." }, { status: 401 });
    }

    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: "Request origin was not authorized." }, { status: 403 });
    }

    const config = getMetaConfiguration();
    if (!config.configured) {
      return NextResponse.json(
        { error: "WhatsApp onboarding is not configured on this server.", missing: config.missing },
        { status: 503 },
      );
    }

    const body = await request.json();
    const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const wabaId = typeof body.wabaId === "string" ? body.wabaId : "";
    const phoneNumberId = typeof body.phoneNumberId === "string" ? body.phoneNumberId : "";
    const businessId = typeof body.businessId === "string" ? body.businessId : null;

    if (!businessName || businessName.length > 120) {
      return NextResponse.json({ error: "Enter a business name up to 120 characters." }, { status: 400 });
    }
    if (!code || code.length > 4096 || !/^\d{5,30}$/.test(wabaId) || !/^\d{5,30}$/.test(phoneNumberId)) {
      return NextResponse.json({ error: "Meta did not return valid WhatsApp account details. Please retry signup." }, { status: 400 });
    }
    if (businessId && !/^\d{5,30}$/.test(businessId)) {
      return NextResponse.json({ error: "Meta returned an invalid business account ID." }, { status: 400 });
    }

    const graphBase = `https://graph.facebook.com/${config.graphVersion}`;
    const tokenData = await metaRequest(graphUrl(config.graphVersion, "oauth/access_token", {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      code,
    }));
    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Meta did not return an access token. Please retry signup." }, { status: 502 });
    }

    const authHeaders = { Authorization: `Bearer ${tokenData.access_token}` };
    const phoneList = await metaRequest(
      graphUrl(config.graphVersion, `${wabaId}/phone_numbers`, { fields: "id", limit: "100" }),
      { headers: authHeaders },
    );
    const phoneBelongsToAccount = Array.isArray(phoneList.data)
      && phoneList.data.some((phone) => phone.id === phoneNumberId);
    if (!phoneBelongsToAccount) {
      return NextResponse.json({ error: "The selected phone number does not belong to the selected business account." }, { status: 422 });
    }

    const phoneData = await metaRequest(
      graphUrl(config.graphVersion, phoneNumberId, { fields: "id,display_phone_number,verified_name" }),
      { headers: authHeaders },
    );
    if (!phoneData.display_phone_number) {
      return NextResponse.json({ error: "Meta did not return a verified phone number." }, { status: 422 });
    }

    const existingAccount = await prisma.whatsAppIntegration.findFirst({
      where: {
        OR: [{ whatsappBusinessAccountId: wabaId }, { phoneNumberId }],
      },
      include: { tenant: { select: { ownerUserId: true } } },
    });
    if (existingAccount && existingAccount.tenant.ownerUserId !== session.user.id) {
      return NextResponse.json({ error: "This WhatsApp account is already connected to another workspace." }, { status: 409 });
    }

    const ownerTenant = await prisma.tenant.findUnique({
      where: { ownerUserId: session.user.id },
      include: { whatsappIntegration: true },
    });
    const currentIntegration = ownerTenant?.whatsappIntegration;
    if (currentIntegration && (
      currentIntegration.whatsappBusinessAccountId !== wabaId
      || currentIntegration.phoneNumberId !== phoneNumberId
    )) {
      return NextResponse.json({ error: "This workspace already has a different WhatsApp account connected." }, { status: 409 });
    }

    await metaRequest(graphUrl(config.graphVersion, `${wabaId}/subscribed_apps`), {
      method: "POST",
      headers: authHeaders,
    });

    const encryptedCredentials = encryptWhatsAppToken(tokenData.access_token);
    const tokenExpiresAt = Number.isFinite(Number(tokenData.expires_in))
      ? new Date(Date.now() + Number(tokenData.expires_in) * 1000)
      : null;

    const integration = await prisma.$transaction(async (transaction) => {
      const tenant = await transaction.tenant.upsert({
        where: { ownerUserId: session.user.id },
        create: { ownerUserId: session.user.id, name: businessName },
        update: { name: businessName },
      });

      return transaction.whatsAppIntegration.upsert({
        where: { tenantId: tenant.id },
        create: {
          tenantId: tenant.id,
          whatsappBusinessAccountId: wabaId,
          phoneNumberId,
          metaBusinessId: businessId,
          displayPhoneNumber: phoneData.display_phone_number,
          verifiedName: phoneData.verified_name || null,
          ...encryptedCredentials,
          tokenExpiresAt,
        },
        update: {
          metaBusinessId: businessId,
          displayPhoneNumber: phoneData.display_phone_number,
          verifiedName: phoneData.verified_name || null,
          ...encryptedCredentials,
          tokenExpiresAt,
          status: "CONNECTED",
          connectedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      workspace: { name: businessName },
      integration: serializeIntegration(integration),
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "This WhatsApp account is already connected to another workspace." }, { status: 409 });
    }
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return NextResponse.json({ error: "Meta did not respond in time. Please retry the connection." }, { status: 504 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Could not connect WhatsApp.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}