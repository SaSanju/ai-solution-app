"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaUsers } from "react-icons/fa";
import { MdOutlineContentCopy, MdOutlineIntegrationInstructions } from "react-icons/md";
import { AiOutlineUserAdd } from "react-icons/ai";
import { useRouter } from "next/navigation";

const steps = [
    {
        id: "step1",
        title: "Step 1 - Sign Up",
        description: "Create your account and access all integrated AI tools.",
        icon: <AiOutlineUserAdd size={70} className="text-blue-600" />,
    },
    {
        id: "step2",
        title: "Step 2 - Set Up",
        description: "Set up AI agents to automate transcription, content creation, and meeting management.",
        icon: <MdOutlineContentCopy size={70} className="text-blue-600" />,
    },
    {
        id: "step3",
        title: "Step 3 - Integrate",
        description: "Seamlessly integrate with Google Drive, OneDrive, and Microsoft Teams.",
        icon: <MdOutlineIntegrationInstructions size={70} className="text-green-600" />,
    },
    {
        id: "step4",
        title: "Step 4 - Share",
        description: "Use advanced sharing options to collaborate with your team efficiently.",
        icon: <FaUsers size={70} className="text-purple-600" />,
    },
];

const Solutions = () => {
    const { scrollYProgress } = useScroll();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll(".step-section");
            let currentStep = 0;

            sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.5) {
                    currentStep = index;
                }
            });

            setActiveStep(currentStep);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="relative min-h-screen bg-gradient-to-b from-white to-[#ebf5ff] py-24 px-4">
            {/* Title */}
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                    Integrated AI-Driven Workflows in 4 Simple Steps
                </h2>
            </div>

            {/* Timeline & Steps Container */}
            <div className="relative flex flex-col items-center max-w-6xl mx-auto">
                {/* Vertical Timeline */}
                <div className="absolute left-1/2 -translate-x-1/2 w-1 bg-gray-300 h-full hidden md:block">
                    {/* Animated Fill */}
                    <motion.div
                        className="w-1 bg-gradient-to-b from-blue-600 to-blue-300 absolute"
                        style={{
                            height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
                        }}
                    />

                    {/* Timeline Dots */}
                    {steps.map((_, index) => (
                        <motion.div
                            key={index}
                            className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"
                            style={{
                                top: `${(index + 1) * 25}%`,
                            }}
                        />
                    ))}
                </div>

                {/* Steps */}
                {steps.map((step, index) => (
                    <div
                        key={index}
                        id={step.id}
                        className="step-section flex flex-col md:flex-row items-center justify-between w-full px-6 py-16 md:py-32 gap-6"
                    >
                        {index % 2 === 0 ? (
                            <>
                                {/* Icon Section */}
                                <div className="w-full md:w-5/12 flex justify-center md:justify-end">{step.icon}</div>

                                {/* Text Section */}
                                <div className="w-full md:w-5/12 text-center md:text-left">
                                    <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                                    <p className="mt-2 text-gray-600">{step.description}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Text Section */}
                                <div className="w-full md:w-5/12 text-center md:text-right">
                                    <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                                    <p className="mt-2 text-gray-600">{step.description}</p>
                                </div>

                                {/* Icon Section */}
                                <div className="w-full md:w-5/12 flex justify-center md:justify-start">{step.icon}</div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
                <h4 className="text-2xl md:text-4xl font-bold text-gray-400">
                    Experience a new level of AI-powered workflows.
                </h4>
                <button
                    onClick={() => router.push("/contact")}
                    className="bg-black text-white px-6 py-3 mt-4 rounded-lg"
                >
                    Start Now
                </button>
            </div>
        </section>
    );
};

export default Solutions;
