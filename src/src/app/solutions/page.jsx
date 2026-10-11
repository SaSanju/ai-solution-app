"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaComments,
  FaChartLine,
  FaCogs,
  FaChartBar,
  FaEye,
  FaHandPaper,
  FaBolt,
  FaCheck,
} from "react-icons/fa";
import { HiArrowDown } from "react-icons/hi";

const problemCards = [
  {
    icon: <FaComments className="text-2xl" />,
    title: "Customer Support",
    subtitle: "AI that answers, understands and takes action.",
    items: ["Answer customer questions", "Check orders", "Handle FAQs", "Create support tickets", "Escalate complex issues"],
  },
  {
    icon: <FaChartLine className="text-2xl" />,
    title: "Sales & Lead Generation",
    subtitle: "Turn repetitive sales work into an automated workflow.",
    items: ["Research prospects", "Qualify leads", "Update CRM", "Personalize outreach", "Schedule meetings"],
  },
  {
    icon: <FaCogs className="text-2xl" />,
    title: "Business Operations",
    subtitle: "Automate the repetitive work happening behind the scenes.",
    items: ["Generate reports", "Monitor business events", "Process documents", "Send alerts", "Coordinate workflows"],
  },
  {
    icon: <FaChartBar className="text-2xl" />,
    title: "Business Intelligence",
    subtitle: "Turn your business data into actionable answers.",
    items: ["Ask questions in natural language", "Generate reports", "Detect anomalies", "Monitor KPIs", "Summarize business performance"],
  },
];

const capabilityTabs = [
  {
    id: "support",
    label: "Customer Support",
    items: ["Answer questions", "Track orders", "Handle FAQs", "Process requests", "Escalate issues"],
  },
  {
    id: "sales",
    label: "Sales",
    items: ["Find leads", "Research companies", "Qualify prospects", "Update CRM", "Draft follow-ups", "Schedule meetings"],
  },
  {
    id: "operations",
    label: "Operations",
    items: ["Generate reports", "Monitor systems", "Detect issues", "Send alerts", "Process documents"],
  },
  {
    id: "internal",
    label: "Internal Assistant",
    items: ["Search company knowledge", "Answer employee questions", "Summarize meetings", "Find information", "Create tasks"],
  },
];

const templates = [
  {
    emoji: "🛍️",
    title: "E-commerce AI",
    description: "Automate customer support, order tracking and operational workflows.",
    integrations: "Shopify · WhatsApp · Gmail · CRM",
    useCases: "Order tracking · Returns · FAQs · Customer support",
    cta: "Discuss Your E-commerce Workflow →",
  },
  {
    emoji: "🏢",
    title: "SaaS AI Support",
    description: "Give your customers an AI support agent connected to your product and knowledge base.",
    integrations: "Website · Knowledge Base · CRM · Slack",
    useCases: "Technical support · FAQs · Ticket creation · Escalation",
    cta: "Discuss SaaS Support →",
  },
  {
    emoji: "📈",
    title: "AI Sales Agent",
    description: "Automate repetitive lead research and sales operations.",
    integrations: "CRM · Email · Calendar · Data sources",
    useCases: "Lead enrichment · Qualification · Follow-ups · Meeting scheduling",
    cta: "Discuss Sales Automation →",
  },
  {
    emoji: "🧾",
    title: "AI Document Processing",
    description: "Turn documents into structured business information.",
    integrations: "Email · Drive · ERP · Databases",
    useCases: "Invoices · Contracts · Applications · Reports · PDFs",
    cta: "Discuss Document Workflows →",
  },
  {
    emoji: "📊",
    title: "AI Business Intelligence",
    description: "Ask questions about your business data in plain English.",
    integrations: "Analytics · Spreadsheets · Databases · Dashboards",
    useCases: "KPI monitoring · Anomaly detection · Performance summaries",
    cta: "Discuss Business Intelligence →",
    example: true,
  },
];

