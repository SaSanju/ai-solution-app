import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  buildMetrics,
  parseIntegrationInput,
  parseWorkspaceInput,
  serializeCommerceIntegration,
  serializeWorkspace,
} from "@/lib/commercepilot";

function serializeWhatsApp(integration) {
  if (!integration) return null;
  return {
    status: integration.status,
    displayPhoneNumber: integration.displayPhoneNumber,
    verifiedName: integration.verifiedName,
    connectedAt: integration.connectedAt,
  };
}

function conversationPayload(item) {
  return {
    id: item.id,
    customerName: item.customerName,
    customerPhone: item.customerPhone,
    message: item.message,
    status: item.status,
    channel: item.channel,
    createdAt: item.createdAt,
  };
}

function approvalPayload(item) {
  return {
    id: item.id,
    title: item.title,
    detail: item.detail,
    status: item.status,
    createdAt: item.createdAt,
  };
}

async function loadTenant(userId) {
  return prisma.tenant.findUnique({
    where: { ownerUserId: userId },
    include: {
      whatsappIntegration: true,
      commerceIntegrations: true,
      conversations: { orderBy: { createdAt: "desc" }, take: 20 },
      approvals: { orderBy: { createdAt: "desc" }, take: 20 },
      owner: { include: { subscription: true } },
    },
  });
}

function dashboardResponse(tenant) {
  const plan = tenant?.owner?.subscription?.status === "pro" ? "pro" : "starter";
  const orders = tenant?.commerceIntegrations?.find((item) => item.type === "orders");
  const vendor = tenant?.commerceIntegrations?.find((item) => item.type === "vendor");
  const conversations = tenant?.conversations || [];
  const approvals = tenant?.approvals || [];
  const conversationCount = conversations.length;
  const billingLimit = plan === "pro" ? null : 1000;

  return {
    authorized: true,
    workspace: serializeWorkspace(tenant, { plan }),
    integrations: {
      whatsapp: serializeWhatsApp(tenant?.whatsappIntegration),
      orders: serializeCommerceIntegration(orders),
      vendor: serializeCommerceIntegration(vendor),
    },
    metrics: buildMetrics(conversations, approvals),
    conversations: conversations.map(conversationPayload),
    approvals: approvals.map(approvalPayload),
    billing: {
      used: conversationCount,
      limit: billingLimit,
    },
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ authorized: false, error: "Sign in to open your business console." }, { status: 401 });
    }

    const tenant = await loadTenant(session.user.id);
    return NextResponse.json(dashboardResponse(tenant), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load the business console." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to create a business console." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = parseWorkspaceInput(body);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const ordersInput = body.orders?.provider ? parseIntegrationInput({ type: "orders", ...body.orders }) : null;
    if (ordersInput?.error) {
      return NextResponse.json({ error: ordersInput.error }, { status: 400 });
    }
    const vendorInput = body.vendor?.provider ? parseIntegrationInput({ type: "vendor", ...body.vendor }) : null;
    if (vendorInput?.error) {
      return NextResponse.json({ error: vendorInput.error }, { status: 400 });
    }

    await prisma.$transaction(async (transaction) => {
      const tenant = await transaction.tenant.upsert({
        where: { ownerUserId: session.user.id },
        create: { ownerUserId: session.user.id, ...parsed.data },
        update: parsed.data,
      });

      if (ordersInput?.data) {
        await transaction.commerceIntegration.upsert({
          where: { tenantId_type: { tenantId: tenant.id, type: "orders" } },
          create: {
            tenantId: tenant.id,
            type: "orders",
            provider: ordersInput.data.provider,
            config: ordersInput.data.config,
          },
          update: {
            provider: ordersInput.data.provider,
            config: ordersInput.data.config,
            status: "CONNECTED",
            connectedAt: new Date(),
          },
        });
      }

      if (vendorInput?.data) {
        await transaction.commerceIntegration.upsert({
          where: { tenantId_type: { tenantId: tenant.id, type: "vendor" } },
          create: {
            tenantId: tenant.id,
            type: "vendor",
            provider: vendorInput.data.provider,
            config: vendorInput.data.config,
          },
          update: {
            provider: vendorInput.data.provider,
            config: vendorInput.data.config,
            status: "CONNECTED",
            connectedAt: new Date(),
          },
        });
      }
    });

    const tenant = await loadTenant(session.user.id);
    return NextResponse.json(dashboardResponse(tenant), { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not create the business console." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to update your business console." }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { ownerUserId: session.user.id } });
    if (!tenant) {
      return NextResponse.json({ error: "Create a business console first." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = parseIntegrationInput(body);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await prisma.commerceIntegration.upsert({
      where: { tenantId_type: { tenantId: tenant.id, type: parsed.data.type } },
      create: {
        tenantId: tenant.id,
        type: parsed.data.type,
        provider: parsed.data.provider,
        config: parsed.data.config,
      },
      update: {
        provider: parsed.data.provider,
        config: parsed.data.config,
        status: "CONNECTED",
        connectedAt: new Date(),
      },
    });

    const updated = await loadTenant(session.user.id);
    return NextResponse.json(dashboardResponse(updated), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not update the connection." }, { status: 500 });
  }
}
