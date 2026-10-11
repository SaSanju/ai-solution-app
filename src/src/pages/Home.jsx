"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  return (
    <section className="flex flex-col md:flex-row items-center justify-center h-screen bg-gradient-to-b from-purple-500 to-blue-500 text-white text-center p-10">
      <div className="md:w-1/2">
        <h1 className="text-5xl font-extrabold">Become an AI-First Company</h1>
        <p className="mt-4 text-xl">We help companies implement AI to scale.</p>
        <button
          className="mt-6 px-6 py-3 bg-white text-blue-500 font-bold rounded-full hover:bg-gray-200 transition"
          onClick={() => router.push("/contact")}
        >
          Join Us
        </button>
      </div>
      <div className="hidden md:flex md:w-1/2 justify-center">
        <Image
          src="/assets/images/Kritrim_Solutions_banner.jpeg"
          width={400}
          height={300}
          alt="AI Company"
          className="rounded-lg shadow-lg"
        />
      </div>
    </section>
  );
};

export default Home;