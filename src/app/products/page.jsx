"use client";

import { FaHashtag, FaHeadset, FaQuoteLeft } from "react-icons/fa";
import { MdOutlineContentCopy, MdOutlineIntegrationInstructions } from "react-icons/md";
import { useRouter } from "next/navigation";
import Link from "next/link";

const products = [
  {
    id: "commercepilot-ai",
    title: "CommercePilot AI",
    description:
      "A ready-to-configure AI support workspace for commerce teams. Connect your channels and order systems, choose workflows, and launch with your policies in control.",
    icon: <FaHeadset size={40} className="text-emerald-700" />,
    link: "/commercepilot",
    features: ["Guided business onboarding", "WhatsApp and order integrations", "Order, tracking, and cancellation workflows", "Human approvals and audit trail"],
    cta: "Open business console",
  },
  {
    id: "caption-generator",
    title: "AI Caption Generator",
    description:
      "Create engaging social media captions in seconds with our AI-powered tool. Perfect for boosting your brand's social media presence.",
    icon: <FaQuoteLeft size={40} className="text-blue-600" />,
    link: "/caption-generator",
    features: ["Product-focused captions", "Multiple tone options", "Goal-oriented content", "One-click copy"],
    cta: "Try Now",
  },
  {
    id: "hashtag-generator",
    title: "AI Hashtag Generator",
    description:
      "Generate trending hashtags tailored to your product and target audience. Maximize your social media reach and engagement.",
    icon: <FaHashtag size={40} className="text-purple-600" />,
    link: "/hashtag-generator",
    features: ["Category-specific hashtags", "Audience targeting", "Trending tags", "Bulk copy functionality"],
    cta: "Try Now",
  },
  {
    id: "linkedIn-curation-assistant",
    title: "LinkedIn Curation Assistant",
    description:
      "Supercharge your LinkedIn presence with AI-curated content that drives engagement and builds authority.",
    icon: <MdOutlineContentCopy size={40} className="text-green-600" />,
    link: "/contact",
    features: ["Personalized Topic Discovery", "Smart Post Suggestions", "Engagement Optimization", "One-Click Curation"],
    cta: "Coming Soon",
  },
  {
    id: "content-automation",
    title: "Content Automation",
    description:
      "Streamline your content creation process with intelligent automation tools that adapt to your brand voice and style.",
    icon: <MdOutlineIntegrationInstructions size={40} className="text-orange-600" />,
    link: "/contact",
    features: ["Brand voice consistency", "Multi-platform publishing", "Content scheduling", "Performance analytics"],
    cta: "Coming Soon",
  },
];

const Products = () => {
  const router = useRouter();

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-white to-[#ebf5ff] py-24 px-4">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-3">Products & Tools</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          AI tools you can try today
        </h1>
        <p className="text-lg text-gray-600">
          These utilities help with everyday content work. For business-wide automation — support, sales, operations, and data — see{" "}
          <Link href="/solutions" className="text-blue-600 font-semibold hover:underline">
            AI Solutions for Business
          </Link>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {products.map((product) => (
          <article
            key={product.id}
            id={product.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col"
          >
            <div className="mb-4">{product.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{product.title}</h2>
            <p className="text-gray-600 mb-6">{product.description}</p>
            <ul className="space-y-2 mb-8 flex-1">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push(product.link)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              {product.cta}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Products;
