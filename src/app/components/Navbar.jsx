"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="p-4 bg-black text-white flex justify-between items-center fixed top-0 w-full shadow-md z-10 px-8">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/assets/icons/Kritrim_Solutions_logo.png"
          width={90}
          height={20}
          alt="Kritrim Solutions Logo"
          className="rounded-lg shadow-lg"
        />
      </div>

      {/* Navigation Links */}
      <div className="flex gap-8 text-lg font-semibold">
        <Link href="/" className="hover:text-blue-400 transition duration-300">Home</Link>
        <Link href="/solutions" className="hover:text-blue-400 transition duration-300">AI Solutions</Link>
        <Link href="/blogs-videos" className="hover:text-blue-400 transition duration-300">Blogs & Videos</Link>
        <Link href="/contact" className="hover:text-blue-400 transition duration-300">Contact</Link>
      </div>

      {/* Social Media Icons */}
      <div className="flex gap-4">
        <a href="#" className="hover:text-blue-400 transition duration-300"><FaFacebook size={20} /></a>
        <a href="#" className="hover:text-blue-400 transition duration-300"><FaTwitter size={20} /></a>
        <a href="#" className="hover:text-blue-400 transition duration-300"><FaLinkedin size={20} /></a>
        <a href="#" className="hover:text-blue-400 transition duration-300"><FaInstagram size={20} /></a>
      </div>
    </nav>
  );
};

export default Navbar;
