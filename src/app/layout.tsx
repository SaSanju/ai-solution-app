import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageLoader from "./components/PageLoader";
import { LoaderProvider } from "./context/LoaderContext";
import "./globals.css"; // Import global styles
import { ReactNode } from "react";

export const metadata = {
  title: "Kritrim Solutions - AI Innovation",
  description: "Revolutionizing AI-driven solutions for businesses.",
  openGraph: {
    title: "Kritrim Solutions - AI Innovation",
    description: "Revolutionizing AI-driven solutions for businesses.",
    url: "https://www.kritrimsolutions.com",
    type: "website",
    images: [
      {
        url: "https://kadvwdsvp6r2p8kv.public.blob.vercel-storage.com/whatsapp_preview-KDoRF0fYWqKkS1OqsibRaFvoKH0hyU.jpeg",
        width: 1200,
        height: 630,
        alt: "Kritrim Solutions Preview",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Explicit Open Graph Meta Tags for WhatsApp */}
        <meta property="og:title" content="Kritrim Solutions - AI Innovation" />
        <meta property="og:description" content="Revolutionizing AI-driven solutions for businesses." />
        <meta property="og:url" content="https://www.kritrimsolutions.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://kadvwdsvp6r2p8kv.public.blob.vercel-storage.com/whatsapp_preview-KDoRF0fYWqKkS1OqsibRaFvoKH0hyU.jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Kritrim Solutions Preview" />

        {/* Twitter Card for Better Social Sharing */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kritrim Solutions - AI Innovation" />
        <meta name="twitter:description" content="Revolutionizing AI-driven solutions for businesses." />
        <meta name="twitter:image" content="https://kadvwdsvp6r2p8kv.public.blob.vercel-storage.com/whatsapp_preview-KDoRF0fYWqKkS1OqsibRaFvoKH0hyU.jpeg" />
      </head>
      <body>
        <Navbar />
        <LoaderProvider>
          <PageLoader />
          <div className="pt-16">{children}</div>
        </LoaderProvider>
        <Footer />
      </body>
    </html>
  );
}