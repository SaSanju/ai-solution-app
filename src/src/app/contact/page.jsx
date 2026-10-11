"use client";

import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import ContactForm from "../components/ContactForm";
import { scheduleMeeting } from "../utils/scheduleMeeting";
import { motion } from "framer-motion";

const Contact = () => {  
  return (
    <section className="py-20 px-4 sm:p-8 md:p-12 lg:p-16 bg-gray-900 text-center text-white">
      <h2 className="text-3xl md:text-4xl font-bold text-yellow-300">Let's Connect</h2>
      <p className="text-base md:text-lg text-gray-300 mt-2">
        Choose your preferred way to reach out
      </p>

      {/* Adjusting Grid for Better Responsiveness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-10 items-center">
        {/* Left - Contact Info Section */}
        <div className="space-y-6 text-left text-base md:text-lg mx-auto">
          <p className="flex items-center gap-2">
            <FaEnvelope className="text-yellow-300 text-xl" /> info@kritrimsolutions.com
          </p>
          <p className="flex items-center gap-2">
            <FaPhone className="text-yellow-300 text-xl" /> +91 8882416906
          </p>
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-yellow-300 text-xl" /> New Delhi, India
          </p>
          <p className="flex items-center gap-2 cursor-pointer hover:text-yellow-400 transition" onClick={scheduleMeeting}>
            <FaCalendarAlt className="text-yellow-300 text-xl" /> Schedule a Meeting
            <motion.span
              className="ml-1"
              animate={{ x: [0, 5, 0] }} // Smooth left-right movement
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              ⏪ 
            </motion.span>
          </p>
        </div>

        {/* Right - Contact Form Section */}
        <div className="flex justify-center w-full">
            <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default Contact;
