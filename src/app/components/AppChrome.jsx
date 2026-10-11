"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Navbar from "./Navbar";
import PageLoader from "./PageLoader";
import { LoaderProvider } from "../context/LoaderContext";
import SessionProviderWrapper from "./SessionProviderWrapper";

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const isCommercePilot = pathname === "/commercepilot" || pathname.startsWith("/commercepilot/");

  return (
    <SessionProviderWrapper>
      <Navbar />
      <LoaderProvider>
        <PageLoader />
        <div className={isCommercePilot ? "pt-[96px]" : "pt-16"}>{children}</div>
      </LoaderProvider>
      <Footer />
    </SessionProviderWrapper>
  );
}