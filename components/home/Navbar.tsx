"use client"
import { useEffect, useState } from "react";
import { motion } from "motion/react"
import NavLink from "./NavLink";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#06060e]/80 backdrop-blur-xl border-b border-white/5 shadow-xl" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            vproof
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <NavLink>How It Works</NavLink>
          <NavLink>For Business</NavLink>
          <NavLink>Pricing</NavLink>
          <NavLink>Blog</NavLink>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/login")} className="text-[13px] text-white/50 hover:text-white transition-colors hidden md:block">
            Sign In
          </button>
          <button onClick={() => router.push("/signup")} className="rounded-full bg-violet-600 px-5 py-2 text-[13px] font-semibold text-white hover:bg-violet-500 transition-colors">
            Get Verified →
          </button>
        </div>
      </div>
    </motion.nav>
  );
}