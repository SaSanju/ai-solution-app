"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLoader } from "../context/LoaderContext";

const BlogsVideos = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [setError] = useState(null);
  const { setLoading } = useLoader();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/contents");
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setBlogPosts(data.blogs);
        setYoutubeVideos(data.videos);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
                {/* <span className="bg-black text-white text-xs px-2 py-1 rounded">
                  {video.category}
                </span> */}
                <h3 className="text-black font-bold mt-2">{video.title}</h3>
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
              <Link href={post.url} target="_blank" className="text-blue-600 font-semibold mt-4 inline-block">
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
