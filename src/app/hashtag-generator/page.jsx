"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdContentCopy, MdRefresh } from "react-icons/md";

const HashtagGenerator = () => {
    const [formData, setFormData] = useState({
        productName: "",
        productCategory: "",
        targetAudience: ""
    });
    
    const [hashtags, setHashtags] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const categories = ["Fashion", "Beauty", "Technology", "Food", "Fitness", "Travel", "Home", "Business", "Education", "Entertainment"];
    const audiences = ["Teenagers", "Young Adults", "Professionals", "Parents", "Students", "Seniors", "Fitness Enthusiasts", "Tech Savvy", "Luxury Buyers", "Budget Conscious"];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateHashtags = async () => {
        if (!formData.productName || !formData.productCategory || !formData.targetAudience) {
            alert("Please fill in all fields");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-hashtags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productName: formData.productName,
                    productCategory: formData.productCategory,
                    targetAudience: formData.targetAudience
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate hashtags');
            }
            if (data.success && data.hashtags) {
                setHashtags(data.hashtags);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error generating hashtags:', error);
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

    const copyAllHashtags = async () => {
        const allHashtags = hashtags.join(' ');
        await copyToClipboard(allHashtags);
    };

    const regenerateHashtags = () => {
        // Call the same API as generateHashtags to fetch new hashtags
        generateHashtags();
    };

    // Don't render until client-side
    if (!isMounted) {
        return (
            <section className="min-h-screen bg-gradient-to-b from-white to-[#ebf5ff] py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            AI Hashtag Generator
                        </h1>
                        <p className="text-xl text-gray-600">
                            Create trending hashtags for your social media posts
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded mb-4"></div>
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
                        AI Hashtag Generator
                    </h1>
                    <p className="text-xl text-gray-600">
                        Create trending hashtags for your social media posts
                    </p>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your product name..."
                            />
                        </div>

                        {/* Product Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Product Category
                            </label>
                            <select
                                value={formData.productCategory}
                                onChange={(e) => handleInputChange("productCategory", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">Select category...</option>
                                {categories.map(category => (
                                    <option key={category} value={category} className="text-black dark:text-white">{category}</option>
                                ))}
                            </select>
                        </div>

                        {/* Target Audience */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Target Audience
                            </label>
                            <select
                                value={formData.targetAudience}
                                onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">Select audience...</option>
                                {audiences.map(audience => (
                                    <option key={audience} value={audience} className="text-black dark:text-white">{audience}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={generateHashtags}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Generating...
                                </div>
                            ) : (
                                "Generate Hashtags"
                            )}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {hashtags.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Generated Hashtags
                                </h2>
                                <div className="flex gap-3">
                                    <button
                                        onClick={copyAllHashtags}
                                        className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <MdContentCopy size={18} />
                                        Copy All
                                    </button>
                                    <button
                                        onClick={regenerateHashtags}
                                        className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <MdRefresh size={18} />
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {hashtags.map((hashtag, index) => (
                                        <motion.span
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium hover:from-blue-200 hover:to-purple-200 transition-all cursor-pointer"
                                            onClick={() => copyToClipboard(hashtag)}
                                            title="Click to copy"
                                        >
                                            {hashtag}
                                        </motion.span>
                                    ))}
                                </div>
                                
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        💡 <strong>Tip:</strong> Click on any hashtag to copy it individually, or use "Copy All" to copy all hashtags at once!
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default HashtagGenerator; 