const processSteps = [
  { num: "01", title: "Discover", text: "Understand your business and identify repetitive work." },
  { num: "02", title: "Design", text: "Design the AI workflow around your existing systems." },
  { num: "03", title: "Integrate", text: "Connect CRM, email, databases and business tools." },
  { num: "04", title: "Deploy", text: "Deploy your AI workflow into your environment." },
  { num: "05", title: "Optimize", text: "Monitor performance, improve and scale." },
];

const useCases = [
  { emoji: "💬", text: "I want to automate customer support", href: "/contact" },
  { emoji: "📈", text: "I want more qualified leads", href: "/contact" },
  { emoji: "⚙️", text: "I want to automate repetitive operations", href: "/contact" },
  { emoji: "📊", text: "I want better insights from my data", href: "/contact" },
  { emoji: "📄", text: "I want to automate document processing", href: "/contact" },
  { emoji: "🤔", text: "I'm not sure where AI can help", href: "/contact", highlight: true },
];

const techItems = [
  "LLMs",
  "AI Agents",
  "MCP",
  "RAG",
  "Vector Search",
  "APIs",
  "AWS",
  "Docker",
  "PostgreSQL",
  "Redis",
];

const FlowStep = ({ children, accent }) => (
  <div
    className={`px-4 py-2 rounded-xl text-sm font-semibold text-center shadow-sm ${
      accent ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-800"
    }`}
  >
    {children}
  </div>
);

const Arrow = () => <HiArrowDown className="text-gray-400 my-1" />;

