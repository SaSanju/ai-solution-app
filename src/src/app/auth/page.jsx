"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaLock, FaExclamationCircle, FaGoogle } from "react-icons/fa";
import NodeNetworkBackground from "../components/NodeNetworkBackground";

const errorMessages = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  'User already exists': "An account with this email already exists. Please login or use a different email.",
  'Missing fields': "Please fill in all fields.",
  default: "Something went wrong. Please try again later."
};

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const router = useRouter();

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const res = await signIn("credentials", {
      redirect: false,
      email: loginEmail,
      password: loginPassword,
    });
    if (res.error) {
      setLoginError(errorMessages[res.error] || errorMessages.default);
    } else {
      router.push("/");
    }
  };

  // Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess(false);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSignupError(errorMessages[data.error] || errorMessages.default);
    } else {
      setSignupSuccess(true);
      setTimeout(() => {
        setTab("login");
        setSignupSuccess(false);
      }, 1500);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-[#ebf5ff] dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <NodeNetworkBackground />
      <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-3 w-full max-w-[220px] mt-[10vh] mx-auto relative z-10 overflow-hidden animate-fadeIn">
        {/* Tabs */}
        <div className="flex mb-3">
          <button
            className={`flex-1 py-2 text-xs font-bold rounded-tl-2xl rounded-bl-2xl transition-colors duration-200 ${tab === "login" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-xs font-bold rounded-tr-2xl rounded-br-2xl transition-colors duration-200 ${tab === "signup" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            onClick={() => setTab("signup")}
          >
            Sign Up
          </button>
        </div>
        {/* Login Form */}
        {tab === "login" && (
          <>
            <div className="flex flex-col items-center mb-4">
              <h3 className="text-2xl font-bold text-center mb-1 text-gray-800 dark:text-white tracking-tight">Welcome Back</h3>
              <p className="text-gray-500 dark:text-gray-300 text-center text-xs">Login to your account</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4 mt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs"><FaEnvelope size={12} /></span>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 transition-all text-xs" placeholder="Enter your email..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs"><FaLock size={12} /></span>
                  <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 transition-all text-xs" placeholder="Enter your password..." />
                </div>
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-1 text-xs font-medium animate-shake mt-1">
                  <FaExclamationCircle />
                  <span>{loginError}</span>
                </div>
              )}
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-bold text-base shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-xs">Login</button>
              {/* OR separator */}
              <div className="flex items-center my-2">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="mx-2 text-xs text-gray-400 dark:text-gray-500 font-semibold">or</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            </form>
            <div className="mt-4 flex flex-col gap-2">
              <button onClick={() => signIn("google")}
                className="w-full flex items-center justify-center gap-2 bg-[#ea4335] hover:bg-[#c5221f] text-white px-4 py-2 rounded-lg transition-all duration-300 font-semibold shadow-sm hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ea4335] focus:ring-offset-2 text-xs">
                <FaGoogle />
                Login with Google
              </button>
              <p className="text-center text-xs text-gray-600 dark:text-gray-300 mt-2">Don't have an account? <button className="text-blue-600 hover:underline font-semibold" onClick={() => setTab('signup')}>Sign up</button></p>
            </div>
          </>
        )}
        {/* Signup Form */}
        {tab === "signup" && (
          <>
            <div className="flex flex-col items-center mb-4">
              <h3 className="text-2xl font-bold text-center mb-1 text-gray-800 dark:text-white tracking-tight">Create Account</h3>
              <p className="text-gray-500 dark:text-gray-300 text-center text-xs">Sign up to get started</p>
            </div>
            <form onSubmit={handleSignup} className="space-y-4 mt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs"><FaUser size={12} /></span>
                  <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} required className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 transition-all text-xs" placeholder="Enter your username..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs"><FaEnvelope size={12} /></span>
                  <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 transition-all text-xs" placeholder="Enter your email..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs"><FaLock size={12} /></span>
                  <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 transition-all text-xs" placeholder="Enter your password..." />
                </div>
              </div>
              {signupError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-1 text-xs font-medium animate-shake mt-1">
                  <FaExclamationCircle />
                  <span>{signupError}</span>
                </div>
              )}
              {signupSuccess && <div className="text-green-600 bg-green-50 dark:bg-green-900/30 rounded-lg px-3 py-1 text-xs font-medium text-center animate-fadeIn">Signup successful! You can now login.</div>}
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-bold text-base shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-xs">Sign Up</button>
            </form>
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-center text-xs text-gray-600 dark:text-gray-300 mt-2">Already have an account? <button className="text-blue-600 hover:underline font-semibold" onClick={() => setTab('login')}>Login</button></p>
            </div>
          </>
        )}
      </div>
    </section>
  );
} 