"use client";

import { useEffect, useState } from "react";
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

const integrations = [
  {
    id: "whatsapp",
    name: "Customer WhatsApp",
    detail: "Connect your Meta business number",
    icon: FiMessageSquare,
    connected: false,
    color: "bg-green-100 text-green-800",
  },
  {
    id: "orders",
    name: "Order system",
    detail: "MCP, Shopify, or your commerce API",
    icon: FiPackage,
    connected: false,
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "vendor",
    name: "Vendor messaging",
    detail: "Add an authorized vendor connection",
    icon: FiShoppingBag,
    connected: false,
    color: "bg-orange-100 text-orange-800",
  },
];

const workflows = [
  { name: "Track an order", detail: "Order lookup → verified status → reply", requires: ["orders"] },
  { name: "Place an order", detail: "Catalog → customer confirmation → order", requires: ["orders", "vendor"] },
  { name: "Request cancellation", detail: "Policy check → approval → status update", requires: ["orders", "vendor"] },
];

const navigation = [
  { label: "Overview", href: "#overview", icon: FiGrid },
  { label: "Integrations", href: "#integrations", icon: FiZap },
  { label: "Workflows", href: "#workflows", icon: FiActivity },
  { label: "Conversations", href: "#conversations", icon: FiMessageSquare },
  { label: "Approvals", href: "#approvals", icon: FiShield },
  { label: "Billing", href: "#billing", icon: FiCreditCard },
];

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

