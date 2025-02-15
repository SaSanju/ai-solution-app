"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Dummy data (replace with dynamic data in the future)
const blogPosts = [
  { title: "AI Trends in 2025", url: "/blogs/ai-trends-2025", excerpt: "Explore the latest AI trends shaping the future." },
  { title: "How AI is Transforming Marketing", url: "/blogs/ai-marketing", excerpt: "Learn how AI is revolutionizing digital marketing strategies." },
];

const youtubeVideos = [
  {
    category: "Healthcare",
    title: "Fostering holistic medical care with AI health assistant",
    description:
      "Digitalize medical care with an AI health assistant app that analyzes patient’s health based on their medical history and past consultations",
    tags: ["C++", "Dall E 2", "Dall E 3", "GPT-4o", "RAG"],
    url: "https://www.youtube.com/watch?v=0C4JaEiuzkc&t=5s",
    image: "https://kadvwdsvp6r2p8kv.public.blob.vercel-storage.com/AI%20Agent-X0hj18hmukECpzRTABMVxQAOVG4eFb.jpeg",
  },
  {
    category: "Food & Travel",
    title: "Simplify traveling with an AI trip planner",
    description:
      "Replace manual and fragmented travel planning approach with an AI-powered trip planner that customizes the itinerary based on your specifications",
    tags: ["ChatGPT-4o APIs", "Flutter", "Gemini API", "Google Maps API", "RAG"],
    url: "https://www.youtube.com/watch?v=0C4JaEiuzkc&t=5s",
    image: "https://kadvwdsvp6r2p8kv.public.blob.vercel-storage.com/AI%20Agent-X0hj18hmukECpzRTABMVxQAOVG4eFb.jpeg",
  },
];

const BlogsVideos = () => {
  return (
    <section className="p-10 bg-gradient-to-r from-blue-500 to-purple-700 text-white">
      <h1 className="text-4xl font-bold text-center mb-6">Blogs & Videos</h1>

      {/* YouTube Videos Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-semibold mb-4">🎥 Featured Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {youtubeVideos.map((video, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              {/* Image Section */}
              <div className="relative">
                <img
                  src={video.image}
                  alt={video.title}
                  className="w-full h-64 object-cover"
                />
                <span className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  ✨ AI Powered
                </span>
              </div>

              {/* Content Section */}
              <div className="p-4">
                <span className="bg-black text-white text-xs px-2 py-1 rounded">
                  {video.category}
                </span>
                <h3 className="text-lg font-bold mt-2">{video.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{video.description}</p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {video.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Summarize Button */}
                <div className="mt-3">
                  <a href={video.url} target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 flex items-center gap-1 text-sm font-medium">
                    🎥 Watch Full Video
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Blog Posts Section */}
      <div>
        <h2 className="text-3xl font-semibold mb-4">📝 Latest Blog Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              className="bg-white text-black p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-2xl font-semibold">{post.title}</h3>
              <p className="text-gray-600 mt-2">{post.excerpt}</p>
              <Link href={post.url} className="text-blue-600 font-semibold mt-4 inline-block">
                Read More →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogsVideos;
