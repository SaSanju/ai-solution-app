"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiArrowUpRight,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiCreditCard,
  FiGrid,
  FiLoader,
  FiMessageSquare,
  FiPackage,
  FiPlus,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiX,
  FiZap,
} from "react-icons/fi";
import {
  INDUSTRIES,
  ORDER_PROVIDERS,
  VENDOR_PROVIDERS,
  WORKFLOW_OPTIONS,
} from "@/lib/commercepilot";

const AUTH_HREF = "/auth?callbackUrl=/commercepilot";

const navigation = [
  { label: "Overview", href: "#overview", icon: FiGrid },
  { label: "Integrations", href: "#integrations", icon: FiZap },
  { label: "Workflows", href: "#workflows", icon: FiActivity },
  { label: "Conversations", href: "#conversations", icon: FiMessageSquare },
  { label: "Approvals", href: "#approvals", icon: FiShield },
  { label: "Billing", href: "#billing", icon: FiCreditCard },
];

const emptyConsole = {
  loading: true,
  authorized: true,
  workspace: null,
  integrations: { whatsapp: null, orders: null, vendor: null },
  metrics: { conversations: 0, autoResolvedPercent: 0, autoResolvedCount: 0, openApprovals: 0, avgResponse: "—" },
  conversations: [],
  approvals: [],
  billing: { used: 0, limit: 1000 },
  meta: null,
};

function loadMetaSdk(appId, graphVersion) {
  return new Promise((resolve, reject) => {
    let initialized = false;
    const initialize = () => {
      if (initialized || !window.FB) return;
      initialized = true;
      window.FB.init({ appId, cookie: true, xfbml: false, version: graphVersion });
      resolve();
    };

    if (window.FB) {
      initialize();
      return;
    }

    window.fbAsyncInit = initialize;
    let script = document.getElementById("facebook-jssdk");
    if (!script) {
      script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.onerror = () => reject(new Error("Could not load Meta signup. Check your network and try again."));
      document.head.appendChild(script);
    }
    script.addEventListener("load", initialize, { once: true });
  });
}

function beginMetaSignup(configId) {
  return new Promise((resolve, reject) => {
    let code = "";
    let account = null;
    let finished = false;

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timeout);
    };
    const fail = (message) => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(new Error(message));
    };
    const complete = () => {
      if (finished || !code || !account) return;
      finished = true;
      cleanup();
      resolve({ code, ...account });
    };
    const onMessage = (event) => {
      if (!new Set(["https://www.facebook.com", "https://web.facebook.com"]).has(event.origin)) return;

      let message = event.data;
      if (typeof message === "string") {
        try {
          message = JSON.parse(message);
        } catch {
          return;
        }
      }
      if (message?.type !== "WA_EMBEDDED_SIGNUP") return;
      if (message.event === "CANCEL" || message.event === "ERROR") {
        fail("Meta signup was cancelled or could not finish. Please try again.");
        return;
      }
      if (message.event === "FINISH") {
        const data = message.data || {};
        account = {
          wabaId: String(data.waba_id || ""),
          phoneNumberId: String(data.phone_number_id || ""),
          businessId: data.business_id ? String(data.business_id) : null,
        };
        complete();
      }
    };
    const timeout = window.setTimeout(() => fail("Meta signup timed out. Please start again."), 120000);

    window.addEventListener("message", onMessage);
    window.FB.login((response) => {
      const authCode = response?.authResponse?.code;
      if (!authCode) {
        fail("Meta did not authorize this signup. Please try again.");
        return;
      }
      code = authCode;
      complete();
    }, {
      config_id: configId,
      response_type: "code",
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: "whatsapp_business_app_onboarding",
        sessionInfoVersion: 3,
      },
    });
  });
}

