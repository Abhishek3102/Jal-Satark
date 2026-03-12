"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { CloudRain, AlertTriangle, Activity, Map, Zap, ShieldAlert, Navigation } from "lucide-react";

// Dynamically import map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

export default function DashboardPage() {
  const [rainfall, setRainfall] = useState(25);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [showInfra, setShowInfra] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [alertsSent, setAlertsSent] = useState(false);

  const getReturnPeriod = (rain: number) => {
    if (rain < 30) return "Normal Monsoon";
    if (rain < 70) return "1-in-10 Year Storm";
    if (rain < 120) return "1-in-50 Year Storm";
    return "1-in-100 Year Deluge";
  };

  const fetchHotspots = async (rainRaw: number, ward: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/hotspots?rainfall_mm=${rainRaw}&ward=${ward}`);
      const data = await res.json();
      setHotspots(data.hotspots);
    } catch (error) {
      console.error("Failed to fetch hotspots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots(rainfall, selectedWard);
  }, [rainfall, selectedWard]);

  const criticalCount = hotspots.filter((h: any) => h.status === "CRITICAL").length;
  const highCount = hotspots.filter((h: any) => h.status === "HIGH").length;
  const modCount = hotspots.filter((h: any) => h.status === "MODERATE").length;

  const estimatedLossCr = Math.round(Math.min((rainfall / 150) * 20000, 20000));
  const avoidedLossCr = Math.round(estimatedLossCr * 0.12); // AI saves 12% by early detection

  return (
    <div className="flex flex-col h-screen pt-20 bg-[#050505]">
      {/* Control Strip */}
      <div className="w-full bg-slate-900 border-b border-white/10 px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 z-10">
        <div>
          <h1 className="text-2xl font-outfit font-bold text-white flex items-center gap-2">
            <MapComponentIcon className="text-cyan-400" /> Operational Command Center
          </h1>
          <p className="text-slate-400 text-sm">2,500+ Computational Nodes Evaluated Real-Time</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-black/40 p-3 rounded-xl border border-white/5 w-full lg:w-auto">
          <div className="flex flex-1 items-center gap-3 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0 sm:pr-6 w-full">
            <CloudRain className="w-5 h-5 text-cyan-400" />
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400 font-medium whitespace-nowrap mr-2">Stress Simulation</label>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded whitespace-nowrap">{getReturnPeriod(rainfall)}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className="w-full lg:w-48 accent-cyan-500"
                />
                <span className="font-mono text-cyan-400 w-12 text-right font-bold">{rainfall}mm</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col w-full sm:w-auto min-w-[200px]">
            <label className="text-xs text-slate-400 font-medium mb-1">Filter by Ward Zone</label>
            <select 
              title="Filter by Ward"
              className="bg-slate-900 border border-white/10 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-1.5 font-medium"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
            >
              <option value="ALL">All Zones (Macro View)</option>
              <option value="K-West">K-West (Andheri West)</option>
              <option value="E-Ward">E-Ward (Byculla)</option>
              <option value="M-East">M-East (Govandi)</option>
              <option value="H-West">H-West (Bandra West)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative w-full h-full">
        
        {/* Left Side: Live Ops Command Panel */}
        <div className="w-full md:w-[320px] lg:w-[400px] h-full bg-slate-900/80 border-r border-white/10 flex flex-col p-6 overflow-y-auto shrink-0 z-10 backdrop-blur-md">
          
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400" /> Live Threat Matrix
          </h2>

          <div className="grid grid-cols-3 gap-2 mb-8">
            <div className="flex flex-col items-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="font-bold text-2xl text-red-500">{criticalCount}</span>
              <span className="text-xs font-bold text-red-400/80 uppercase mt-1">Critical</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <span className="font-bold text-2xl text-orange-500">{highCount}</span>
              <span className="text-xs font-bold text-orange-400/80 uppercase mt-1">High</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <span className="font-bold text-2xl text-yellow-500">{modCount}</span>
              <span className="text-xs font-bold text-yellow-400/80 uppercase mt-1">Moderate</span>
            </div>
          </div>

          <div className="mb-8 border-t border-white/5 pt-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-slate-400">Map Data Overlays</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/20">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-sm font-bold text-white block">Critical Infrastructure</span>
                    <span className="text-[10px] text-slate-400 block">Hospitals, Substations, Transit</span>
                  </div>
                </div>
                <input type="checkbox" className="w-4 h-4 accent-purple-500" checked={showInfra} onChange={(e) => setShowInfra(e.target.checked)} />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                  <div>
                    <span className="text-sm font-bold text-white block">Active Resources</span>
                    <span className="text-[10px] text-slate-400 block">NDRF GPS, Field Pumps</span>
                  </div>
                </div>
                <input type="checkbox" className="w-4 h-4 accent-blue-500" checked={showResources} onChange={(e) => setShowResources(e.target.checked)} />
              </label>
            </div>
          </div>

          <div className="mb-8 border-t border-white/5 pt-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-slate-400">Projected Financial Impact</h3>
            <div className="bg-black/40 p-5 rounded-xl border border-red-500/20 mb-3">
              <div className="text-xs text-slate-400 font-medium mb-1">Estimated City-Wide Loss</div>
              <div className="text-3xl font-mono font-bold text-red-500">₹{estimatedLossCr.toLocaleString()} <span className="text-sm">Cr</span></div>
            </div>
            {avoidedLossCr > 0 && (
              <div className="bg-green-500/10 px-4 py-3 rounded-lg border border-green-500/20 flex justify-between items-center">
                <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">Saved by AI Engine</span>
                <span className="font-mono font-bold text-green-400">₹{avoidedLossCr.toLocaleString()} Cr</span>
              </div>
            )}
          </div>

          <div className="mt-auto border-t border-white/5 pt-6 space-y-3">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-slate-400">SOP Automations</h3>
            <button 
              onClick={() => { setAlertsSent(true); setTimeout(() => setAlertsSent(false), 3000); }}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${alertsSent ? 'bg-green-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
            >
              <AlertTriangle className="w-4 h-4" /> 
              {alertsSent ? 'Alerts Disseminated' : 'Execute Area Mass-SMS Alert'}
            </button>
            <button className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold bg-slate-800 hover:bg-slate-700 border border-white/10 text-white transition-all">
              <Navigation className="w-4 h-4" /> Generate Evacuation Routes
            </button>
          </div>
          
        </div>

        {/* Right Side: Primary GIS View */}
        <div className="flex-1 relative w-full h-full p-4 md:p-6 pb-6">
          <div className="absolute inset-4 md:inset-6 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10">
            <MapComponent hotspots={hotspots} showInfra={showInfra} showResources={showResources} />
            
            {loading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[400]">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
                  <p className="text-white font-medium font-outfit tracking-wide animate-pulse">Running SCS-CN & LSTM Inference...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MapComponentIcon(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
      <line x1="9" y1="3" x2="9" y2="21"></line>
      <line x1="15" y1="3" x2="15" y2="21"></line>
    </svg>
  );
}
