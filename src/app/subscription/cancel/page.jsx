"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaTimesCircle, FaArrowLeft } from "react-icons/fa";

const SubscriptionCancel = () => {
    const router = useRouter();

    const handleGoBack = () => {
        router.push('/');
    };

    const handleTryAgain = () => {
        router.push('/solutions');
    };

    return (
        <section className="min-h-screen bg-gradient-to-b from-white to-[#ebf5ff] py-24 px-4">
            <div className="max-w-2xl mx-auto text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                >
                    {/* Cancel Icon */}
                    <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaTimesCircle className="text-white text-3xl" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Subscription Cancelled
                    </h1>

                    {/* Message */}
                    <p className="text-xl text-gray-600 mb-8">
                        No worries! You can continue using our free features. You can upgrade to Pro anytime when you're ready.
                    </p>

                    {/* Free Features */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h3 className="font-semibold text-gray-800 mb-4">Free Features Available:</h3>
                        <div className="space-y-3 text-left">
                            <div className="flex items-center">
                                <FaArrowLeft className="text-blue-500 mr-3" />
                                <span className="text-gray-700">5 caption generations per day</span>
                            </div>
                            <div className="flex items-center">
                                <FaArrowLeft className="text-blue-500 mr-3" />
                                <span className="text-gray-700">5 hashtag generations per day</span>
                            </div>
                            <div className="flex items-center">
                                <FaArrowLeft className="text-blue-500 mr-3" />
                                <span className="text-gray-700">Basic AI models</span>
                            </div>
                            <div className="flex items-center">
                                <FaArrowLeft className="text-blue-500 mr-3" />
                                <span className="text-gray-700">Community support</span>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-4">
                        <button
                            onClick={handleTryAgain}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        >
                            Try Pro Again
                        </button>
                        
                        <button
                            onClick={handleGoBack}
                            className="w-full bg-gray-100 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-all duration-300"
                        >
                            Continue with Free Plan
                        </button>
                    </div>

                    {/* Additional Info */}
                    <p className="text-sm text-gray-500 mt-6">
                        You can upgrade to Pro anytime from your account settings or when you reach your daily limits.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default SubscriptionCancel; 