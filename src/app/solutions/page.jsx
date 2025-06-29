"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaHashtag, FaQuoteLeft } from "react-icons/fa";
import { MdOutlineContentCopy, MdOutlineIntegrationInstructions } from "react-icons/md";
import { useRouter } from "next/navigation";

const solutions = [
    {
        id: "caption-generator",
        title: "AI Caption Generator",
        description: "Create engaging social media captions in seconds with our AI-powered tool. Perfect for boosting your brand's social media presence.",
        icon: <FaQuoteLeft size={70} className="text-blue-600" />,
        link: "/caption-generator",
        features: ["Product-focused captions", "Multiple tone options", "Goal-oriented content", "One-click copy"]
    },
    {
        id: "hashtag-generator",
        title: "AI Hashtag Generator",
        description: "Generate trending hashtags tailored to your product and target audience. Maximize your social media reach and engagement.",
        icon: <FaHashtag size={70} className="text-purple-600" />,
        link: "/hashtag-generator",
        features: ["Category-specific hashtags", "Audience targeting", "Trending tags", "Bulk copy functionality"]
    },
    {
        id: "content-automation",
        title: "Content Automation",
        description: "Streamline your content creation process with intelligent automation tools that adapt to your brand voice and style.",
        icon: <MdOutlineContentCopy size={70} className="text-green-600" />,
        link: "/contact",
        features: ["Brand voice consistency", "Multi-platform publishing", "Content scheduling", "Performance analytics"]
    },
    {
        id: "ai-integration",
        title: "AI Integration Services",
        description: "Seamlessly integrate AI solutions into your existing workflow with expert support and custom implementation.",
        icon: <MdOutlineIntegrationInstructions size={70} className="text-orange-600" />,
        link: "/contact",
        features: ["Custom AI solutions", "API integration", "Technical support", "Training & onboarding"]
    },
];

const Solutions = () => {
    const { scrollYProgress } = useScroll();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll(".solution-section");
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

    const handleSolutionClick = (link) => {
        router.push(link);
    };

    return (
        <section className="relative min-h-screen bg-gradient-to-b from-white to-[#ebf5ff] py-24 px-4">
            {/* Title */}
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    AI-Powered Solutions for Modern Businesses
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Discover our cutting-edge AI tools designed to enhance your digital presence and streamline your workflow
                </p>
            </div>

            {/* Timeline & Solutions Container */}
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
                    {solutions.map((_, index) => (
                        <motion.div
                            key={index}
                            className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"
                            style={{
                                top: `${(index + 1) * 25}%`,
                            }}
                        />
                    ))}
                </div>

                {/* Solutions */}
                {solutions.map((solution, index) => (
                    <div
                        key={index}
                        id={solution.id}
                        className="solution-section flex flex-col md:flex-row items-center justify-between w-full px-6 py-16 md:py-32 gap-6"
                    >
                        {index % 2 === 0 ? (
                            <>
                                {/* Icon Section - Hidden on mobile */}
                                <div className="hidden md:flex w-full md:w-5/12 justify-center md:justify-end">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="cursor-pointer"
                                        onClick={() => handleSolutionClick(solution.link)}
                                    >
                                        {solution.icon}
                                    </motion.div>
                                </div>

                                {/* Text Section - Centered on mobile */}
                                <div className="w-full md:w-5/12 text-center">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{solution.title}</h3>
                                    <p className="mt-2 text-gray-600 mb-6">{solution.description}</p>
                                    
                                    {/* Features List */}
                                    <div className="space-y-2">
                                        {solution.features.map((feature, featureIndex) => (
                                            <div key={featureIndex} className="flex items-center justify-center md:justify-start text-sm text-gray-600">
                                                <div className="hidden md:block w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={() => handleSolutionClick(solution.link)}
                                        className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                    >
                                        Try Now
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Text Section - Centered on mobile */}
                                <div className="w-full md:w-5/12 text-center md:text-right">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{solution.title}</h3>
                                    <p className="mt-2 text-gray-600 mb-6">{solution.description}</p>
                                    
                                    {/* Features List */}
                                    <div className="space-y-2">
                                        {solution.features.map((feature, featureIndex) => (
                                            <div key={featureIndex} className="flex items-center justify-center md:justify-end text-sm text-gray-600">
                                                {feature}
                                                <div className="hidden md:block w-2 h-2 bg-blue-500 rounded-full ml-3"></div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={() => handleSolutionClick(solution.link)}
                                        className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                    >
                                        Try Now
                                    </button>
                                </div>

                                {/* Icon Section - Hidden on mobile */}
                                <div className="hidden md:flex w-full md:w-5/12 justify-center md:justify-start">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="cursor-pointer"
                                        onClick={() => handleSolutionClick(solution.link)}
                                    >
                                        {solution.icon}
                                    </motion.div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
                <h4 className="text-2xl md:text-4xl font-bold text-gray-400 mb-4">
                    Ready to transform your digital presence?
                </h4>
                <p className="text-lg text-gray-600 mb-6">
                    Get started with our AI solutions today and see the difference
                </p>
                <button
                    onClick={() => router.push("/contact")}
                    className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all text-lg font-semibold"
                >
                    Schedule a Demo
                </button>
            </div>
        </section>
    );
};

export default Solutions;
