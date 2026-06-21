import React, { useState } from "react";
import { SystemLog } from "../types";
import { ListFilter, Shield, Cpu, Activity, AlertTriangle, CheckCircle2, Award, Coins } from "lucide-react";

interface AdminPanelProps {
  logs: SystemLog[];
  onAddLog: (msg: string, cat: "Güvenlik" | "Bağlantı" | "Sistem" | "Yapay Zeka", type?: "info" | "success" | "warning" | "danger") => void;
  onClearLogs: () => void;
}

export default function AdminPanel({ logs, onAddLog, onClearLogs }: AdminPanelProps) {
  const [filter, setFilter] = useState<string>("All");

  // Premium / Revenue Mock metrics
  const [hostEarnings, setHostEarnings] = useState(1480);
  const [premiumCount, setPremiumCount] = useState(124);

  const filteredLogs = filter === "All" ? logs : logs.filter(l => l.category === filter);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "danger": return "text-red-400 bg-red-950/40 border border-red-500/20";
      case "warning": return "text-amber-400 bg-amber-950/40 border border-amber-500/20";
      case "success": return "text-emerald-400 bg-emerald-950/40 border border-emerald-500/20";
      default: return "text-cyan-400 bg-cyan-950/40 border border-cyan-500/20";
    }
  };

  const promotePremiumFeature = () => {
    setPremiumCount(prev => prev + 1);
    setHostEarnings(prev => prev + 49);
    onAddLog("Yeni Toy Üyesi premium üyeliğe yükseldi! Ötüken Bulut Depolama alanı artırıldı.", "Sistem", "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="admin-panel-container">
      {/* Revenue & Premium Dashboard */}
      <div className="bg-[#0a1128]/85 p-4 rounded-xl border border-[#d4af37]/20 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 border-b border-[#d4af37]/10 pb-1.5">
            <Coins className="text-amber-400" size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">Kut Kağanlığı Premium Hasılatı</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-3.5">
            Uçtan uca TLS ve WebRTC sunucularından elde edilen aylık bütçe ve premium üye istatistikleri.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#050b18] p-3 rounded border border-white/5 text-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Hasılat Gücü</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono tracking-tight">${hostEarnings} <span className="text-xs">USD</span></span>
            </div>
            <div className="bg-[#050b18] p-3 rounded border border-white/5 text-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Premium Alpler</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight">{premiumCount} <span className="text-xs">Üye</span></span>
            </div>
          </div>

          <div className="bg-[#0c142c] p-2 rounded border border-blue-500/10 text-[10px] text-blue-200 mb-3 leading-relaxed">
            <strong>Premium Ayrıcalıklar:</strong> 4K Ultra HD video, Gökbörü Sınırsız AI Scribe özetleyici, 100GB Bulut Arşivleme, Özel Kutlu Rozeti.
          </div>
        </div>

        <button
          onClick={promotePremiumFeature}
          className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-[10px] tracking-widest uppercase rounded transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          id="simulate-premium-btn"
        >
          PREMİUM KATILIM ENTEGRASYONUNU TETİKLE (+$49)
        </button>
      </div>

      {/* System Health Checkups */}
      <div className="bg-[#0a1128]/85 p-4 rounded-xl border border-[#d4af37]/20 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 border-b border-[#d4af37]/10 pb-1.5">
            <Cpu className="text-cyan-400" size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Sistem Sağlık Raporu</h3>
          </div>
          <p className="text-[10px] text-slate-400 mb-3.5">
            Sunucu durumları ve DDoS engelleme, IP maskeleme sistemleri kararlılık raporu.
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-[#050b18] p-2 rounded text-xs border border-white/5">
              <span className="text-slate-400">DDoS Koruma Faktörü</span>
              <span className="text-emerald-400 font-bold font-mono">AKTİF & GÜVENLİ</span>
            </div>
            <div className="flex justify-between items-center bg-[#050b18] p-2 rounded text-xs border border-white/5">
              <span className="text-slate-400">IP Koruma Maskesi</span>
              <span className="text-emerald-400 font-bold font-mono">%100 PROXY</span>
            </div>
            <div className="flex justify-between items-center bg-[#050b18] p-2 rounded text-xs border border-white/5">
              <span className="text-slate-400">Şüpheli Giriş Algılayıcı</span>
              <span className="text-emerald-400 font-bold font-mono">PASİF (TEMİZ)</span>
            </div>
            <div className="flex justify-between items-center bg-[#050b18] p-2 rounded text-xs border border-white/5">
              <span className="text-slate-400">Bulut Yedekleme Kanalı</span>
              <span className="text-[#d4af37] font-bold font-mono">OTOMATİK REPLİKE</span>
            </div>
          </div>
        </div>

        <div className="text-[9px] text-[#d4af37] italic text-right mt-2">
          Kutlu Siber Güvenlik Birliği Tarafından Onaylanmıştır.
        </div>
      </div>

      {/* Live System Log Stream */}
      <div className="bg-[#0a1128]/85 p-4 rounded-xl border border-[#d4af37]/20 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#d4af37]/10 pb-1.5">
          <div className="flex items-center gap-2">
            <ListFilter className="text-slate-400" size={15} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Devlet Sistem Günlükleri (Logs)</h3>
          </div>
          <button
            onClick={onClearLogs}
            className="text-[9px] text-red-400 hover:underline uppercase font-bold"
            id="clear-logs-btn"
          >
            Temizle
          </button>
        </div>

        {/* Filter badging */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["All", "Güvenlik", "Bağlantı", "Sistem", "Yapay Zeka"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border transition-all ${filter === cat ? "bg-[#d4af37] text-slate-950 border-[#d4af37]" : "bg-[#050b18] text-slate-400 border-slate-800 hover:bg-slate-800"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Logs terminal box */}
        <div className="flex-1 bg-slate-950/90 rounded border border-slate-850 p-2 overflow-y-auto max-h-[160px] text-[10px] font-mono flex flex-col gap-1.5">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-6 italic text-[9px]">Sistem kaydı bulunmamaktadır.</div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="flex flex-col gap-0.5 border-b border-white/5 pb-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 size-[9px]">{log.timestamp}</span>
                  <span className={`px-1.5 rounded-[2px] text-[8px] font-bold ${getSeverityStyles(log.severity)}`}>
                    {log.category}
                  </span>
                </div>
                <div className="text-slate-300 leading-normal">{log.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
