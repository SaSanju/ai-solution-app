"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaCheckCircle, FaCrown } from "react-icons/fa";

const SubscriptionSuccess = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [paymentId, setPaymentId] = useState("");
    const [subscriptionId, setSubscriptionId] = useState("");

    useEffect(() => {
        const paymentIdParam = searchParams.get('razorpay_payment_id');
        const subscriptionIdParam = searchParams.get('razorpay_subscription_id');
        
        if (paymentIdParam) {
            setPaymentId(paymentIdParam);
        }
        if (subscriptionIdParam) {
            setSubscriptionId(subscriptionIdParam);
        }
        setIsLoading(false);
    }, [searchParams]);

    const handleContinue = () => {
        router.push('/');
    };

    if (isLoading) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 px-4">
            <div className="max-w-lg mx-auto text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
                >
                    {/* Success Icon */}
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheckCircle className="text-white text-2xl" />
                    </div>

                    {/* Crown Icon */}
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCrown className="text-white text-lg" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
                        Welcome to Pro! 🎉
                    </h1>

                    {/* Message */}
                    <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
                        Your subscription has been activated successfully. You now have unlimited access to all our AI features!
                    </p>

                    {/* Features List */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm">Your Pro Benefits:</h3>
                        <div className="space-y-2 text-left">
                            <div className="flex items-center">
                                <FaCheckCircle className="text-green-500 mr-2 text-xs" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">Unlimited caption generation</span>
                            </div>
                            <div className="flex items-center">
                                <FaCheckCircle className="text-green-500 mr-2 text-xs" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">Unlimited hashtag generation</span>
                            </div>
                            <div className="flex items-center">
                                <FaCheckCircle className="text-green-500 mr-2 text-xs" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">Priority support</span>
                            </div>
                            <div className="flex items-center">
                                <FaCheckCircle className="text-green-500 mr-2 text-xs" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">Advanced AI models</span>
                            </div>
                            <div className="flex items-center">
                                <FaCheckCircle className="text-green-500 mr-2 text-xs" />
                                <span className="text-xs text-gray-700 dark:text-gray-300">Export & analytics</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info (for debugging) */}
                    {paymentId && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-6">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Payment ID: {paymentId}
                            </p>
                            {subscriptionId && (
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Subscription ID: {subscriptionId}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                        Start Creating Content
                    </button>

                    {/* Additional Info */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        You'll receive a confirmation email shortly. You can manage your subscription anytime from your account settings.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default SubscriptionSuccess; 