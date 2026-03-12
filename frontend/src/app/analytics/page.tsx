"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LabelList, ReferenceLine, Label } from "recharts";
import { Shield, Users, Stethoscope, AlertTriangle, ArrowDown, ArrowUp, Info, CheckCircle2 } from "lucide-react";

export default function AnalyticsPage() {
  const [wards, setWards] = useState<any[]>([]);
  const [rainfall, setRainfall] = useState(100);
  const [activeWardId, setActiveWardId] = useState<string | null>(null);

  const fetchWards = async (rain: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/wards?rainfall_mm=${rain}`);
      const data = await res.json();
      setWards(data.wards);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWards(rainfall);
  }, [rainfall]);

  // Priority Sort: Zone first, then lowest score (worst) first
  const groupedAndSortedWards = [...wards].sort((a: any, b: any) => {
    if (a.zone !== b.zone) return a.zone?.localeCompare(b.zone) || 0;
    return a.readiness_score - b.readiness_score;
  });

  const activeWard = activeWardId 
    ? groupedAndSortedWards.find((w: any) => w.id === activeWardId) 
    : groupedAndSortedWards.length > 0 ? groupedAndSortedWards[0] : null;

  const renderRadarDot = (ward: any) => (props: any) => {
    const { cx, cy, payload, value } = props;
    if (!ward) return null;
    const values = [ward.resistance, ward.adaptability, ward.recovery];
    const min = Math.min(...values);
    const max = Math.max(...values);
    let color = "#94a3b8";
    if (value === min) color = "#ef4444";
    else if (value === max) color = "#22c55e";
    
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill={color} stroke="#0f172a" strokeWidth={2} />
        <text x={cx} y={cy > 200 ? cy + 15 : cy - 10} fill={color} fontSize={12} textAnchor="middle" fontWeight="bold">{value}%</text>
      </g>
    );
  };

  const DeltaLabel = (props: any) => {
    const { x, y, width, index } = props;
    const ward = groupedAndSortedWards[index];
    if (!ward) return null;
    const isUp = ward.delta >= 0;
    return (
      <g transform={`translate(${x + width / 2},${y - 5})`}>
        <text x={0} y={0} fill={isUp ? "#22c55e" : "#ef4444"} textAnchor="middle" fontSize={11} fontWeight="bold">
          {isUp ? "↑" : "↓"} {Math.abs(ward.delta)}
        </text>
      </g>
    );
  };

  const getSopRecommendation = (score: number) => {
    if (score < 40) return "SOP-4: Immediate Operational Deployment (High-capacity pumps, SDRF standby)";
    if (score <= 70) return "SOP-2: Active Maintenance (Desilting escalation, Drain clearing)";
    return "SOP-1: Standard Monitoring (Monsoon Ready)";
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] px-4 md:px-6 py-24 lg:px-12 lg:py-32">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-outfit font-bold text-white mb-2">Operational Decision Intelligence</h1>
            <p className="text-slate-400">AHP-Entropy Weighted Dimensional Scoring Engine</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider text-right">Return Period Scenario</span>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-sm font-medium text-slate-300">1-in-50 Year Storm:</span>
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-32 accent-purple-500"
              />
              <span className="font-mono text-purple-400 font-bold w-12 text-right">{rainfall}mm</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Command Center Radar (Focus View) */}
          {activeWard && (
            <motion.div 
              key={activeWard.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-2xl border ${activeWard.readiness_score < 40 ? 'bg-red-500/10 border-red-500/30' : activeWard.readiness_score < 70 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-green-500/10 border-green-500/30'} flex flex-col`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{activeWard.name}</h3>
                  <p className="text-sm text-slate-400">{activeWard.zone}</p>
                </div>
                <div className={`text-4xl font-mono font-bold ${activeWard.readiness_score < 40 ? 'text-red-400' : activeWard.readiness_score < 70 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {activeWard.readiness_score}
                </div>
              </div>
              
              <div className="h-64 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                    { subject: 'Resistance', A: activeWard.resistance, fullMark: 100 },
                    { subject: 'Adaptability', A: activeWard.adaptability, fullMark: 100 },
                    { subject: 'Recovery', A: activeWard.recovery, fullMark: 100 },
                  ]}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 'bold' }} 
                    />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="Score" 
                      dataKey="A" 
                      stroke="#475569" 
                      fill="#475569" 
                      fillOpacity={0.3} 
                      dot={renderRadarDot(activeWard)}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="bg-slate-900/50 p-2 rounded">
                  <span className="text-slate-400 block mb-1">Resistance</span>
                  <Info className="w-3 h-3 inline text-slate-500 mr-1" />
                  <span className="font-mono text-white">Desilting, Pipes</span>
                </div>
                <div className="bg-slate-900/50 p-2 rounded">
                  <span className="text-slate-400 block mb-1">Adaptability</span>
                  <Info className="w-3 h-3 inline text-slate-500 mr-1" />
                  <span className="font-mono text-white">Pop. Density</span>
                </div>
                <div className="bg-slate-900/50 p-2 rounded">
                  <span className="text-slate-400 block mb-1">Recovery</span>
                  <Info className="w-3 h-3 inline text-slate-500 mr-1" />
                  <span className="font-mono text-white">Hospitals, Greenery</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 text-center uppercase tracking-widest font-semibold border-t border-white/10 pt-4 mt-auto">
                NDMA Resilience Dimensions
              </div>
            </motion.div>
          )}

          {/* Dynamic Layman / Official Insight Box */}
          {activeWard && (
            <motion.div 
              key={`insight-${activeWard.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-slate-900 border border-white/10 rounded-2xl flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                  {activeWard.readiness_score < 40 ? (
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  ) : activeWard.readiness_score < 70 ? (
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                  <h3 className="text-2xl font-bold text-white">Diagnostic Insight</h3>
                </div>

                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  The AHP-Entropy model flags <strong className="text-white">{activeWard.name}</strong> with a readiness score of <strong className={activeWard.readiness_score < 40 ? 'text-red-400' : 'text-white'}>{activeWard.readiness_score}/100</strong>. 
                  The analysis indicates that the weakest NDMA resilience dimension is currently <strong>{
                    activeWard.resistance <= activeWard.adaptability && activeWard.resistance <= activeWard.recovery ? "Resistance (Infrastructure)" :
                    activeWard.adaptability <= activeWard.resistance && activeWard.adaptability <= activeWard.recovery ? "Adaptability (Socio-Environmental)" : "Recovery (Post-Event Assets)"
                  }</strong>.
                </p>

                <div className="bg-black/50 p-4 rounded-xl border border-white/5 border-l-4 border-l-blue-500 mb-6">
                  <h4 className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Actionable Intelligence</h4>
                  <p className="text-white font-medium">{getSopRecommendation(activeWard.readiness_score)}</p>
                </div>
              </div>

              {/* Contractor Accountability Sub-Metric */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-t border-white/10 mt-auto">
                <h4 className="flex items-center gap-2 text-sm font-bold text-red-400 uppercase tracking-wider mb-3">
                  <Shield className="w-4 h-4" /> Contractor Audit Oversight
                </h4>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/40 p-4 rounded-lg">
                  <div>
                    <span className="text-slate-400 text-sm block">Detected Desilting Gap (CV Vision):</span>
                    <span className="text-white font-mono text-xl">{activeWard.contractor_gap_pct}% Unfinished</span>
                  </div>
                  <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                  <div className="text-right w-full md:w-auto">
                    <span className="text-slate-400 text-sm block">Recoverable Penalty Liability:</span>
                    <span className="text-green-400 font-mono text-2xl font-bold">₹{activeWard.contractor_penalty_cr} Cr</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Priority Ranked Full Chart */}
        <div className="w-full h-[600px] p-6 rounded-3xl bg-slate-900 border border-white/5 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-outfit font-medium text-white mb-1">Priority Command Matrix</h3>
              <p className="text-xs text-slate-400">Wards are sorted worst-to-best within their respective Administrative Zones. Click any bar to open Command Center Focus.</p>
            </div>
            <div className="flex gap-4 text-xs font-medium px-4 py-2 bg-black/50 rounded-lg border border-white/10">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Critical (&lt;40)</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Maintenance (40-70)</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Ready (&gt;70)</span>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={groupedAndSortedWards} 
                margin={{ top: 30, right: 30, left: 20, bottom: 120 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    setActiveWardId(e.activePayload[0].payload.id);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  height={120} 
                  interval={0} 
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis tick={{ fill: '#94a3b8' }} domain={[0, 100]} axisLine={{ stroke: '#334155' }}>
                  <Label value="Readiness Index (0-100)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#64748b" offset={-10} />
                </YAxis>
                <Tooltip 
                  cursor={{ fill: '#ffffff10' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <ReferenceLine y={70} stroke="#cbd5e1" strokeDasharray="5 5">
                  <Label position="top" fill="#f8fafc" fontSize={12} fontWeight="bold">Minimum Operational Baseline (70%)</Label>
                </ReferenceLine>
                
                <Bar 
                  dataKey="readiness_score" 
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <LabelList content={<DeltaLabel />} />
                  {groupedAndSortedWards.map((entry: any, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.readiness_score < 40 ? '#ef4444' : entry.readiness_score < 70 ? '#eab308' : '#22c55e'} 
                      stroke={activeWardId === entry.id ? '#fff' : 'transparent'}
                      strokeWidth={activeWardId === entry.id ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Validation Footer */}
        <div className="w-full text-center mt-6">
          <p className="text-xs text-slate-500 font-mono">
            * Operational Intelligence generated by predictive routing. Hydrology Model accuracy: R² = 0.95 based on 20,422 storm-flood samples.
          </p>
        </div>

      </div>
    </div>
  );
}
