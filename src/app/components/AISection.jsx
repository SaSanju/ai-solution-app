"use client"; // Required for using 'framer-motion' in Next.js App Router

import { motion } from "framer-motion";

const AISection = () => (
  <section className="p-10 bg-gray-100 text-center">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white text-lg font-semibold">
      {[
        { title: "AI Strategy", desc: "Actionable plans for AI adoption.", gradient: "from-blue-500 to-purple-500" },
        { title: "AI Growth", desc: "Scale marketing & sales with AI.", gradient: "from-green-400 to-blue-600" },
        { title: "AI Automation", desc: "Optimize operations with AI.", gradient: "from-yellow-400 to-orange-600" }
      ].map((card, index) => (
        <motion.div
          key={index}
          className={`relative bg-gradient-to-r ${card.gradient} p-6 rounded-lg shadow-lg 
                     hover:scale-105 transition-transform cursor-pointer`}
          whileHover={{ scale: 1.1 }}
        >
          <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
          <p>{card.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default AISection;