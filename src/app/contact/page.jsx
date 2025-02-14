"use client";

import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

const Contact = () => {
  return (
    <section className="p-8 md:p-12 lg:p-16 bg-gray-900 text-center text-white">
      <h2 className="text-3xl md:text-4xl font-bold text-yellow-300">Let's Connect</h2>
      <p className="text-base md:text-lg text-gray-300 mt-2">
        Choose your preferred way to reach out
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-10 items-center">
        {/* Left - Contact Info Section */}
        <div className="space-y-6 text-left text-base md:text-lg">
          <p className="flex items-center gap-2">
            <FaEnvelope className="text-yellow-300 text-xl" /> info@kritrimsolutions.com
          </p>
          <p className="flex items-center gap-2">
            <FaPhone className="text-yellow-300 text-xl" /> +91 8882416906
          </p>
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-yellow-300 text-xl" /> New Delhi, India
          </p>
          <p className="flex items-center gap-2">
            <FaCalendarAlt className="text-yellow-300 text-xl" /> Schedule a meeting
          </p>
        </div>

        {/* Right - Contact Form Section */}
        <div className="flex justify-center md:justify-end">
          <form className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg space-y-4 w-full max-w-md">
            <input
              type="text"
              placeholder="Name"
              className="w-full p-3 border rounded bg-gray-700 text-white"
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border rounded bg-gray-700 text-white"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full p-3 border rounded bg-gray-700 text-white"
              required
            />
            <input
              type="text"
              placeholder="Country"
              className="w-full p-3 border rounded bg-gray-700 text-white"
              required
            />
            <button
              type="submit"
              className="w-full bg-yellow-500 text-black p-3 rounded hover:bg-yellow-600 transition cursor-pointer"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
