"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert, Cpu, Activity, BarChart3, Map, Zap, CloudLightning } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Hero Section embedded in Video */}
      <section className="relative w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Video drives the minimum height or takes full height of content */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-auto object-cover pointer-events-none"
        >
          <source src="/urban-flood-bg.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-b from-black/20 via-black/40 to-[#050505] pointer-events-none" />

        {/* Hero Content positioned absolutely within the video's bounds */}
        <div className="absolute inset-0 z-10 w-full flex flex-col items-center justify-center text-center px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs md:text-sm font-medium mb-4 md:mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Live: India Innovates Hackathon 2026 Engine
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-outfit font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 mb-4 md:mb-6 drop-shadow-xl leading-tight"
          >
            Predict Urban Floods. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-lg">
              Deploy Resources Proactively.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm md:text-lg lg:text-xl text-slate-200 max-w-3xl mb-8 md:mb-12 font-light leading-relaxed drop-shadow-md"
          >
            Saving over <span className="font-semibold text-white">₹1,550 crore in annual losses</span> by moving from reactive relief to proactive geospatial intelligence. Built on 30 years of IMD historical records to identify 2,500+ micro-hotspots. Stop reacting to floods. Start anticipating them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/dashboard"
              className="px-6 py-3 md:px-8 md:py-4 rounded-xl bg-white text-black font-semibold tracking-wide hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center gap-2"
            >
              Launch GIS Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/analytics"
              className="px-6 py-3 md:px-8 md:py-4 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <BarChart3 className="w-5 h-5" /> View Readiness Scores
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Problem Context Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-outfit font-bold mb-6 text-white">
              The Systemic Failure of <span className="text-red-400">Reactive Relief</span>
            </h2>
            <div className="space-y-6 text-slate-400">
              <p className="leading-relaxed">
                The rapid urbanization of Indian cities has fundamentally altered natural watersheds. Unplanned expansion and impervious surfaces correlate directly with peak hydrograph intensification. In major watersheds, up to 90% of precipitation translates directly into surface runoff.
              </p>
              <p className="leading-relaxed">
                Our legacy century-old drainage systems were designed for 25 mm/hr intensities—thresholds routinely breached in our current climate reality. While city-scale models like IFLOWS provide general warnings, they lack the hyper-local granular resolution necessary to deploy a municipal "Monsoon Squad."
              </p>
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 backdrop-blur-sm">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" /> The Cost of Inaction
                </h3>
                <p className="text-sm">
                  Without proactive intelligence, cities leak billions in productivity, suffer railway paralysis, and breed post-monsoon pathogenic outbreaks in vulnerable dense wards.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square md:aspect-video lg:aspect-square bg-gradient-to-br from-slate-900 to-[#0A0A0A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative group">
              {/* Abstract Data Visualization Mockup */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80')] opacity-30 mix-blend-luminosity bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                    <CloudLightning className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">SCS-CN Runoff</div>
                    <div className="text-cyan-400 font-mono text-sm">Eq: Q = (P-Ia)²/(P-Ia+S)</div>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Technology Pillars */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-outfit font-bold mb-6 text-white">
            A Multi-Layered Intelligence <span className="text-cyan-400">Architecture</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Fusing physics-based hydrology with hybridized AI to deliver near-real-time insights across 2,500 computational nodes simultaneously.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Map,
              title: "Hyper-Granular Topography",
              description: "Mapping micro-depressions and natural sinks. We model flow across a high-resolution Topographic Control Index (TCI) to prevent uncaptured ponding.",
              color: "cyan"
            },
            {
              icon: Cpu,
              title: "SOP-Linked Prediction",
              description: "We augment heavy SCS-CN numerical simulations with an LSTM Neural Network. When the AI predicts a flood, it triggers an SOP telling the Monsoon Squad exactly which 500 GPM pump to deploy and where.",
              color: "blue"
            },
            {
              icon: Activity,
              title: "IoT & CV Fusion",
              description: "Integrating low-cost ultrasonic sensors and Computer Vision APIs to monitor drainage bottlenecks, instantly reducing capacity metrics on the fly.",
              color: "purple"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-${feature.color}-500/20`}>
                <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Readiness Score Breakdown */}
      <section className="w-full bg-gradient-to-b from-[#0A0A0A] to-black py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="w-full lg:w-1/2"
            >
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full" />
                <h3 className="text-xl font-medium text-slate-300 mb-6">Ward E (Byculla) Example</h3>
                <div className="space-y-6">
                  {[
                    { label: "Resistance Indicator (Pipelines, Desilting)", value: "32%", color: "bg-red-500" },
                    { label: "Adaptability Indicator (Pop. Density, Edu)", value: "65%", color: "bg-yellow-500" },
                    { label: "Recovery Indicator (Healthcare, GDP)", value: "88%", color: "bg-emerald-500" }
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2 text-slate-400">
                        <span>{stat.label}</span>
                        <span className="text-white font-mono">{stat.value}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: stat.value }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className={`h-full ${stat.color} rounded-full`} 
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-6 mt-6 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-white font-outfit font-bold text-lg">Total Readiness Score</span>
                    <span className="text-3xl font-bold text-red-400 font-mono">38 / 100</span>
                  </div>
                  <div className="py-2 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                    Critical Action Required: Deploy Mobile Pumps
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2"
            >
              <h2 className="text-3xl md:text-5xl font-outfit font-bold mb-6 text-white">
                The Pre-Monsoon <br/> <span className="text-purple-400">Readiness Score</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Rather than treating all wards equally, we implement an AHP-Entropy Weight Method to grade every ward across three pillars: Resistance, Adaptability, and Recovery.
              </p>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Determine Thresholds:</strong> Wards scoring &lt; 40 trigger automated high-risk alerts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Socio-Economic Integration:</strong> Fusing population density and disaster education grades with physical pipeline data.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Sectoral Impact Routing:</strong> Identifies vulnerable health clinics and railway culverts falling within high-risk polygon boundaries.</span>
                </li>
              </ul>
            </motion.div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/10 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-outfit font-bold text-white mb-6">
            Ready to Build <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Resilient Megacities?</span>
          </h2>
          <p className="text-slate-300 text-lg md:text-xl max-w-4xl mx-auto mb-10 leading-relaxed font-light">
            "We aren't just mapping floods; we are auditing city resilience. By identifying 2,500+ micro-hotspots, we provide the granularity that existing systems lack, and by using computer vision to catch contractor irregularities, we've already proven a potential recovery of ₹13 crore in a single city pilot. This is not a project; it is the new digital constitution for urban India."
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-white text-black font-bold text-lg hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.4)]"
          >
            Access the Engine
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
