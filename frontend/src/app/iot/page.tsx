"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RadioReceiver, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export default function IoTPage() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSensors = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/iot/sensors`);
      const data = await res.json();
      setSensors(data.sensors);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
    // Simulate real-time polling every 5 seconds
    const interval = setInterval(fetchSensors, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DANGER": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "WARNING": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "OK": return "text-green-400 bg-green-400/10 border-green-400/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DANGER": return <ShieldAlert className="w-5 h-5" />;
      case "WARNING": return <AlertTriangle className="w-5 h-5" />;
      case "OK": return <CheckCircle2 className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] px-6 py-24 lg:px-12 lg:py-32">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-outfit font-bold text-white mb-2 flex items-center gap-3">
              <RadioReceiver className="text-cyan-400 w-8 h-8" /> 
              Live IoT Telemetry
            </h1>
            <p className="text-slate-400">Ultrasonic Flow Sensors & CV Drain Blockage Monitors</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-cyan-400 text-sm font-medium animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              18/20 Sensors Active Network
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold text-right">
              Detection-to-Alert &lt; 2s | Hardware Reliability 98%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && sensors.length === 0 ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/50 animate-pulse border border-white/5" />
            ))
          ) : (
            sensors.map((sensor: any) => (
              <motion.div
                key={sensor.sensor_id}
                layoutId={sensor.sensor_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl border ${getStatusColor(sensor.status).replace('text-', 'border-').replace('bg-', 'hover:bg-')} bg-slate-900 transition-colors relative overflow-hidden group`}
              >
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${getStatusColor(sensor.status).split(' ')[0]}`}>
                  {getStatusIcon(sensor.status)}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-mono text-slate-400">{sensor.sensor_id}</span>
                  <div className={`px-2 py-1 rounded-md text-xs font-bold font-outfit uppercase border flex items-center gap-1 ${getStatusColor(sensor.status)}`}>
                    {getStatusIcon(sensor.status)} {sensor.status}
                  </div>
                </div>
                
                <h3 className="font-medium text-white mb-6 text-sm truncate">{sensor.location}</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Water Level</span>
                      <span className="text-white font-mono">{sensor.water_level_m}m</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (sensor.water_level_m / 2.5) * 100)}%` }}
                        className={`h-full rounded-full ${sensor.water_level_m > 2 ? 'bg-red-500' : 'bg-cyan-500'}`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>CV Blockage Detection</span>
                      <span className={`font-mono font-bold ${sensor.blockage_cv_pct > 70 ? 'text-red-400' : 'text-white'}`}>{sensor.blockage_cv_pct}%</span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${sensor.blockage_cv_pct}%` }}
                        className={`h-full rounded-full ${sensor.blockage_cv_pct > 70 ? 'bg-red-500' : 'bg-yellow-500'}`}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] mt-4 pt-4 border-t border-white/5 text-slate-500">
                      <span>Contractor ID: <span className="text-slate-300">BMC-SWD-{Math.floor(Math.random() * 100) + 1}</span></span>
                      <span>Last Cleaned: <span className="text-slate-300">1{Math.floor(Math.random() * 5)} May 2026</span></span>
                    </div>

                    {sensor.status === "DANGER" && (
                      <button className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded-lg transition-colors flex justify-center items-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                        Mobilize Monsoon Squad (SOP-8)
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
