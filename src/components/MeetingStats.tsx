import React, { useState, useEffect } from "react";
import { Server, Activity, ShieldAlert, Cpu, Award } from "lucide-react";

interface MeetingStatsProps {
  totalParticipantsSimulated: number;
  currentCamCounts: number;
}

export default function MeetingStats({ totalParticipantsSimulated, currentCamCounts }: MeetingStatsProps) {
  const [latency, setLatency] = useState(24);
  const [packetLoss, setPacketLoss] = useState(0.04);
  const [cpuUsage, setCpuUsage] = useState(38);
  const [streamQuality, setStreamQuality] = useState<"HD" | "Full HD" | "4K Ultra HD">("Full HD");
  const [bandwidthMbps, setBandwidthMbps] = useState(48.5);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate lifelike micro-fluctuations
      setLatency(prev => Math.max(14, Math.min(85, +(prev + (Math.random() * 8 - 4)).toFixed(0))));
      setPacketLoss(prev => Math.max(0.0, Math.min(2.1, +(prev + (Math.random() * 0.4 - 0.2)).toFixed(2))));
      setCpuUsage(prev => Math.max(20, Math.min(95, +(prev + (Math.random() * 10 - 5)).toFixed(0))));
      setBandwidthMbps(prev => Math.max(10.5, Math.min(100.0, +(prev + (Math.random() * 4 - 2)).toFixed(1))));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0a1128]/80 p-4 rounded-xl border border-[#d4af37]/20 flex flex-col gap-4 text-slate-300" id="meeting-stats-container">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#d4af37]/10 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="text-[#d4af37] animate-pulse" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">Kurt-Net Sunucu Canlı Tanı Paneli</span>
        </div>
        <div className="text-[10px] bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase">
          Kararlı Göktürk 5G
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Latency */}
        <div className="bg-[#050b18] p-2.5 rounded border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Ağ Gecikmesi</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-cyan-400 font-mono">{latency}</span>
            <span className="text-[10px] text-slate-500">ms</span>
          </div>
          <div className="text-[9px] text-emerald-400 mt-1 flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Çok Düşük (Optimum)
          </div>
        </div>

        {/* Packet Loss */}
        <div className="bg-[#050b18] p-2.5 rounded border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Paket Kaybı</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-lg font-bold font-mono ${packetLoss > 1.2 ? "text-red-400" : "text-amber-400"}`}>{packetLoss}%</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-1">
            {packetLoss > 1.0 ? "Gürültü önleme uyarısı" : "Kutlu sinyal bütünlüğü"}
          </div>
        </div>

        {/* Bandwidth */}
        <div className="bg-[#050b18] p-2.5 rounded border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Mevcut Bant Genişliği</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-emerald-400 font-mono">{bandwidthMbps}</span>
            <span className="text-[10px] text-slate-500">Mbps</span>
          </div>
          <div className="text-[9px] text-cyan-300 mt-1">
            Oto Kalite: <strong className="text-white">{streamQuality}</strong>
          </div>
        </div>

        {/* Server Memory / CPU load */}
        <div className="bg-[#050b18] p-2.5 rounded border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Ötüken SFU Kurultay Yükü</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-amber-400 font-mono">{cpuUsage}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded overflow-hidden mt-1">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-amber-500" style={{ width: `${cpuUsage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Auxiliary stats */}
      <div className="flex items-center justify-between text-[11px] bg-[#0c142c] p-2.5 rounded border border-[#d4af37]/10 flex-wrap gap-2 text-slate-300">
        <div className="flex items-center gap-2">
          <Server size={12} className="text-[#d4af37]" />
          <span>Etkin Bağlantı Sınıfı: <strong className="text-white">Uçtan Uca WebRTC (DTLS-SRTP)</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu size={12} className="text-blue-400" />
          <span>Şifreleme Algoritması: <strong className="text-white">AES-GCM 256-Bit Ultra</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Award size={12} className="text-amber-400" />
          <span>Toy Odası Kapasitesi: <strong className="text-amber-400 font-bold">{totalParticipantsSimulated}/500 Alp</strong></span>
        </div>
      </div>
    </div>
  );
}
