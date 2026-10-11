"use client";
import { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", country: "" });
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // New state to track form submission

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    if (res.ok) {
      setMessage("✅ Form submitted successfully!");
      setIsSubmitted(true); // Hide the form
    } else {
      setMessage(result.error || "❌ Failed to submit form.");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto text-white">
      {isSubmitted ? (
        <p className="text-green-400 text-center text-lg">{message}</p>
      ) : (
        <>
          {message && <p className="text-yellow-400 mb-4">{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name (Required)"
              required
              className="w-full p-3 border rounded bg-gray-700 text-white"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email (Required)"
              required
              className="w-full p-3 border rounded bg-gray-700 text-white"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full p-3 border rounded bg-gray-700 text-white"
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country (Required)"
              required
              className="w-full p-3 border rounded bg-gray-700 text-white"
            />
            <button
              type="submit"
              className="w-full bg-yellow-500 text-black p-3 rounded hover:bg-yellow-600 transition"
            >
              Submit
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ContactForm;
