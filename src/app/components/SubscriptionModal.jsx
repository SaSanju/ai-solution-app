"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCrown, FaCheck, FaTimes, FaInfinity } from "react-icons/fa";

const SubscriptionModal = ({ isOpen, onClose, currentUsage, limit, feature }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Razorpay payment link
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create payment link');
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      alert('Failed to start payment process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaCrown className="text-white text-lg" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Upgrade to Pro
              </h2>
              <p className="text-sm text-gray-600">
                You've reached your daily limit of {limit} {feature} generations
              </p>
            </div>

            {/* Usage Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">Today's Usage</span>
                <span className="text-xs font-semibold text-gray-800">
                  {currentUsage} / {limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentUsage / limit) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Pro Features */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">Pro Features:</h3>
              <div className="space-y-1.5">
                <div className="flex items-center">
                  <FaCheck className="text-green-500 mr-2 text-xs" />
                  <span className="text-xs text-gray-700">Unlimited {feature} generation</span>
                </div>
                <div className="flex items-center">
                  <FaCheck className="text-green-500 mr-2 text-xs" />
                  <span className="text-xs text-gray-700">Priority support</span>
                </div>
                <div className="flex items-center">
                  <FaCheck className="text-green-500 mr-2 text-xs" />
                  <span className="text-xs text-gray-700">Advanced AI models</span>
                </div>
                <div className="flex items-center">
                  <FaCheck className="text-green-500 mr-2 text-xs" />
                  <span className="text-xs text-gray-700">Export & analytics</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  ₹999
                </div>
                <div className="text-sm text-gray-600">per month</div>
                <div className="text-xs text-gray-500 mt-1">
                  Cancel anytime • 7-day free trial
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Start Free Trial"
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 text-sm"
              >
                Maybe Later
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal; 