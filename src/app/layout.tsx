import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer";
import "./globals.css"; // Import global styles
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}