function relativeTime(value) {
  const delta = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(delta / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(value).toLocaleDateString();
}

function conversationStatus(status) {
  if (status === "RESOLVED") return "Resolved";
  if (status === "NEEDS_REVIEW") return "Needs review";
  return "Open";
}

function initials(name) {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const emptyOnboarding = {
  name: "",
  industry: "fashion",
  website: "",
  supportEmail: "",
  catalogNotes: "",
  timezone: "Asia/Kolkata",
  enabledWorkflows: ["track"],
  orderProvider: "",
  storeUrl: "",
  vendorProvider: "",
  vendorContact: "",
};

export default function CommercePilotConsole() {
  const [consoleState, setConsoleState] = useState(emptyConsole);
  const [notice, setNotice] = useState("");
  const [whatsappMeta, setWhatsappMeta] = useState({ loading: true, authorized: true, meta: null, sdkError: null, error: null });
  const [metaSdkReady, setMetaSdkReady] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [signup, setSignup] = useState(null);
  const [wizardBusy, setWizardBusy] = useState(false);
  const [wizardError, setWizardError] = useState("");
  const [wizardComplete, setWizardComplete] = useState(false);
  const [onboarding, setOnboarding] = useState(emptyOnboarding);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");
  const [connector, setConnector] = useState(null);
  const [connectorBusy, setConnectorBusy] = useState(false);
  const [connectorError, setConnectorError] = useState("");
  const [connectorForm, setConnectorForm] = useState({ provider: "", storeUrl: "", contact: "" });

  const workspace = consoleState.workspace;
  const integrations = consoleState.integrations;
  const connected = {
    whatsapp: Boolean(integrations.whatsapp),
    orders: Boolean(integrations.orders),
    vendor: Boolean(integrations.vendor),
  };
  const connectedCount = Object.values(connected).filter(Boolean).length;
  const setupProgress = Math.round((connectedCount / 3) * 100);
  const displayWorkspaceName = workspace?.name || "Your business";
  const planLabel = workspace?.plan === "pro" ? "Pro workspace" : "Starter workspace";

  const integrationCards = useMemo(() => ([
    {
      id: "whatsapp",
      name: "Customer WhatsApp",
      detail: "Connect your Meta business number",
      icon: FiMessageSquare,
      color: "bg-green-100 text-green-800",
      connected: connected.whatsapp,
      summary: integrations.whatsapp?.displayPhoneNumber || integrations.whatsapp?.verifiedName || "Authorize your Meta business number",
    },
    {
      id: "orders",
      name: "Order system",
      detail: "Shopify, WooCommerce, MCP, or your commerce API",
      icon: FiPackage,
      color: "bg-blue-100 text-blue-800",
      connected: connected.orders,
      summary: integrations.orders?.storeUrl || (connected.orders ? "Ready" : "Add your store or API URL"),
    },
    {
      id: "vendor",
      name: "Vendor messaging",
      detail: "Tell us how to reach your vendors",
      icon: FiShoppingBag,
      color: "bg-orange-100 text-orange-800",
      connected: connected.vendor,
      summary: integrations.vendor?.contact || (connected.vendor ? "Ready" : "Add a vendor contact"),
    },
  ]), [connected.orders, connected.vendor, connected.whatsapp, integrations]);

  async function applyDashboard(data, authorized = true) {
    setConsoleState({
      loading: false,
      authorized,
      workspace: data.workspace || null,
      integrations: data.integrations || emptyConsole.integrations,
      metrics: data.metrics || emptyConsole.metrics,
      conversations: data.conversations || [],
      approvals: data.approvals || [],
      billing: data.billing || emptyConsole.billing,
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadConsole() {
      try {
        const [workspaceResponse, whatsappResponse] = await Promise.all([
          fetch("/api/commercepilot/workspace", { cache: "no-store" }),
          fetch("/api/integrations/whatsapp", { cache: "no-store" }),
        ]);
        const workspaceData = await workspaceResponse.json();
        const whatsappData = await whatsappResponse.json();
        if (cancelled) return;

        const authorized = workspaceResponse.status !== 401;
        await applyDashboard(workspaceData, authorized);
        if (workspaceData.workspace?.name) {
          setOnboarding((current) => ({ ...current, name: workspaceData.workspace.name }));
        }

        setWhatsappMeta({
          loading: false,
          authorized: whatsappResponse.status !== 401,
          meta: whatsappData.meta || null,
          sdkError: null,
          error: whatsappData.error || null,
        });

        if (whatsappData.meta?.configured && whatsappData.meta.appId) {
          try {
            await loadMetaSdk(whatsappData.meta.appId, whatsappData.meta.graphVersion);
            if (!cancelled) setMetaSdkReady(true);
          } catch (error) {
            if (!cancelled) setWhatsappMeta((current) => ({ ...current, sdkError: error.message }));
          }
        }
      } catch {
        if (!cancelled) {
          setConsoleState((current) => ({ ...current, loading: false, error: "Could not load your business console." }));
          setWhatsappMeta((current) => ({ ...current, loading: false, error: "Could not load WhatsApp setup." }));
        }
      }
    }

    loadConsole();
    return () => { cancelled = true; };
  }, []);

  function openWhatsAppWizard() {
    setWizardError("");
    setWizardComplete(false);
    setWizardStep(1);
    setSignup(null);
    setWizardOpen(true);
  }

  function openConnector(type) {
    if (type === "whatsapp") {
      openWhatsAppWizard();
      return;
    }
    const existing = integrations[type];
    setConnector(type);
    setConnectorError("");
    setConnectorForm({
      provider: existing?.provider || (type === "orders" ? "shopify" : "whatsapp"),
      storeUrl: existing?.storeUrl || "",
      contact: existing?.contact || "",
    });
  }

  async function startMetaSignup() {
    setWizardBusy(true);
    setWizardError("");
    try {
      const result = await beginMetaSignup(whatsappMeta.meta.configId);
      if (!/^\d{5,30}$/.test(result.wabaId) || !/^\d{5,30}$/.test(result.phoneNumberId)) {
        throw new Error("Meta did not return the WhatsApp account details. Please restart signup.");
      }
      setSignup(result);
      setWizardStep(3);
    } catch (error) {
      setWizardError(error.message || "Meta signup did not complete.");
    } finally {
      setWizardBusy(false);
    }
  }

  async function saveWhatsAppConnection() {
    if (!signup) return;
    setWizardBusy(true);
    setWizardError("");

    try {
      const response = await fetch("/api/integrations/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: workspace?.name || onboarding.name, ...signup }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save the WhatsApp connection.");

      const dashboard = await fetch("/api/commercepilot/workspace", { cache: "no-store" });
      const dashboardData = await dashboard.json();
      await applyDashboard(dashboardData, dashboard.status !== 401);
      setWizardComplete(true);
      setNotice(`Customer WhatsApp connected${data.integration?.displayPhoneNumber ? `: ${data.integration.displayPhoneNumber}` : ""}.`);
    } catch (error) {
      setWizardError(error.message || "Could not save the WhatsApp connection.");
    } finally {
      setWizardBusy(false);
    }
  }

  async function createConsole(event) {
    event.preventDefault();
    setOnboardingBusy(true);
    setOnboardingError("");
    try {
      const response = await fetch("/api/commercepilot/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: onboarding.name,
          industry: onboarding.industry,
          website: onboarding.website,
          supportEmail: onboarding.supportEmail,
          catalogNotes: onboarding.catalogNotes,
          timezone: onboarding.timezone,
          enabledWorkflows: onboarding.enabledWorkflows,
          orders: onboarding.orderProvider ? { provider: onboarding.orderProvider, storeUrl: onboarding.storeUrl } : undefined,
          vendor: onboarding.vendorProvider ? { provider: onboarding.vendorProvider, contact: onboarding.vendorContact } : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create the business console.");
      await applyDashboard(data, true);
      setNotice(`${data.workspace.name} console is ready. Connect channels to populate live support activity.`);
    } catch (error) {
      setOnboardingError(error.message || "Could not create the business console.");
    } finally {
      setOnboardingBusy(false);
    }
  }

  async function saveConnector(event) {
    event.preventDefault();
    setConnectorBusy(true);
    setConnectorError("");
    try {
      const payload = connector === "orders"
        ? { type: "orders", provider: connectorForm.provider, storeUrl: connectorForm.storeUrl }
        : { type: "vendor", provider: connectorForm.provider, contact: connectorForm.contact };
      const response = await fetch("/api/commercepilot/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save this connection.");
      await applyDashboard(data, true);
      setConnector(null);
      setNotice(connector === "orders" ? "Order system saved to your console." : "Vendor messaging saved to your console.");
    } catch (error) {
      setConnectorError(error.message || "Could not save this connection.");
    } finally {
      setConnectorBusy(false);
    }
  }

  function toggleWorkflow(id) {
    setOnboarding((current) => {
      const enabled = current.enabledWorkflows.includes(id)
        ? current.enabledWorkflows.filter((item) => item !== id)
        : [...current.enabledWorkflows, id];
      return { ...current, enabledWorkflows: enabled };
    });
  }

  if (consoleState.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f3] text-[#1e2b27]">
        <p className="inline-flex items-center gap-2 text-sm text-[#65716b]"><FiLoader className="animate-spin" /> Loading business console</p>
      </div>
    );
  }

  if (!consoleState.authorized) {
    return (
      <div className="min-h-screen bg-[#f4f6f3] px-4 py-16 text-[#1e2b27]">
        <div className="mx-auto max-w-xl rounded-lg border border-[#e2e8e2] bg-white p-8">
          <p className="text-xs font-bold uppercase text-[#537166]">CommercePilot</p>
          <h1 className="mt-2 text-2xl font-bold">Sign in to create your business console</h1>
          <p className="mt-3 text-sm leading-6 text-[#65716b]">
            Each onboarded account gets its own support workspace. After you sign in, we will collect your business details and populate the dashboard from that console.
          </p>
          <Link href={AUTH_HREF} className="mt-6 inline-flex rounded-md bg-[#183f36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245749]">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-[#f4f6f3] px-4 py-10 text-[#1e2b27]">
        <form onSubmit={createConsole} className="mx-auto max-w-3xl rounded-lg border border-[#e2e8e2] bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase text-[#537166]">Create business console</p>
          <h1 className="mt-2 text-2xl font-bold">Set up CommercePilot for your store</h1>
          <p className="mt-2 text-sm leading-6 text-[#65716b]">
            Tell us how your business operates. We will create a dedicated console and fill the dashboard with your workspace, connections, and workflows.
          </p>

          {onboardingError && (
            <p role="alert" className="mt-5 rounded-md border border-[#f0c6bd] bg-[#fff1ee] px-3 py-2.5 text-sm text-[#8d3c2d]">{onboardingError}</p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold sm:col-span-2">
              Business name
              <input required maxLength={120} value={onboarding.name} onChange={(event) => setOnboarding((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2e7657] focus:ring-2 focus:ring-[#2e7657]/15" />
            </label>
            <label className="block text-sm font-semibold">
              Industry
              <select value={onboarding.industry} onChange={(event) => setOnboarding((current) => ({ ...current, industry: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2e7657]">
                {INDUSTRIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Timezone
              <input maxLength={80} value={onboarding.timezone} onChange={(event) => setOnboarding((current) => ({ ...current, timezone: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2e7657]" />
            </label>
            <label className="block text-sm font-semibold">
              Website
              <input type="url" placeholder="https://" value={onboarding.website} onChange={(event) => setOnboarding((current) => ({ ...current, website: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2e7657]" />
            </label>
            <label className="block text-sm font-semibold">
              Support email
              <input type="email" value={onboarding.supportEmail} onChange={(event) => setOnboarding((current) => ({ ...current, supportEmail: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2e7657]" />
            </label>
            <label className="block text-sm font-semibold sm:col-span-2">
              What you sell
              <textarea rows={3} maxLength={2000} value={onboarding.catalogNotes} onChange={(event) => setOnboarding((current) => ({ ...current, catalogNotes: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#2e7657]" placeholder="Catalog, policies, or the products customers usually ask about" />
            </label>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Workflows to enable</legend>
            <div className="mt-3 space-y-2">
              {WORKFLOW_OPTIONS.map((workflow) => (
                <label key={workflow.id} className="flex items-start gap-3 rounded-md border border-[#e2e8e2] px-3 py-3 text-sm">
                  <input type="checkbox" checked={onboarding.enabledWorkflows.includes(workflow.id)} onChange={() => toggleWorkflow(workflow.id)} className="mt-1" />
                  <span>
                    <span className="font-semibold">{workflow.name}</span>
                    <span className="mt-0.5 block text-xs text-[#748079]">{workflow.detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Order system
              <select value={onboarding.orderProvider} onChange={(event) => setOnboarding((current) => ({ ...current, orderProvider: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal">
                <option value="">Set up later</option>
                {ORDER_PROVIDERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Store or API URL
              <input type="url" disabled={!onboarding.orderProvider} value={onboarding.storeUrl} onChange={(event) => setOnboarding((current) => ({ ...current, storeUrl: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal disabled:bg-[#f4f6f3]" placeholder="https://your-store.com" />
            </label>
            <label className="block text-sm font-semibold">
              Vendor messaging
              <select value={onboarding.vendorProvider} onChange={(event) => setOnboarding((current) => ({ ...current, vendorProvider: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal">
                <option value="">Set up later</option>
                {VENDOR_PROVIDERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Vendor contact
              <input disabled={!onboarding.vendorProvider} value={onboarding.vendorContact} onChange={(event) => setOnboarding((current) => ({ ...current, vendorContact: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal disabled:bg-[#f4f6f3]" placeholder="Phone, email, or API host" />
            </label>
          </div>

          <div className="mt-7 flex justify-end">
            <button type="submit" disabled={onboardingBusy || !onboarding.name.trim()} className="inline-flex items-center gap-2 rounded-md bg-[#183f36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245749] disabled:bg-[#9ba9a1]">
              {onboardingBusy && <FiLoader className="animate-spin" size={15} />}
              Create business console
            </button>
          </div>
        </form>
      </div>
    );
  }

  const metrics = [
    { label: "Conversations", value: String(consoleState.metrics.conversations), note: consoleState.metrics.conversations ? `${consoleState.metrics.autoResolvedCount} resolved` : "Waiting for customer messages", icon: FiMessageSquare },
    { label: "Auto-resolved", value: `${consoleState.metrics.autoResolvedPercent}%`, note: consoleState.metrics.conversations ? "Of conversations in this console" : "No conversations yet", icon: FiCheck },
    { label: "Open approvals", value: String(consoleState.metrics.openApprovals), note: consoleState.metrics.openApprovals ? "Waiting for your review" : "Nothing pending", icon: FiShield },
    { label: "Avg. response", value: consoleState.metrics.avgResponse, note: workspace.timezone || "Workspace timezone", icon: FiClock },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#1e2b27] md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="border-b border-[#e2e8e2] bg-white md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:px-5 md:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#183f36] text-white">
              <FiZap size={19} />
            </span>
            <div>
              <p className="text-sm font-bold">CommercePilot</p>
              <p className="text-xs text-[#76827c]">Business console</p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-[#e5eae5] px-2.5 py-2 md:hidden">
            <div className="min-w-0">
              <p className="max-w-[112px] truncate text-xs font-semibold">{displayWorkspaceName}</p>
              <p className="text-[11px] text-[#76827c]">{planLabel}</p>
            </div>
            <FiChevronRight className="shrink-0 text-[#76827c]" size={15} />
          </div>
        </div>

        <div className="mx-4 mb-4 hidden items-center justify-between rounded-md border border-[#e5eae5] px-3 py-2.5 md:flex">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{displayWorkspaceName}</p>
            <p className="mt-0.5 text-xs text-[#76827c]">{workspace.industryLabel || planLabel}</p>
          </div>
          <FiChevronRight className="shrink-0 text-[#76827c]" size={16} />
        </div>

        <nav aria-label="Console navigation" className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1">
          {navigation.map(({ label, href, icon: Icon }, index) => (
            <a
              key={label}
              href={href}
              className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
                index === 0 ? "bg-[#eaf2ee] font-semibold text-[#183f36]" : "text-[#65716b] hover:bg-[#f4f6f3]"
              }`}
            >
              <Icon size={17} />
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden border-t border-[#e8ece8] px-4 py-4 md:mt-6 md:block">
          <a href="#setup" className="flex items-center gap-3 px-2 py-2 text-sm text-[#65716b] hover:text-[#183f36]">
            <FiSettings size={17} /> Workspace settings
          </a>
          <Link href="/products" className="mt-4 flex items-center gap-2 px-2 text-xs text-[#76827c] hover:text-[#183f36]">
            <FiArrowUpRight size={14} /> Back to products
          </Link>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-7 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex flex-col gap-4 border-b border-[#e1e7e1] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[#748079]">{displayWorkspaceName} <span className="px-1 text-[#a5aea8]">/</span> Overview</p>
              <h1 className="mt-1 text-2xl font-bold tracking-normal sm:text-[28px]">Workspace overview</h1>
              <p className="mt-1 text-sm text-[#748079]">
                {workspace.catalogNotes || workspace.industryLabel || "Your support operations at a glance."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe0d6] bg-[#edf7f0] px-3 py-1.5 text-xs font-semibold text-[#24583c]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2e7657]" /> Live console
              </span>
              <a href="#setup" className="inline-flex items-center gap-2 rounded-md bg-[#183f36] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#245749]">
                {connectedCount < 3 ? "Finish setup" : "Review setup"}
                <FiArrowUpRight size={14} />
              </a>
            </div>
          </div>

          {notice && (
            <p role="status" className="mb-5 rounded-md border border-[#b9d7c7] bg-[#edf7f0] px-4 py-3 text-sm text-[#24583c]">
              {notice}
            </p>
          )}

          <section id="overview" aria-label="Workspace metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metrics.map(({ label, value, note, icon: Icon }) => (
              <article key={label} className="rounded-md border border-[#e2e8e2] bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between text-[#748079]">
                  <p className="text-xs font-medium sm:text-sm">{label}</p>
                  <Icon size={17} />
                </div>
                <p className="mt-4 text-2xl font-bold">{value}</p>
                <p className="mt-1 text-xs text-[#748079]">{note}</p>
              </article>
            ))}
          </section>

          <section id="setup" className="mt-7 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
            <article className="rounded-md border border-[#dce6df] bg-[#eaf2ee] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[#537166]">Guided setup</p>
                  <h2 className="mt-2 text-lg font-bold">Get your agent ready</h2>
                </div>
                <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[#345d4d]">{connectedCount} of 3</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#5e7168]">
                {workspace.supportEmail ? `Support inbox: ${workspace.supportEmail}. ` : ""}
                Connect your business tools, then choose the support workflows you want to automate.
              </p>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[#2e7657] transition-all" style={{ width: `${setupProgress}%` }} />
              </div>
              <p className="mt-2 text-xs text-[#5e7168]">{setupProgress}% of connections configured</p>
              {workspace.website && (
                <a href={workspace.website} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#24583c] hover:underline">
                  Visit store <FiArrowUpRight size={15} />
                </a>
              )}
            </article>

            <article className="rounded-md border border-[#e2e8e2] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold">Your connections</h2>
                  <p className="mt-1 text-xs text-[#748079]">Add the tools your agent can use</p>
                </div>
                <a href="#integrations" className="inline-flex items-center gap-1 text-xs font-semibold text-[#24583c] hover:underline">
                  Manage <FiArrowUpRight size={13} />
                </a>
              </div>
              <div className="mt-4 divide-y divide-[#edf0ed]">
                {integrationCards.map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <div key={integration.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${integration.color}`}><Icon size={17} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{integration.name}</p>
                        <p className="truncate text-xs text-[#748079]">{integration.summary}</p>
                      </div>
                      <span className={`text-xs font-semibold ${integration.connected ? "text-[#34704f]" : "text-[#8a6c2c]"}`}>
                        {integration.id === "whatsapp" && !whatsappMeta.authorized ? "Sign in required" : integration.connected ? "Connected" : "Setup"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <section id="integrations" className="mt-9">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">Integrations</h2>
                <p className="mt-1 text-sm text-[#748079]">Bring your existing channels and commerce systems.</p>
              </div>
              <span className="text-xs text-[#748079]">3 available connectors</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {integrationCards.map((integration) => {
                const Icon = integration.icon;
                return (
                  <article key={integration.id} className="flex min-h-[184px] flex-col rounded-md border border-[#e2e8e2] bg-white p-4">
                    <div className="flex items-start justify-between">
                      <span className={`grid h-9 w-9 place-items-center rounded-md ${integration.color}`}><Icon size={18} /></span>
                      <span className={`text-xs font-medium ${integration.connected ? "text-[#34704f]" : "text-[#8a6c2c]"}`}>
                        {integration.id === "whatsapp" && whatsappMeta.loading ? "Checking..." : integration.id === "whatsapp" && !whatsappMeta.authorized ? "Sign in required" : integration.connected ? "Connected" : "Not connected"}
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-bold">{integration.name}</h3>
                    <p className="mt-1 flex-1 text-xs leading-5 text-[#748079]">{integration.detail}</p>
                    <button
                      type="button"
                      onClick={() => openConnector(integration.id)}
                      className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md border border-[#d8e1da] px-3 py-2 text-xs font-semibold text-[#315d49] hover:bg-[#f2f7f3]"
                    >
                      {integration.connected ? <><FiSettings size={14} /> Manage</> : <><FiPlus size={14} /> Connect</>}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="workflows" className="mt-9">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Automations</h2>
              <p className="mt-1 text-sm text-[#748079]">Workflows enabled for {displayWorkspaceName}.</p>
            </div>
            <div className="overflow-hidden rounded-md border border-[#e2e8e2] bg-white">
              {WORKFLOW_OPTIONS.map((workflow, index) => {
                const enabled = workspace.enabledWorkflows.includes(workflow.id);
                const isReady = enabled && workflow.requires.every((id) => connected[id]);
                const state = !enabled ? "Not enabled" : isReady ? "Ready" : workflow.requires.length > 1 ? "Needs connections" : "Needs order system";
                return (
                  <div key={workflow.name} className={`flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5 ${index ? "border-t border-[#edf0ed]" : ""}`}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#f1f5f2] text-[#527063]">
                      {index === 0 ? <FiActivity size={16} /> : index === 1 ? <FiShoppingBag size={16} /> : <FiShield size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold">{workflow.name}</h3>
                      <p className="mt-1 truncate text-xs text-[#748079]">{workflow.detail}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isReady ? "bg-[#eaf4ed] text-[#34704f]" : "bg-[#fff5df] text-[#856625]"}`}>
                      {state}
                    </span>
                    <FiChevronRight className="text-[#9aa49e]" size={16} />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-9 grid gap-5 lg:grid-cols-2">
            <article id="conversations" className="rounded-md border border-[#e2e8e2] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">Recent conversations</h2>
                  <p className="mt-1 text-xs text-[#748079]">Latest customer requests for this console</p>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                {consoleState.conversations.length === 0 ? (
                  <p className="rounded-md bg-[#f4f6f3] px-3 py-4 text-sm text-[#65716b]">No customer conversations yet. Connect WhatsApp to start receiving requests in this workspace.</p>
                ) : consoleState.conversations.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eaf2ee] text-xs font-bold text-[#315d49]">{initials(item.customerName)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">{item.customerName}</p>
                      <p className="truncate text-xs text-[#748079]">{item.message}</p>
                    </div>
                    <span className="hidden text-right text-[11px] text-[#748079] sm:block">{conversationStatus(item.status)}<br />{relativeTime(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            </article>

            <article id="approvals" className="rounded-md border border-[#e2e8e2] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">Needs your approval</h2>
                  <p className="mt-1 text-xs text-[#748079]">Sensitive actions stay in your control</p>
                </div>
                <span className="rounded-full bg-[#fff5df] px-2.5 py-1 text-xs font-semibold text-[#856625]">{consoleState.metrics.openApprovals} pending</span>
              </div>
              {consoleState.approvals.filter((item) => item.status === "PENDING").length === 0 ? (
                <p className="mt-4 rounded-md bg-[#f4f6f3] px-3 py-4 text-sm text-[#65716b]">Nothing is waiting for review in this console.</p>
              ) : consoleState.approvals.filter((item) => item.status === "PENDING").map((item) => (
                <div key={item.id} className="mt-4 rounded-md border border-[#edf0ed] p-3">
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#748079]">{item.detail}</p>
                </div>
              ))}
              <div id="billing" className="mt-4 flex items-center justify-between border-t border-[#edf0ed] pt-4 text-xs">
                <span className="text-[#748079]">Monthly conversations</span>
                <span className="font-semibold">{consoleState.billing.used} / {consoleState.billing.limit ?? "Unlimited"}</span>
              </div>
            </article>
          </section>

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[#e1e7e1] pt-4 text-xs text-[#748079]">
            <span>CommercePilot AI · {displayWorkspaceName}</span>
            <Link href="/contact" className="font-semibold text-[#315d49] hover:underline">Talk to our team <FiArrowUpRight className="inline" size={13} /></Link>
          </footer>
        </div>
      </main>

      {connector && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#10211c]/55 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !connectorBusy) setConnector(null); }}>
          <form onSubmit={saveConnector} className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-lg bg-white p-5 shadow-2xl sm:rounded-lg sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-[#537166]">Connection</p>
                <h2 className="mt-1 text-xl font-bold">{connector === "orders" ? "Connect order system" : "Connect vendor messaging"}</h2>
              </div>
              <button type="button" onClick={() => setConnector(null)} className="rounded-md p-2 text-[#65716b] hover:bg-[#f2f5f2]"><FiX size={18} /></button>
            </div>
            {connectorError && <p role="alert" className="mt-4 rounded-md border border-[#f0c6bd] bg-[#fff1ee] px-3 py-2.5 text-sm text-[#8d3c2d]">{connectorError}</p>}
            <label className="mt-5 block text-sm font-semibold">
              Provider
              <select value={connectorForm.provider} onChange={(event) => setConnectorForm((current) => ({ ...current, provider: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal">
                {(connector === "orders" ? ORDER_PROVIDERS : VENDOR_PROVIDERS).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            {connector === "orders" ? (
              <label className="mt-4 block text-sm font-semibold">
                Store or API URL
                <input required type="url" value={connectorForm.storeUrl} onChange={(event) => setConnectorForm((current) => ({ ...current, storeUrl: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal" placeholder="https://" />
              </label>
            ) : (
              <label className="mt-4 block text-sm font-semibold">
                Vendor contact
                <input required maxLength={160} value={connectorForm.contact} onChange={(event) => setConnectorForm((current) => ({ ...current, contact: event.target.value }))} className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm font-normal" placeholder="Phone, email, or API host" />
              </label>
            )}
            <button type="submit" disabled={connectorBusy} className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#183f36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245749]">
              {connectorBusy && <FiLoader className="animate-spin" size={15} />}
              Save connection
            </button>
          </form>
        </div>
      )}

      {wizardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#10211c]/55 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !wizardBusy) setWizardOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-wizard-title"
            className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-lg bg-white p-5 shadow-2xl sm:rounded-lg sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-[#537166]">Channel setup · Step {wizardComplete ? 3 : wizardStep} of 3</p>
                <h2 id="whatsapp-wizard-title" className="mt-1 text-xl font-bold">Connect customer WhatsApp</h2>
                <p className="mt-1 text-sm text-[#748079]">Authorize the business number you use to talk to customers.</p>
              </div>
              <button type="button" aria-label="Close WhatsApp setup" disabled={wizardBusy} onClick={() => setWizardOpen(false)} className="rounded-md p-2 text-[#65716b] hover:bg-[#f2f5f2] disabled:opacity-50">
                <FiX size={18} />
              </button>
            </div>

            {!wizardComplete && (
              <div className="mt-6 grid grid-cols-3 gap-2" aria-label="Setup progress">
                {["Workspace", "Authorize", "Confirm"].map((label, index) => {
                  const step = index + 1;
                  const active = wizardStep === step;
                  const complete = wizardStep > step;
                  return (
                    <div key={label} className={`border-t-2 pt-2 text-xs font-semibold ${active || complete ? "border-[#2e7657] text-[#24583c]" : "border-[#e2e8e2] text-[#9aa49e]"}`}>
                      {label}
                    </div>
                  );
                })}
              </div>
            )}

            {wizardError && (
              <p role="alert" className="mt-5 rounded-md border border-[#f0c6bd] bg-[#fff1ee] px-3 py-2.5 text-sm text-[#8d3c2d]">{wizardError}</p>
            )}

            {wizardComplete ? (
              <div className="mt-7">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf4ed] text-[#34704f]"><FiCheck size={22} /></div>
                <h3 className="mt-4 text-lg font-bold">WhatsApp is connected</h3>
                <p className="mt-2 text-sm text-[#65716b]">
                  {integrations.whatsapp?.verifiedName || workspace.name}
                  {integrations.whatsapp?.displayPhoneNumber ? ` · ${integrations.whatsapp.displayPhoneNumber}` : ""}
                </p>
                <button type="button" onClick={() => setWizardOpen(false)} className="mt-6 rounded-md bg-[#183f36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245749]">
                  Done
                </button>
              </div>
            ) : wizardStep === 1 ? (
              <div className="mt-6">
                <p className="text-sm text-[#65716b]">This number will be attached to <span className="font-semibold">{workspace.name}</span>.</p>
                {!whatsappMeta.authorized && (
                  <div className="mt-4 rounded-md border border-[#ead9a9] bg-[#fff8e7] p-3">
                    <p className="text-sm font-semibold text-[#795c1c]">Sign in to connect this workspace</p>
                    <Link href={AUTH_HREF} className="mt-3 inline-flex rounded-md bg-[#183f36] px-3 py-2 text-xs font-semibold text-white hover:bg-[#245749]">Sign in</Link>
                  </div>
                )}
                {whatsappMeta.authorized && !whatsappMeta.meta?.configured && (
                  <div className="mt-4 rounded-md border border-[#ead9a9] bg-[#fff8e7] p-3">
                    <p className="text-sm font-semibold text-[#795c1c]">Meta onboarding needs server configuration</p>
                    <ul className="mt-2 space-y-1 font-mono text-xs text-[#795c1c]">
                      {(whatsappMeta.meta?.missing || ["META_APP_ID", "META_APP_SECRET", "META_WHATSAPP_CONFIG_ID", "WHATSAPP_TOKEN_ENCRYPTION_KEY"]).map((name) => <li key={name}>{name}</li>)}
                    </ul>
                  </div>
                )}
                {whatsappMeta.error && <p className="mt-3 text-sm text-[#8d3c2d]">{whatsappMeta.error}</p>}
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={!whatsappMeta.authorized || !whatsappMeta.meta?.configured || whatsappMeta.loading}
                    onClick={() => { setWizardError(""); setWizardStep(2); }}
                    className="rounded-md bg-[#183f36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245749] disabled:cursor-not-allowed disabled:bg-[#9ba9a1]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : wizardStep === 2 ? (
              <div className="mt-6">
                <h3 className="text-base font-bold">Authorize with Meta</h3>
                <p className="mt-2 text-sm leading-6 text-[#65716b]">Meta will ask you to choose a WhatsApp Business Account and phone number, then grant this app access.</p>
                {whatsappMeta.sdkError && <p role="alert" className="mt-4 text-sm text-[#8d3c2d]">{whatsappMeta.sdkError}</p>}
                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  <button type="button" onClick={() => { setWizardError(""); setWizardStep(1); }} className="rounded-md border border-[#d8e1da] px-4 py-2.5 text-sm font-semibold text-[#315d49] hover:bg-[#f2f7f3]">Back</button>
                  <button type="button" disabled={!metaSdkReady || wizardBusy} onClick={startMetaSignup} className="inline-flex items-center gap-2 rounded-md bg-[#183f36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245749] disabled:cursor-not-allowed disabled:bg-[#9ba9a1]">
                    {wizardBusy && <FiLoader className="animate-spin" size={15} />}
                    {metaSdkReady ? "Continue with Meta" : "Loading secure signup"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <h3 className="text-base font-bold">Confirm the connection</h3>
                <div className="mt-4 rounded-md bg-[#f4f6f3] p-3 text-sm">
                  <p><span className="text-[#748079]">Workspace:</span> <span className="font-semibold">{workspace.name}</span></p>
                  <p className="mt-1"><span className="text-[#748079]">WhatsApp account:</span> <span className="font-semibold">Authorized with Meta</span></p>
                </div>
                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  <button type="button" disabled={wizardBusy} onClick={() => { setWizardError(""); setSignup(null); setWizardStep(2); }} className="rounded-md border border-[#d8e1da] px-4 py-2.5 text-sm font-semibold text-[#315d49] hover:bg-[#f2f7f3] disabled:opacity-50">Back</button>
                  <button type="button" disabled={wizardBusy || !signup} onClick={saveWhatsAppConnection} className="inline-flex items-center gap-2 rounded-md bg-[#183f36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245749] disabled:cursor-not-allowed disabled:bg-[#9ba9a1]">
                    {wizardBusy && <FiLoader className="animate-spin" size={15} />}
                    Secure and connect
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
