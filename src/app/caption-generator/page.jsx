"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdContentCopy, MdRefresh } from "react-icons/md";
import { useSession } from "next-auth/react";
import SubscriptionModal from "../components/SubscriptionModal";

const CaptionGenerator = () => {
    const { data: session } = useSession();
    const [formData, setFormData] = useState({
        productName: "",
        productDescription: "",
        tone: "",
        goal: ""
    });
    
    const [captions, setCaptions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [usageInfo, setUsageInfo] = useState({ current: 0, limit: 5 });

    const tones = ["Fun", "Luxury", "Minimal", "Emotional"];
    const goals = ["Promote", "Restock", "Sale", "Launch"];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch current usage when user is authenticated
    useEffect(() => {
        if (session?.user?.id) {
            fetchCurrentUsage();
        }
    }, [session]);

    const fetchCurrentUsage = async () => {
        try {
            const response = await fetch('/api/usage/current', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feature: 'caption' })
            });

            if (response.ok) {
                const data = await response.json();
                setUsageInfo({ 
                    current: data.isPro ? '∞' : data.currentUsage, 
                    limit: data.limit 
                });
            }
        } catch (error) {
            console.error('Error fetching usage:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateCaptions = async () => {
        if (!session) {
            alert("Please sign in to use this feature");
            return;
        }

        if (!formData.productName || !formData.productDescription || !formData.tone || !formData.goal) {
            alert("Please fill in all fields");
            return;
        }

        setIsGenerating(true);
        
        try {
            // First, track usage and check limits
            const usageResponse = await fetch('/api/usage/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feature: 'caption' })
            });

            const usageData = await usageResponse.json();

            if (!usageResponse.ok) {
                if (usageData.upgradeRequired) {
                    setUsageInfo({ current: usageData.currentUsage, limit: usageData.limit });
                    setShowSubscriptionModal(true);
                    return;
                }
                throw new Error(usageData.error || 'Failed to track usage');
            }

            // Update usage info
            setUsageInfo({ 
                current: usageData.isPro ? '∞' : usageData.currentUsage, 
                limit: usageData.limit 
            });

            // Generate captions
            const response = await fetch('/api/generate-caption', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productName: formData.productName,
                    productDescription: formData.productDescription,
                    tone: formData.tone,
                    goal: formData.goal
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate captions');
            }

            if (data.success && data.captions) {
                setCaptions(data.captions);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error generating captions:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const regenerateCaptions = () => {
        generateCaptions();
    };

    // Don't render until client-side
    if (!isMounted) {
        return (
            <section className="min-h-screen bg-gradient-to-b from-white to-[#ebf5ff] py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            AI Caption Generator
                        </h1>
                        <p className="text-xl text-gray-600">
                            Create engaging social media captions in seconds
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded mb-4"></div>
                            <div className="h-32 bg-gray-200 rounded mb-4"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="h-12 bg-gray-200 rounded"></div>
                                <div className="h-12 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-b from-white to-[#ebf5ff] py-24 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        AI Caption Generator
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                        Create engaging social media captions in seconds
                    </p>
                    {session && (
                        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                            <span>Usage: {usageInfo.current} / {usageInfo.limit}</span>
                        </div>
                    )}
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Product Name
                            </label>
                            <input
                                type="text"
                                value={formData.productName}
                                onChange={(e) => handleInputChange("productName", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                placeholder="Enter your product name..."
                            />
                        </div>

                        {/* Product Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Product Description
                            </label>
                            <textarea
                                value={formData.productDescription}
                                onChange={(e) => handleInputChange("productDescription", e.target.value)}
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                placeholder="Describe your product..."
                            />
                        </div>

                        {/* Tone Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tone
                            </label>
                            <select
                                value={formData.tone}
                                onChange={(e) => handleInputChange("tone", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">Select tone...</option>
                                {tones.map(tone => (
                                    <option key={tone} value={tone} className="text-black dark:text-white">{tone}</option>
                                ))}
                            </select>
                        </div>

                        {/* Goal Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Goal
                            </label>
                            <select
                                value={formData.goal}
                                onChange={(e) => handleInputChange("goal", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">Select goal...</option>
                                {goals.map(goal => (
                                    <option key={goal} value={goal} className="text-black dark:text-white">{goal}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={generateCaptions}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Generating...
                                </div>
                            ) : (
                                session ? "Generate Captions" : "Sign In to Generate"
                            )}
                        </button>
                        {!session && (
                            <p className="text-sm text-gray-500 mt-2">
                                Free users get 5 generations per day
                            </p>
                        )}
                    </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {captions.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
                                Generated Captions
                            </h2>
                            
                            {captions.map((caption, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
                                >
                                    <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                                        {caption}
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => copyToClipboard(caption)}
                                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <MdContentCopy size={18} />
                                            Copy
                                        </button>
                                        {index === 0 && (
                                            <button
                                                onClick={regenerateCaptions}
                                                className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <MdRefresh size={18} />
                                                Regenerate
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Subscription Modal */}
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                currentUsage={usageInfo.current}
                limit={usageInfo.limit}
                feature="caption"
            />
        </section>
    );
};

export default CaptionGenerator; 