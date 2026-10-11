"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const techLogos = [
    { name: "Make", src: "/assets/icons/make_logo.png" },
    { name: "Relevance AI", src: "/assets/icons/relevance_ai_logo.png" },
    { name: "n8n", src: "/assets/icons/n8n_logo.png" },
    { name: "Slack", src: "/assets/icons/slack_logo.png" },
    { name: "WhatsApp", src: "/assets/icons/whatsapp_logo.png" },
    { name: "Claude", src: "/assets/icons/claude_logo.png" },
    { name: "OpenAI", src: "/assets/icons/openAI_logo.png" },
];

const TechStack = () => {
    const router = useRouter();

    return (
        <section className="flex flex-col md:flex-row items-center justify-between p-10 md:p-20 bg-gradient-to-r from-green-100 to-blue-200">
            {/* Left - Logos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 md:w-2/3">
                {techLogos.map((logo, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-lg rounded-md flex items-center justify-center p-3 md:p-4 h-20 w-40 transition-transform transform hover:scale-105"
                        style={{ boxShadow: "4px 4px 0px black" }}
                    >
                        <Image src={logo.src} alt={logo.name} width={120} height={40} className="object-contain" />
                    </div>
                ))}
            </div>

            {/* Right - Join Us Button */}
            <div className="md:w-1/3 flex justify-center md:justify-center mt-10 md:mt-0">
                <button
                    onClick={() => router.push("/contact")}
                    className="bg-black text-white px-6 py-3 text-lg rounded-lg shadow-lg hover:bg-gray-800 transition-all"
                >
                    Join Us
                </button>
            </div>
        </section>
    );
};

export default TechStack;
