"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet icon issues on Next.js
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;

interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  risk_score: number;
  status: string;
  elevation: number;
  predicted_depth_m: number;
  siltation_pct: number;
  time_to_peak_mins: number;
  flood_peak_delta_hrs: number;
  year_built: number;
  last_reconstruction: number | null;
  built_capacity_mm_hr: number;
  current_load_pct: number;
}

interface MapComponentProps {
  hotspots: Hotspot[];
  showInfra?: boolean;
  showResources?: boolean;
}

// Mock Critical Infrastructure Points (Hospitals, Substations)
const MOCK_INFRA = [
  { id: 'inf-1', lat: 19.115, lng: 72.83, type: 'Hospital', name: 'Kokilaben Hospital', risk: 'HIGH' },
  { id: 'inf-2', lat: 18.97, lng: 72.825, type: 'Substation', name: 'Byculla 220kV Substation', risk: 'CRITICAL' },
  { id: 'inf-3', lat: 19.06, lng: 72.83, type: 'Transport', name: 'Bandra Railway Node', risk: 'MODERATE' }
];

// Mock Live Resources
const MOCK_RESOURCES = [
  { id: 'res-1', lat: 19.11, lng: 72.84, type: 'NDRF', name: 'NDRF Team Alpha', status: 'Deployed' },
  { id: 'res-2', lat: 18.98, lng: 72.83, type: 'Pump', name: '500 GPM Pump #4', status: 'Active' },
  { id: 'res-3', lat: 19.05, lng: 72.91, type: 'NDRF', name: 'SDRF Quick Response', status: 'En-route' }
];

export default function MapComponent({ hotspots, showInfra = false, showResources = false }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-slate-900 animate-pulse rounded-2xl" />;

  const getColor = (status: string) => {
    switch(status) {
      case "CRITICAL": return "#ef4444"; // red-500
      case "HIGH": return "#f97316"; // orange-500
      case "MODERATE": return "#eab308"; // yellow-500
      case "LOW": return "#22c55e"; // green-500
      default: return "#06b6d4"; // cyan-500
    }
  };

  return (
    <MapContainer 
      center={[19.0760, 72.8777]} 
      zoom={11} 
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {hotspots.map((hs) => (
        <CircleMarker
          key={hs.id}
          center={[hs.lat, hs.lng]}
          radius={6}
          pathOptions={{
            color: getColor(hs.status),
            fillColor: getColor(hs.status),
            fillOpacity: 0.2, 
            weight: 2 
          }}
        >
          <Popup className="custom-popup" minWidth={250}>
            <div className="font-outfit p-1">
              <div className="flex justify-between items-start mb-2 border-b border-slate-200 pb-2">
                <strong className="text-slate-800 text-sm">Node: {hs.id}</strong>
                <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{backgroundColor: getColor(hs.status)}}>{hs.status}</span>
              </div>
              
              <div className="text-xs text-slate-700 space-y-2 mb-3">
                <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1">Infrastructure Root Cause Audit</div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-slate-50 p-1.5 rounded border border-slate-100 mb-2 text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-slate-500">Year Built:</span>
                    <span className="font-mono font-bold text-slate-800">{hs.year_built}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500">Last Overhaul:</span>
                    <span className="font-mono font-bold text-slate-800">{hs.last_reconstruction || 'None on record'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500">Built Capacity:</span>
                    <span className="font-mono font-bold text-slate-800">{hs.built_capacity_mm_hr} mm/hr</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500">Current Load:</span>
                    <span className={`font-mono font-bold ${hs.current_load_pct > 100 ? 'text-red-500' : 'text-slate-800'}`}>{hs.current_load_pct}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-100 px-1 py-0.5 rounded">
                  <span>Elevation Sink:</span>
                  <span className="font-mono text-slate-900 border border-slate-200 px-1 rounded bg-white">{hs.elevation} m MSL</span>
                </div>
                <div className="flex justify-between items-center bg-slate-100 px-1 py-0.5 rounded">
                  <span>Drainage Condition:</span>
                  <span className={`font-mono px-1 rounded text-white ${hs.siltation_pct > 60 ? 'bg-red-500' : 'bg-orange-400'}`}>
                    {hs.siltation_pct}% silted (CV)
                  </span>
                </div>
                
                <div className="flex flex-col bg-red-50 p-1.5 rounded border border-red-100 mt-2">
                  <span className="text-red-800 font-semibold mb-0.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Flood Peak Warning
                  </span>
                  <span><strong>{hs.predicted_depth_m}m</strong> depth predicted in <strong>{hs.time_to_peak_mins} mins</strong>.</span>
                </div>
              </div>

              {/* Sparkline Simulation via Flexbox */}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <div className="text-[10px] text-slate-500 mb-1 flex justify-between">
                  <span>System Comparison</span>
                  <span className="text-blue-600 font-bold">-{hs.flood_peak_delta_hrs} hrs early</span>
                </div>
                <div className="h-10 flex items-end gap-[2px] bg-slate-50 p-1 rounded">
                  <div className="flex-1 flex items-end h-full gap-[1px] opacity-30">
                    <div className="w-1/5 bg-slate-400 h-[10%]"></div>
                    <div className="w-1/5 bg-slate-400 h-[20%]"></div>
                    <div className="w-1/5 bg-slate-400 h-[30%]"></div>
                    <div className="w-1/5 bg-slate-400 h-[80%]"></div>
                    <div className="w-1/5 bg-slate-400 h-[90%]"></div>
                  </div>
                  <div className="flex-1 flex items-end h-full gap-[1px]">
                    <div className="w-1/5 bg-cyan-500 h-[40%]"></div>
                    <div className="w-1/5 bg-cyan-500 h-[85%]"></div>
                    <div className="w-1/5 bg-cyan-500 h-[95%]"></div>
                    <div className="w-1/5 bg-cyan-500 h-[60%]"></div>
                    <div className="w-1/5 bg-cyan-500 h-[30%]"></div>
                  </div>
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 px-1 uppercase tracking-wider">
                  <span>Legacy Detection</span>
                  <span>Jal Satark AI</span>
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {showInfra && MOCK_INFRA.map((inf) => (
        <CircleMarker
          key={inf.id}
          center={[inf.lat, inf.lng]}
          radius={8}
          pathOptions={{
            color: '#ffffff',
            fillColor: '#8b5cf6', // purple-500
            fillOpacity: 1,
            weight: 2
          }}
        >
          <Popup className="custom-popup">
            <div className="font-outfit p-1">
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200 text-purple-700 font-bold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {inf.type} Asset
              </div>
              <strong className="block text-slate-800 mb-1">{inf.name}</strong>
              <div className="text-xs text-slate-600">Vulnerability Rating: <span className="font-bold text-red-500">{inf.risk}</span></div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {showResources && MOCK_RESOURCES.map((res) => (
        <CircleMarker
          key={res.id}
          center={[res.lat, res.lng]}
          radius={8}
          pathOptions={{
            color: '#ffffff',
            fillColor: '#3b82f6', // blue-500
            fillOpacity: 1,
            weight: 3,
            dashArray: res.status === 'En-route' ? '3, 4' : undefined
          }}
        >
          <Popup className="custom-popup">
            <div className="font-outfit p-1">
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200 text-blue-700 font-bold text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Response Unit
              </div>
              <strong className="block text-slate-800 mb-1">{res.name}</strong>
              <div className="text-xs text-slate-600">Current Status: <span className="font-bold text-blue-600">{res.status}</span></div>
              <div className="text-xs text-slate-500 mt-1 font-mono">GPS: {res.lat.toFixed(4)}, {res.lng.toFixed(4)}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
