export const INDUSTRIES = [
  { id: "fashion", label: "Fashion & apparel" },
  { id: "grocery", label: "Grocery & food" },
  { id: "electronics", label: "Electronics" },
  { id: "beauty", label: "Beauty & personal care" },
  { id: "home", label: "Home & living" },
  { id: "health", label: "Health & wellness" },
  { id: "sports", label: "Sports & outdoors" },
  { id: "other", label: "Other commerce" },
];

export const WORKFLOW_OPTIONS = [
  { id: "track", name: "Track an order", detail: "Order lookup → verified status → reply", requires: ["orders"] },
  { id: "place", name: "Place an order", detail: "Catalog → customer confirmation → order", requires: ["orders", "vendor"] },
  { id: "cancel", name: "Request cancellation", detail: "Policy check → approval → status update", requires: ["orders", "vendor"] },
];

export const ORDER_PROVIDERS = [
  { id: "shopify", label: "Shopify" },
  { id: "woocommerce", label: "WooCommerce" },
  { id: "mcp", label: "MCP / custom commerce API" },
];

export const VENDOR_PROVIDERS = [
  { id: "whatsapp", label: "Vendor WhatsApp" },
  { id: "email", label: "Vendor email" },
  { id: "api", label: "Vendor API" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function industryLabel(id) {
  return INDUSTRIES.find((item) => item.id === id)?.label || null;
}

export function sanitizeHttpUrl(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function parseWorkspaceInput(body = {}) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const industry = typeof body.industry === "string" ? body.industry.trim() : "";
  const websiteRaw = typeof body.website === "string" ? body.website.trim() : "";
  const supportEmail = typeof body.supportEmail === "string" ? body.supportEmail.trim() : "";
  const catalogNotes = typeof body.catalogNotes === "string" ? body.catalogNotes.trim() : "";
  const timezone = typeof body.timezone === "string" ? body.timezone.trim() : "Asia/Kolkata";
  const workflowIds = Array.isArray(body.enabledWorkflows)
    ? body.enabledWorkflows.filter((id) => WORKFLOW_OPTIONS.some((item) => item.id === id))
    : [];

  if (!name || name.length > 120) {
    return { error: "Enter a business name up to 120 characters." };
  }
  if (industry && !INDUSTRIES.some((item) => item.id === industry)) {
    return { error: "Choose a valid industry." };
  }
  const website = websiteRaw ? sanitizeHttpUrl(websiteRaw) : null;
  if (websiteRaw && !website) {
    return { error: "Enter a valid website URL starting with https://." };
  }
  if (supportEmail && (supportEmail.length > 160 || !EMAIL_PATTERN.test(supportEmail))) {
    return { error: "Enter a valid support email, or leave it blank." };
  }
  if (catalogNotes.length > 2000) {
    return { error: "Catalog notes must be 2000 characters or fewer." };
  }
  if (timezone.length > 80) {
    return { error: "Enter a valid timezone." };
  }

  return {
    data: {
      name,
      industry: industry || null,
      website,
      supportEmail: supportEmail || null,
      catalogNotes: catalogNotes || null,
      timezone: timezone || "Asia/Kolkata",
      enabledWorkflows: workflowIds,
    },
  };
}

export function parseIntegrationInput(body = {}) {
  const type = body.type === "orders" || body.type === "vendor" ? body.type : null;
  if (!type) return { error: "Choose an order system or vendor connection." };

  if (type === "orders") {
    const provider = ORDER_PROVIDERS.some((item) => item.id === body.provider) ? body.provider : "";
    const storeUrl = sanitizeHttpUrl(body.storeUrl);
    if (!provider) return { error: "Choose an order system provider." };
    if (!storeUrl) return { error: "Enter a valid store or API URL starting with https://." };
    return { data: { type, provider, config: { storeUrl } } };
  }

  const provider = VENDOR_PROVIDERS.some((item) => item.id === body.provider) ? body.provider : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  if (!provider) return { error: "Choose a vendor messaging method." };
  if (!contact || contact.length > 160) return { error: "Enter a vendor contact up to 160 characters." };
  return { data: { type, provider, config: { contact } } };
}

export function serializeWorkspace(tenant, extras = {}) {
  if (!tenant) return null;
  return {
    id: tenant.id,
    name: tenant.name,
    industry: tenant.industry,
    industryLabel: industryLabel(tenant.industry),
    website: tenant.website,
    supportEmail: tenant.supportEmail,
    catalogNotes: tenant.catalogNotes,
    timezone: tenant.timezone,
    enabledWorkflows: tenant.enabledWorkflows || [],
    createdAt: tenant.createdAt,
    plan: extras.plan || "starter",
  };
}

export function serializeCommerceIntegration(integration) {
  if (!integration) return null;
  const config = integration.config && typeof integration.config === "object" ? integration.config : {};
  return {
    type: integration.type,
    provider: integration.provider,
    status: integration.status,
    storeUrl: config.storeUrl || null,
    contact: config.contact || null,
    connectedAt: integration.connectedAt,
  };
}

export function buildMetrics(conversations = [], approvals = []) {
  const total = conversations.length;
  const resolved = conversations.filter((item) => item.status === "RESOLVED").length;
  const openApprovals = approvals.filter((item) => item.status === "PENDING").length;
  return {
    conversations: total,
    autoResolvedPercent: total ? Math.round((resolved / total) * 100) : 0,
    autoResolvedCount: resolved,
    openApprovals,
    avgResponse: total ? "—" : "—",
  };
}