export default function CommercePilotPrototype() {
  const [connected, setConnected] = useState({});
  const [notice, setNotice] = useState("");
  const [whatsapp, setWhatsapp] = useState({ loading: true, authorized: true, workspace: null, integration: null, meta: null });
  const [metaSdkReady, setMetaSdkReady] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [businessName, setBusinessName] = useState("Northstar Goods");
  const [signup, setSignup] = useState(null);
  const [wizardBusy, setWizardBusy] = useState(false);
  const [wizardError, setWizardError] = useState("");
  const [wizardComplete, setWizardComplete] = useState(false);
  const isIntegrationConnected = (integration) => integration.id === "whatsapp"
    ? Boolean(whatsapp.integration)
    : Boolean(connected[integration.id] ?? integration.connected);
  const connectedCount = integrations.filter(isIntegrationConnected).length;
  const setupProgress = Math.round((connectedCount / integrations.length) * 100);
  const displayWorkspaceName = whatsapp.workspace?.name || businessName || "Northstar Goods";

  useEffect(() => {
    let cancelled = false;

    async function loadIntegration() {
      try {
        const response = await fetch("/api/integrations/whatsapp", { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;

        setWhatsapp({
          loading: false,
          authorized: response.status !== 401,
          workspace: data.workspace || null,
          integration: data.integration || null,
          meta: data.meta || null,
        });
        if (data.workspace?.name) setBusinessName(data.workspace.name);

        if (data.meta?.configured && data.meta.appId) {
          try {
            await loadMetaSdk(data.meta.appId, data.meta.graphVersion);
            if (!cancelled) setMetaSdkReady(true);
          } catch (error) {
            if (!cancelled) setWhatsapp((current) => ({ ...current, sdkError: error.message }));
          }
        }
      } catch {
        if (!cancelled) {
          setWhatsapp((current) => ({ ...current, loading: false, error: "Could not load WhatsApp setup." }));
        }
      }
    }

    loadIntegration();
    return () => { cancelled = true; };
  }, []);

  function simulateConnection(integration) {
    if (integration.id === "whatsapp") {
      setWizardError("");
      setWizardComplete(false);
      setWizardStep(1);
      setSignup(null);
      setBusinessName(whatsapp.workspace?.name || "Northstar Goods");
      setWizardOpen(true);
      return;
    }

    setConnected((current) => ({ ...current, [integration.id]: true }));
    setNotice(`${integration.name} added to this demo workspace. No external account was connected.`);
  }

  async function startMetaSignup() {
    setWizardBusy(true);
    setWizardError("");
    try {
      const result = await beginMetaSignup(whatsapp.meta.configId);
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
        body: JSON.stringify({ businessName, ...signup }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save the WhatsApp connection.");

      setWhatsapp((current) => ({
        ...current,
        authorized: true,
        workspace: data.workspace,
        integration: data.integration,
      }));
      setWizardComplete(true);
      setNotice(`Customer WhatsApp connected${data.integration.displayPhoneNumber ? `: ${data.integration.displayPhoneNumber}` : ""}.`);
    } catch (error) {
      setWizardError(error.message || "Could not save the WhatsApp connection.");
    } finally {
      setWizardBusy(false);
    }
  }

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
              <p className="text-[11px] text-[#76827c]">Starter workspace</p>
            </div>
            <FiChevronRight className="shrink-0 text-[#76827c]" size={15} />
          </div>
        </div>

        <div className="mx-4 mb-4 hidden items-center justify-between rounded-md border border-[#e5eae5] px-3 py-2.5 md:flex">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{displayWorkspaceName}</p>
            <p className="mt-0.5 text-xs text-[#76827c]">Starter workspace</p>
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
              <p className="mt-1 text-sm text-[#748079]">Your support operations at a glance.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ead9a9] bg-[#fff8e7] px-3 py-1.5 text-xs font-semibold text-[#795c1c]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c9942e]" /> Prototype · Sample data
              </span>
              <a href="#setup" className="inline-flex items-center gap-2 rounded-md bg-[#183f36] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#245749]">
                {connectedCount < integrations.length ? "Finish setup" : "Review setup"}
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
            {[
              { label: "Conversations", value: "248", note: "+12% this week", icon: FiMessageSquare },
              { label: "Auto-resolved", value: "82%", note: "203 handled by agent", icon: FiCheck },
              { label: "Open approvals", value: "4", note: "1 needs attention", icon: FiShield },
              { label: "Avg. response", value: "18 sec", note: "Across all channels", icon: FiClock },
            ].map(({ label, value, note, icon: Icon }) => (
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
              <p className="mt-2 text-sm leading-6 text-[#5e7168]">Connect your business tools, then choose the support workflows you want to automate.</p>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[#2e7657] transition-all" style={{ width: `${setupProgress}%` }} />
              </div>
              <p className="mt-2 text-xs text-[#5e7168]">{setupProgress}% of connections configured</p>
              <a href="#integrations" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#24583c] hover:underline">
                Continue setup <FiArrowUpRight size={15} />
              </a>
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
                {integrations.map((integration) => {
                  const Icon = integration.icon;
                  const isConnected = isIntegrationConnected(integration);
                  return (
                    <div key={integration.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${integration.color}`}><Icon size={17} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{integration.name}</p>
                        <p className="truncate text-xs text-[#748079]">
                          {integration.id === "whatsapp"
                            ? whatsapp.integration?.displayPhoneNumber || whatsapp.integration?.verifiedName || (whatsapp.loading ? "Checking connection" : "Authorize your Meta business number")
                            : isConnected ? "Ready to configure" : "Setup required"}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold ${isConnected ? "text-[#34704f]" : "text-[#8a6c2c]"}`}>
                        {integration.id === "whatsapp" && !whatsapp.authorized ? "Sign in required" : isConnected ? "Connected" : "Setup"}
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
              {integrations.map((integration) => {
                const Icon = integration.icon;
                const isConnected = isIntegrationConnected(integration);
                return (
                  <article key={integration.id} className="flex min-h-[184px] flex-col rounded-md border border-[#e2e8e2] bg-white p-4">
                    <div className="flex items-start justify-between">
                      <span className={`grid h-9 w-9 place-items-center rounded-md ${integration.color}`}><Icon size={18} /></span>
                      <span className={`text-xs font-medium ${isConnected ? "text-[#34704f]" : "text-[#8a6c2c]"}`}>
                        {integration.id === "whatsapp" && whatsapp.loading ? "Checking..." : integration.id === "whatsapp" && !whatsapp.authorized ? "Sign in required" : isConnected ? "Connected" : "Not connected"}
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-bold">{integration.name}</h3>
                    <p className="mt-1 flex-1 text-xs leading-5 text-[#748079]">{integration.detail}</p>
                    <button
                      type="button"
                      onClick={() => simulateConnection(integration)}
                      disabled={integration.id !== "whatsapp" && isConnected}
                      className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md border border-[#d8e1da] px-3 py-2 text-xs font-semibold text-[#315d49] hover:bg-[#f2f7f3] disabled:cursor-default disabled:text-[#748079]"
                    >
                      {integration.id === "whatsapp"
                        ? isConnected ? <><FiSettings size={14} /> Manage</> : <><FiPlus size={14} /> Connect</>
                        : isConnected ? <><FiCheck size={14} /> Added</> : <><FiPlus size={14} /> Connect</>}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="workflows" className="mt-9">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Automations</h2>
              <p className="mt-1 text-sm text-[#748079]">Choose what your support agent can handle.</p>
            </div>
            <div className="overflow-hidden rounded-md border border-[#e2e8e2] bg-white">
              {workflows.map((workflow, index) => (
                (() => {
                  const isReady = workflow.requires.every((id) => connected[id] ?? integrations.find((item) => item.id === id)?.connected);
                  const state = isReady ? "Ready" : workflow.requires.length > 1 ? "Needs connections" : "Needs order system";
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
                })()
              ))}
            </div>
          </section>

          <section className="mt-9 grid gap-5 lg:grid-cols-2">
            <article id="conversations" className="rounded-md border border-[#e2e8e2] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">Recent conversations</h2>
                  <p className="mt-1 text-xs text-[#748079]">Latest customer requests</p>
                </div>
                <a href="#conversations" className="text-xs font-semibold text-[#24583c]">View all</a>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  ["Maya R.", "Where is my order #4821?", "Resolved", "2 min ago"],
                  ["Daniel K.", "Can I change my delivery address?", "Needs review", "11 min ago"],
                  ["Priya S.", "Do you have this in another size?", "Resolved", "24 min ago"],
                ].map(([name, message, status, time]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eaf2ee] text-xs font-bold text-[#315d49]">{name.split(" ").map((part) => part[0]).join("")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">{name}</p>
                      <p className="truncate text-xs text-[#748079]">{message}</p>
                    </div>
                    <span className="hidden text-right text-[11px] text-[#748079] sm:block">{status}<br />{time}</span>
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
                <span className="rounded-full bg-[#fff5df] px-2.5 py-1 text-xs font-semibold text-[#856625]">4 pending</span>
              </div>
              <div className="mt-4 rounded-md border border-[#edf0ed] p-3">
                <p className="text-xs font-semibold">Cancellation request · Order #4817</p>
                <p className="mt-1 text-xs leading-5 text-[#748079]">The agent checked eligibility and is waiting for an authorized review.</p>
                <button type="button" className="mt-3 text-xs font-semibold text-[#24583c] hover:underline">Review request <FiArrowUpRight className="inline" size={13} /></button>
              </div>
              <div id="billing" className="mt-4 flex items-center justify-between border-t border-[#edf0ed] pt-4 text-xs">
                <span className="text-[#748079]">Monthly conversations</span>
                <span className="font-semibold">248 / 1,000</span>
              </div>
            </article>
          </section>

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[#e1e7e1] pt-4 text-xs text-[#748079]">
            <span>CommercePilot AI · Interactive product prototype</span>
            <Link href="/contact" className="font-semibold text-[#315d49] hover:underline">Talk to our team <FiArrowUpRight className="inline" size={13} /></Link>
          </footer>
        </div>
      </main>

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
              <button
                type="button"
                aria-label="Close WhatsApp setup"
                title="Close"
                disabled={wizardBusy}
                onClick={() => setWizardOpen(false)}
                className="rounded-md p-2 text-[#65716b] hover:bg-[#f2f5f2] disabled:opacity-50"
              >
                <FiX size={18} />
              </button>
            </div>

            {!wizardComplete && (
              <div className="mt-6 grid grid-cols-3 gap-2" aria-label="Setup progress">
                {["Business", "Authorize", "Confirm"].map((label, index) => {
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
              <p role="alert" className="mt-5 rounded-md border border-[#f0c6bd] bg-[#fff1ee] px-3 py-2.5 text-sm text-[#8d3c2d]">
                {wizardError}
              </p>
            )}

            {wizardComplete ? (
              <div className="mt-7">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf4ed] text-[#34704f]"><FiCheck size={22} /></div>
                <h3 className="mt-4 text-lg font-bold">WhatsApp is connected</h3>
                <p className="mt-2 text-sm text-[#65716b]">
                  {whatsapp.integration?.verifiedName || businessName}
                  {whatsapp.integration?.displayPhoneNumber ? ` · ${whatsapp.integration.displayPhoneNumber}` : ""}
                </p>
                <button type="button" onClick={() => setWizardOpen(false)} className="mt-6 rounded-md bg-[#183f36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245749]">
                  Done
                </button>
              </div>
            ) : wizardStep === 1 ? (
              <div className="mt-6">
                <label htmlFor="whatsapp-business-name" className="block text-sm font-semibold">Business workspace name</label>
                <input
                  id="whatsapp-business-name"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  maxLength={120}
                  className="mt-2 w-full rounded-md border border-[#cfd9d1] px-3 py-2.5 text-sm outline-none focus:border-[#2e7657] focus:ring-2 focus:ring-[#2e7657]/15"
                />

                {!whatsapp.authorized && (
                  <div className="mt-4 rounded-md border border-[#ead9a9] bg-[#fff8e7] p-3">
                    <p className="text-sm font-semibold text-[#795c1c]">Sign in to connect this workspace</p>
                    <p className="mt-1 text-xs leading-5 text-[#795c1c]">Your WhatsApp account will be attached to the business workspace owned by your account.</p>
                    <Link href="/auth" className="mt-3 inline-flex rounded-md bg-[#183f36] px-3 py-2 text-xs font-semibold text-white hover:bg-[#245749]">
                      Sign in
                    </Link>
                  </div>
                )}

                {whatsapp.authorized && !whatsapp.meta?.configured && (
                  <div className="mt-4 rounded-md border border-[#ead9a9] bg-[#fff8e7] p-3">
                    <p className="text-sm font-semibold text-[#795c1c]">Meta onboarding needs server configuration</p>
                    <p className="mt-1 text-xs leading-5 text-[#795c1c]">Set these server environment variables, then reload this page:</p>
                    <ul className="mt-2 space-y-1 font-mono text-xs text-[#795c1c]">
                      {(whatsapp.meta?.missing || ["META_APP_ID", "META_APP_SECRET", "META_WHATSAPP_CONFIG_ID", "WHATSAPP_TOKEN_ENCRYPTION_KEY"]).map((name) => <li key={name}>{name}</li>)}
                    </ul>
                  </div>
                )}

                {whatsapp.error && <p className="mt-3 text-sm text-[#8d3c2d]">{whatsapp.error}</p>}
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={!whatsapp.authorized || !whatsapp.meta?.configured || !businessName.trim() || whatsapp.loading}
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
                <ul className="mt-4 space-y-2 text-sm text-[#65716b]">
                  <li className="flex items-start gap-2"><FiCheck className="mt-0.5 shrink-0 text-[#34704f]" size={15} />Use a number authorized for your business</li>
                  <li className="flex items-start gap-2"><FiShield className="mt-0.5 shrink-0 text-[#34704f]" size={15} />Your access token is exchanged and encrypted by this server</li>
                </ul>
                {whatsapp.sdkError && <p role="alert" className="mt-4 text-sm text-[#8d3c2d]">{whatsapp.sdkError}</p>}
                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  <button type="button" onClick={() => { setWizardError(""); setWizardStep(1); }} className="rounded-md border border-[#d8e1da] px-4 py-2.5 text-sm font-semibold text-[#315d49] hover:bg-[#f2f7f3]">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!metaSdkReady || wizardBusy}
                    onClick={startMetaSignup}
                    className="inline-flex items-center gap-2 rounded-md bg-[#183f36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245749] disabled:cursor-not-allowed disabled:bg-[#9ba9a1]"
                  >
                    {wizardBusy && <FiLoader className="animate-spin" size={15} />}
                    {metaSdkReady ? "Continue with Meta" : "Loading secure signup"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <h3 className="text-base font-bold">Confirm the connection</h3>
                <p className="mt-2 text-sm leading-6 text-[#65716b]">Meta authorization completed. We’ll verify the phone belongs to the selected business account and securely save the connection.</p>
                <div className="mt-4 rounded-md bg-[#f4f6f3] p-3 text-sm">
                  <p><span className="text-[#748079]">Workspace:</span> <span className="font-semibold">{businessName}</span></p>
                  <p className="mt-1"><span className="text-[#748079]">WhatsApp account:</span> <span className="font-semibold">Authorized with Meta</span></p>
                </div>
                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  <button type="button" disabled={wizardBusy} onClick={() => { setWizardError(""); setSignup(null); setWizardStep(2); }} className="rounded-md border border-[#d8e1da] px-4 py-2.5 text-sm font-semibold text-[#315d49] hover:bg-[#f2f7f3] disabled:opacity-50">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={wizardBusy || !signup}
                    onClick={saveWhatsAppConnection}
                    className="inline-flex items-center gap-2 rounded-md bg-[#183f36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245749] disabled:cursor-not-allowed disabled:bg-[#9ba9a1]"
                  >
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