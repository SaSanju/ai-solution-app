"use client";

import Image from "next/image";
import Link from "next/link";
import { FaYoutube, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10 px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <Image 
            src="/assets/icons/Kritrim_Solutions_logo.png" 
            width={50} 
            height={50} 
            alt="Kritrim Solutions Logo" 
          />
          <span className="text-2xl font-semibold">Kritrim Solutions</span>
        </div>

        {/* Pages Section */}
        <div className="mt-6 md:mt-0 text-center md:text-left">
          <h3 className="text-lg font-bold text-gray-300">Pages</h3>
          <ul className="mt-2 space-y-2 text-gray-400">
            <li><Link href="/solutions" className="hover:text-white transition">AI Solutions</Link></li>
            <li><Link href="/community" className="hover:text-white transition">Community</Link></li>
            <li><Link href="/blog" className="hover:text-white transition">Blog & Videos</Link></li>
          </ul>
        </div>

        {/* Follow Me Section */}
        <div className="mt-6 md:mt-0 text-center md:text-left">
          <h3 className="text-lg font-bold text-gray-300">Follow Us</h3>
          <ul className="mt-2 space-y-2 text-gray-400">
            <li className="flex items-center gap-2">
              <FaYoutube className="text-red-500" /> <a href="#" className="hover:text-white transition">YouTube</a>
            </li>
            <li className="flex items-center gap-2">
              <FaTwitter className="text-blue-400" /> <a href="#" className="hover:text-white transition">Twitter</a>
            </li>
            <li className="flex items-center gap-2">
              <FaLinkedin className="text-blue-600" /> <a href="#" className="hover:text-white transition">LinkedIn</a>
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-yellow-500" /> <a href="mailto:info@kritrimsolutions.com" className="hover:text-white transition">info@kritrimsolutions.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-700 mt-8 text-center text-gray-500 text-sm py-4">
        © {new Date().getFullYear()} Kritrim Solutions. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
