"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaBars, FaTimes } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="p-4 bg-black text-white fixed top-0 w-full shadow-md z-10 px-8">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/assets/icons/Kritrim_Solutions_logo.png"
              width={90}
              height={20}
              alt="Kritrim Solutions Logo"
              className="rounded-lg shadow-lg"
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex gap-8 text-lg font-semibold">
          <Link href="/" className="hover:text-blue-400 transition duration-300">Home</Link>
          <Link href="/solutions" className="hover:text-blue-400 transition duration-300">AI Solutions</Link>
          <Link href="/blogs-videos" className="hover:text-blue-400 transition duration-300">Blogs & Videos</Link>
          <Link href="/contact" className="hover:text-blue-400 transition duration-300">Contact</Link>
        </div>

        {/* Desktop Social Media Icons or User Avatar */}
        <div className="hidden md:flex gap-4 items-center">
          {session ? (
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <Image src={session.user.image} width={32} height={32} alt="avatar" className="rounded-full" />
              )}
              <span className="font-semibold">{session.user?.name || session.user?.email}</span>
              <button onClick={() => signOut()} className="ml-2 px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm">Logout</button>
            </div>
          ) : (
            <>
              <a href="#" className="hover:text-blue-400 transition duration-300"><FaFacebook size={20} /></a>
              <a href="#" className="hover:text-blue-400 transition duration-300"><FaTwitter size={20} /></a>
              <a href="#" className="hover:text-blue-400 transition duration-300"><FaLinkedin size={20} /></a>
              <a href="#" className="hover:text-blue-400 transition duration-300"><FaInstagram size={20} /></a>
              <Link href="/auth" className="ml-2 px-4 py-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition-colors">Login</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        {pathname !== "/auth" && (
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black text-white flex flex-col items-center py-4 space-y-4">
          <Link href="/" className="text-lg hover:text-blue-400 transition duration-300" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/solutions" className="text-lg hover:text-blue-400 transition duration-300" onClick={() => setMenuOpen(false)}>AI Solutions</Link>
          <Link href="/blogs-videos" className="text-lg hover:text-blue-400 transition duration-300" onClick={() => setMenuOpen(false)}>Blogs & Videos</Link>
          <Link href="/contact" className="text-lg hover:text-blue-400 transition duration-300" onClick={() => setMenuOpen(false)}>Contact</Link>

          {/* Mobile Social Icons or User Avatar */}
          <div className="flex gap-6 mt-4 items-center">
            {session ? (
              <div className="flex items-center gap-2">
                {session.user?.image && (
                  <Image src={session.user.image} width={32} height={32} alt="avatar" className="rounded-full" />
                )}
                <span className="font-semibold">{session.user?.name || session.user?.email}</span>
                <button onClick={() => { setMenuOpen(false); signOut(); }} className="ml-2 px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm">Logout</button>
              </div>
            ) : (
              <>
                <a href="#" className="hover:text-blue-400 transition duration-300"><FaFacebook size={24} /></a>
                <a href="#" className="hover:text-blue-400 transition duration-300"><FaTwitter size={24} /></a>
                <a href="#" className="hover:text-blue-400 transition duration-300"><FaLinkedin size={24} /></a>
                <a href="#" className="hover:text-blue-400 transition duration-300"><FaInstagram size={24} /></a>
                <Link href="/auth" className="ml-2 px-4 py-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition-colors">Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
