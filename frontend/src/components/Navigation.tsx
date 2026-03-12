"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Droplets, Map, BarChart3, Activity } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Droplets },
    { href: "/dashboard", label: "Dashboard", icon: Map },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/iot", label: "IoT Sensors", icon: Activity },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex flex-col">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center p-0.5 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all border border-white/10">
              <img src="/jal-satark-logo.png" alt="Jal Satark Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="font-outfit font-bold text-2xl tracking-tight text-white/90 leading-none">
                Jal<span className="text-cyan-400">Satark</span>
              </span>
              <span className="text-xs text-cyan-400/80 font-medium tracking-wide mt-1.5">जल सतर्क : आपदा से पहले, सुरक्षा की तैयारी</span>
            </div>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-5 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive ? "text-cyan-400" : "text-slate-300 hover:text-white"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {link.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
        
        {/* <div className="flex items-center gap-4">
          <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-base font-semibold text-white hover:bg-white/10 transition-colors">
            Login
          </button>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-base font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all">
            Get Alerts
          </button>
        </div> */}
      </div>
    </nav>
  );
}