const Solutions = () => {
  const [activeCapability, setActiveCapability] = useState("support");
  const [approvalState, setApprovalState] = useState("review");
  const [employees, setEmployees] = useState(5);
  const [hours, setHours] = useState(15);
  const [hourly, setHourly] = useState(25);

  const activeItems = capabilityTabs.find((tab) => tab.id === activeCapability)?.items || [];
  const monthlyEstimate = useMemo(() => employees * hours * hourly * (52 / 12), [employees, hours, hourly]);

  return (
    <div className="bg-white text-gray-800">
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100 mb-4">
            AI Solutions for Business
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            AI Solutions Built Around Your Business
          </h1>
          <p className="text-lg md:text-xl text-blue-50 max-w-3xl mx-auto mb-10">
            We design and implement AI-powered systems that automate repetitive work, connect your existing tools, and help your team operate faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition"
            >
              Book a Free AI Consultation
            </Link>
            <a
              href="#what-ai-can-do"
              className="border border-white/70 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition"
            >
              Explore Solutions ↓
            </a>
          </div>
          <p className="mt-8 text-sm md:text-base text-blue-100">
            From customer support to sales operations — we connect AI with the tools your business already uses.
          </p>
        </div>
      </section>

      {/* 2. What can AI do */}
      <section id="what-ai-can-do" className="scroll-mt-20 px-4 py-20 bg-gradient-to-b from-white to-[#ebf5ff]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            What can AI actually do for my business?
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            Practical outcomes — not a list of tools. Pick the work that is slowing your team down.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problemCards.map((card) => (
              <article key={card.title} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                <p className="text-gray-600 font-medium mb-5">{card.subtitle}</p>
                <ul className="space-y-2 text-gray-700">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <FaCheck className="text-blue-600 mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Flagship */}
      <section id="operations-agent" className="scroll-mt-20 px-4 py-20 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-3">Flagship solution</p>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-3">Kritrim AI Operations Agent</h2>
          <p className="text-xl text-blue-200 mb-4">Your AI employee for everyday business operations.</p>
          <p className="text-gray-300 max-w-2xl mx-auto mb-12">
            Connect the tools your team already uses and let AI handle repetitive tasks across them.
          </p>

          <div className="bg-gray-800/80 rounded-3xl p-6 md:p-10 max-w-xl mx-auto flex flex-col items-center">
            <FlowStep accent>Kritrim AI Operations Agent</FlowStep>
            <Arrow />
            <FlowStep>Understand the task</FlowStep>
            <Arrow />
            <FlowStep>Reason & decide</FlowStep>
            <Arrow />
            <FlowStep>Take approved action</FlowStep>
            <Arrow />
            <div className="grid grid-cols-3 gap-3 w-full my-2">
              {["Shopify", "Gmail", "CRM"].map((tool) => (
                <FlowStep key={tool}>{tool}</FlowStep>
              ))}
            </div>
            <Arrow />
            <FlowStep accent>Result</FlowStep>
          </div>

          <a
            href="#how-it-works"
            className="inline-block mt-10 bg-white text-gray-900 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* 4. Real-life story */}
      <section id="how-it-works" className="scroll-mt-20 px-4 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">A customer asks where their order is.</h2>
          <p className="text-center text-gray-600 mb-12">The same request — before and after an AI operations agent.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="rounded-2xl border border-red-100 bg-red-50 p-8">
              <h3 className="text-xl font-bold text-red-800 mb-6">Before Kritrim</h3>
              <div className="flex flex-col items-center text-sm font-medium text-gray-800">
                {["Customer", "WhatsApp", "Employee reads message", "Opens Shopify", "Finds order", "Checks shipping", "Returns to WhatsApp", "Replies"].map(
                  (step, index, arr) => (
                    <div key={step} className="flex flex-col items-center">
                      <div className="bg-white px-4 py-2 rounded-lg shadow-sm">{step}</div>
                      {index < arr.length - 1 && <Arrow />}
                    </div>
                  )
                )}
              </div>
              <p className="mt-6 text-center text-red-800 font-semibold">That is 5–10 minutes of repetitive work.</p>
            </article>

            <article className="rounded-2xl border border-green-100 bg-green-50 p-8">
              <h3 className="text-xl font-bold text-green-800 mb-6">With Kritrim</h3>
              <div className="flex flex-col items-center text-sm font-medium text-gray-800">
                {["Customer", "WhatsApp", "Kritrim AI", "Checks order", "Checks shipment", "Responds"].map((step, index, arr) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`px-4 py-2 rounded-lg shadow-sm ${step === "Kritrim AI" ? "bg-blue-600 text-white" : "bg-white"}`}>
                      {step}
                    </div>
                    {index < arr.length - 1 && <Arrow />}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-green-800 font-semibold">Seconds instead of repetitive manual work.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 5. What can your AI employee do */}
      <section className="px-4 py-20 bg-[#ebf5ff]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">What can your AI employee do?</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {capabilityTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCapability(tab.id)}
                className={`px-5 py-2 rounded-full font-semibold transition ${
                  activeCapability === tab.id ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeItems.map((item) => (
              <div key={item} className="flex items-center gap-3 text-lg text-gray-800">
                <span className="text-green-600 font-bold">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Connect tools */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">Connect the tools you already use</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <div className="md:col-span-3">
              <FlowStep accent>Your business</FlowStep>
            </div>
            <article className="rounded-2xl border border-gray-200 p-6 text-left">
              <h3 className="font-bold text-lg mb-4">Your tools</h3>
              <ul className="space-y-2 text-gray-700">
                {["WhatsApp", "Gmail", "Shopify", "CRM", "Slack"].map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl bg-blue-600 text-white p-6 flex items-center justify-center font-bold text-xl">
              Kritrim connects them into one intelligent workflow.
            </article>
            <article className="rounded-2xl border border-gray-200 p-6 text-left">
              <h3 className="font-bold text-lg mb-4">Your data</h3>
              <ul className="space-y-2 text-gray-700">
                {["Database", "Documents", "Knowledge Base", "Analytics"].map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* 7. MCP / architecture */}
      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built to connect AI with your existing systems</h2>
          <p className="text-gray-600 mb-10 max-w-3xl mx-auto">
            Our AI agents can securely interact with business tools through standardized integrations, allowing your AI workflows to work across multiple systems.
          </p>
          <div className="flex flex-col items-center mb-8">
            <FlowStep accent>AI Agent</FlowStep>
            <Arrow />
            <FlowStep>MCP Layer</FlowStep>
            <Arrow />
            <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
              {[
                ["CRM", "Leads"],
                ["Gmail", "Emails"],
                ["Shopify", "Orders"],
              ].map(([tool, data]) => (
                <div key={tool} className="flex flex-col items-center gap-2">
                  <FlowStep>{tool}</FlowStep>
                  <span className="text-xs text-gray-500">{data}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm font-semibold tracking-wide text-gray-500">
            Powered by AI Agents · MCP · APIs · RAG · LLMs
          </p>
        </div>
      </section>

      {/* 8. Human approval */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">AI works. You stay in control.</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Will AI be allowed to do everything automatically? Only where you say so. Sensitive actions wait for review.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">AI detects:</p>
              <p className="font-semibold mb-4">Customer eligible for ₹4,500 refund</p>
              <Arrow />
              <p className="text-xs uppercase tracking-widest text-gray-400 my-2">Review</p>
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
                <p className="font-bold mb-4">Refund ₹4,500</p>
                {approvalState === "review" ? (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setApprovalState("approved")}
                      className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setApprovalState("rejected")}
                      className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className={`font-semibold ${approvalState === "approved" ? "text-green-700" : "text-red-700"}`}>
                      {approvalState === "approved" ? "Approved — executing (demo)" : "Rejected — no action taken (demo)"}
                    </p>
                    <button
                      onClick={() => setApprovalState("review")}
                      className="mt-3 text-sm text-blue-600 hover:underline"
                    >
                      Reset demo
                    </button>
                  </div>
                )}
              </div>
              <Arrow />
              <FlowStep accent>Execute</FlowStep>
            </div>

            <div className="space-y-4">
              {[
                { icon: <FaEye />, title: "Read", text: "AI can access information." },
                { icon: <FaHandPaper />, title: "Recommend", text: "AI proposes an action." },
                { icon: <FaBolt />, title: "Execute", text: "AI performs the action within defined permissions." },
              ].map((level) => (
                <div key={level.title} className="flex gap-4 items-start bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="text-blue-600 text-xl mt-1">{level.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg">{level.title}</h3>
                    <p className="text-gray-600">{level.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. Solution templates */}
      <section className="px-4 py-20 bg-gradient-to-b from-[#ebf5ff] to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Solution templates</h2>
          <p className="text-center text-gray-600 mb-12">Starting points we tailor to how your business actually operates.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tpl) => (
              <article key={tpl.title} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">
                  {tpl.emoji} {tpl.title}
                </h3>
                <p className="text-gray-600 mb-4">{tpl.description}</p>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-semibold text-gray-700">Integrations</span> — {tpl.integrations}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-semibold text-gray-700">Use cases</span> — {tpl.useCases}
                </p>
                {tpl.example && (
                  <div className="bg-gray-900 text-white rounded-xl p-4 text-left text-sm mb-4">
                    <p className="text-gray-400 mb-2">“Why did sales drop last week?”</p>
                    <p className="font-semibold">Sales ↓ 18%</p>
                    <p className="mt-2 text-gray-300">Primary changes:</p>
                    <ul className="list-disc ml-5 text-gray-300">
                      <li>Product A sales ↓ 23%</li>
                      <li>14% fewer returning customers</li>
                      <li>Campaign X ended Tuesday</li>
                    </ul>
                  </div>
                )}
                <Link href="/contact" className="mt-auto text-left text-blue-600 font-semibold hover:underline">
                  {tpl.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Process */}
      <section className="px-4 py-20 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">How we build your AI solution</h2>
          <p className="text-center text-gray-300 mb-12">
            AI Strategy → identify opportunities. AI Growth → acquire and engage customers. AI Automation → let AI execute the repetitive work.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {processSteps.map((step, index) => (
              <div key={step.num} className="relative bg-gray-800 rounded-2xl p-5">
                <p className="text-blue-300 font-bold text-sm mb-2">
                  {step.num}
                  {index < processSteps.length - 1 && <span className="hidden sm:inline text-gray-500"> →</span>}
                </p>
                <h3 className="font-bold uppercase tracking-wide mb-2">{step.title}</h3>
                <p className="text-sm text-gray-300">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Built for your workflow */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">No one-size-fits-all AI</h2>
          <p className="text-gray-600 mb-10">
            Every business has different tools, processes and data. We design AI workflows around how your business actually operates — not another generic chatbot.
          </p>
          <div className="flex flex-col items-center gap-2 font-semibold">
            <FlowStep>Your process</FlowStep>
            <span className="text-gray-400">+</span>
            <FlowStep>Your tools</FlowStep>
            <span className="text-gray-400">+</span>
            <FlowStep>Your data</FlowStep>
            <span className="text-gray-400">+</span>
            <FlowStep>AI</FlowStep>
            <Arrow />
            <FlowStep accent>Your custom solution</FlowStep>
          </div>
          <Link href="/contact" className="mt-10 inline-block text-blue-600 font-bold hover:underline text-lg">
            Tell us what you want to automate →
          </Link>
        </div>
      </section>

      {/* 12. Find your use case */}
      <section className="px-4 py-20 bg-[#ebf5ff]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">What would you like AI to improve?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {useCases.map((item) => (
              <Link
                key={item.text}
                href={item.href}
                className={`text-left rounded-2xl p-6 font-semibold shadow-sm transition hover:-translate-y-0.5 ${
                  item.highlight ? "bg-blue-600 text-white" : "bg-white text-gray-800 hover:bg-blue-50"
                }`}
              >
                <span className="mr-2">{item.emoji}</span>
                {item.text}
                {item.highlight && <span className="block text-sm font-normal mt-2 text-blue-100">Book an AI Discovery Call</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 13. ROI calculator */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">How much repetitive work could you automate?</h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            This is an estimate based on the assumptions you enter below — not a guaranteed savings figure.
          </p>
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 space-y-5">
            {[
              { label: "Employees involved", value: employees, set: setEmployees, min: 1, max: 200 },
              { label: "Hours/week on task", value: hours, set: setHours, min: 1, max: 40 },
              { label: "Average hourly cost ($)", value: hourly, set: setHourly, min: 1, max: 500 },
            ].map((field) => (
              <label key={field.label} className="flex items-center justify-between gap-4">
                <span className="text-gray-700">{field.label}</span>
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={field.value}
                  onChange={(e) => field.set(Number(e.target.value) || 0)}
                  className="w-28 p-2 rounded-lg border border-gray-300 text-right"
                />
              </label>
            ))}
            <div className="border-t border-gray-200 pt-5">
              <p className="text-gray-600">Estimated monthly effort</p>
              <p className="text-3xl font-extrabold text-blue-700">
                ≈ ${monthlyEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month
              </p>
            </div>
            <Link href="/contact" className="block w-full text-center bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">
              See what AI automation could save →
            </Link>
          </div>
        </div>
      </section>

      {/* 14. Prototype / demonstration */}
      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">See what we&apos;re building</h2>
          <p className="inline-block mb-8 text-xs font-bold uppercase tracking-widest bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            Prototype / Demonstration
          </p>
          <h3 className="text-xl font-bold mb-6">E-commerce Customer Support Agent</h3>
          <div className="flex flex-col items-center">
            {["WhatsApp", "AI Agent", "Shopify", "Shipping API", "Customer response"].map((step, index, arr) => (
              <div key={step} className="flex flex-col items-center">
                <FlowStep accent={step === "AI Agent"}>{step}</FlowStep>
                {index < arr.length - 1 && <Arrow />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15. Technology */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Built with modern AI infrastructure</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {techItems.map((item) => (
              <span key={item} className="px-4 py-2 rounded-full bg-gray-100 font-semibold text-gray-800">
                {item}
              </span>
            ))}
          </div>
          <p className="text-lg font-semibold text-gray-700">Designed for integration. Built for production.</p>
        </div>
      </section>

      {/* 16. Final CTA */}
      <section className="px-4 py-24 bg-gradient-to-br from-blue-600 to-purple-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Tell us what your team does manually.</h2>
          <p className="text-lg text-blue-50 mb-10">
            We&apos;ll identify where AI can automate the work, connect the right tools, and design a solution around your business.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} className="inline-block">
            <Link
              href="/contact"
              className="inline-block bg-white text-blue-700 font-bold px-10 py-4 rounded-full text-lg hover:bg-blue-50"
            >
              Book a Free AI Discovery Call
            </Link>
          </motion.div>
          <p className="mt-6 text-sm text-blue-100">No commitment. Just a conversation about what you could automate.</p>
        </div>
      </section>
    </div>
  );
};

export default Solutions;
