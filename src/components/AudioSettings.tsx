import React, { useState, useEffect } from "react";
import { Mic, Volume2, ShieldCheck, Check, VolumeX, Sliders, Play, Square, Music } from "lucide-react";

interface AudioSettingsProps {
  onAddLog: (msg: string, cat: "Güvenlik" | "Bağlantı" | "Sistem" | "Yapay Zeka", type?: "info" | "success" | "warning" | "danger") => void;
}

export default function AudioSettings({ onAddLog }: AudioSettingsProps) {
  const [micBoost, setMicBoost] = useState<number>(80);
  const [noiseReduction, setNoiseReduction] = useState<boolean>(true);
  const [echoCancellation, setEchoCancellation] = useState<boolean>(true);
  const [pushToTalk, setPushToTalk] = useState<boolean>(false);
  const [pushKey, setPushKey] = useState<string>("Space");
  const [isTestingMic, setIsTestingMic] = useState<boolean>(false);
  const [testVolume, setTestVolume] = useState<number>(4);

  // Micro volume fluctuations when testing microphone to emulate live feedback
  useEffect(() => {
    let interval: any;
    if (isTestingMic) {
      interval = setInterval(() => {
        setTestVolume(Math.floor(Math.random() * 85) + 15);
      }, 150);
    } else {
      setTestVolume(0);
    }
    return () => clearInterval(interval);
  }, [isTestingMic]);

  const handleTestMicToggle = () => {
    setIsTestingMic(!isTestingMic);
    if (!isTestingMic) {
      onAddLog("Kristal Netliğinde Mikrofon Test Modu aktif edildi.", "Sistem", "success");
    } else {
      onAddLog("Mikrofon test performansı tamamlandı.", "Sistem", "info");
    }
  };

  const handlePushToTalkToggle = () => {
    setPushToTalk(!pushToTalk);
    onAddLog(
      pushToTalk ? "Sürekli konuşma moduna geçildi." : `Bas-Konuş (Push-to-Talk) aktif. Atanan tuş: [${pushKey}]`,
      "Sistem",
      "info"
    );
  };

  return (
    <div className="bg-[#0a1128]/80 p-4 rounded-xl border border-[#d4af37]/20 flex flex-col gap-4 text-slate-300" id="audio-settings">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#d4af37]/10 pb-2">
        <div className="flex items-center gap-2">
          <Mic className="text-[#d4af37] animate-pulse" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">Ötüken Akustik Ses Ayarları</span>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-cyan-300">Net-Vocal V3.1</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Controls Column */}
        <div className="flex flex-col gap-3">
          {/* Volume Booster Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Ses Kazancı / Boost Gücü</span>
              <span className="font-mono text-cyan-400 font-bold">+{micBoost}%</span>
            </div>
            <div className="flex items-center gap-2">
              <VolumeX size={14} className="text-slate-500" />
              <input
                type="range"
                min="0"
                max="150"
                value={micBoost}
                onChange={(e) => setMicBoost(Number(e.target.value))}
                className="flex-1 accent-[#d4af37] bg-slate-950 h-1.5 rounded cursor-pointer"
                id="mic-boost-slider"
              />
              <Volume2 size={14} className="text-[#d4af37]" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-2.5 mt-1 border-t border-white/5 pt-2">
            {/* Noise cancellation */}
            <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-white/5 p-1 rounded transition" id="noise-reduction-toggle">
              <div className="flex flex-col">
                <span className="text-slate-200 font-medium">Asena Akıllı Gürültü Engelleme (ANC)</span>
                <span className="text-[9px] text-slate-400">Çevre seslerini ve rüzgarı yapay zekayla süzer</span>
              </div>
              <input
                type="checkbox"
                checked={noiseReduction}
                onChange={() => {
                  setNoiseReduction(!noiseReduction);
                  onAddLog(noiseReduction ? "Gürültü engelleme kapatıldı" : "Gürültü engelleme devralındı.", "Sistem", "info");
                }}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
              />
            </label>

            {/* Echo reduction */}
            <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-white/5 p-1 rounded transition" id="echo-cancellation-toggle">
              <div className="flex flex-col">
                <span className="text-slate-200 font-medium">Uzamsal Yankı Engelleme</span>
                <span className="text-[9px] text-slate-400">Hoparlörden sızan geri beslemeleri tamamen sıfırlar</span>
              </div>
              <input
                type="checkbox"
                checked={echoCancellation}
                onChange={() => {
                  setEchoCancellation(!echoCancellation);
                  onAddLog(echoCancellation ? "Yankı önleme kapatıldı" : "Uzamsal yankı önleme aktif.", "Sistem", "info");
                }}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Live Audio Test & Push-to-talk Column */}
        <div className="flex flex-col gap-3 justify-between">
          {/* Micro Test */}
          <div className="bg-[#050b18] p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">AKUSTİK MİKROFON DESİBEL TESTİ</span>
              <button
                onClick={handleTestMicToggle}
                className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded flex items-center gap-1 border transition-all ${isTestingMic ? "bg-red-950/40 border-red-500/30 text-red-400" : "bg-cyan-950/40 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30"}`}
                id="test-mic-btn"
              >
                {isTestingMic ? <Square size={10} /> : <Play size={10} />}
                {isTestingMic ? "TESTİ DURDUR" : "KULAKLIK TESTİ BAŞLAT"}
              </button>
            </div>

            {/* Audio visualization wave simulator */}
            <div className="flex items-center gap-0.5 h-6 bg-slate-950 rounded px-2 overflow-hidden">
              {Array.from({ length: 32 }).map((_, i) => {
                // Generate relative height
                const factor = isTestingMic ? Math.max(10, (testVolume * (Math.sin(i / 2) + 1)) / 2) : 10;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-cyan-500 to-amber-400 rounded-sm transition-all duration-150"
                    style={{ height: `${factor}%` }}
                  />
                );
              })}
            </div>
            <div className="text-[9px] flex justify-between text-slate-500 font-mono">
              <span>0dB (Sessizlik)</span>
              <span>Kutup Seviyesi: {isTestingMic ? `-${100 - testVolume}dB` : "-95dB"}</span>
              <span>Max Decibel</span>
            </div>
          </div>

          {/* Push-to-talk */}
          <div className="bg-[#0c142c] p-2.5 rounded border border-[#d4af37]/20 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">Bas-Konuş (Push-to-Talk)</span>
              <span className="text-[9px] text-slate-400">Atanan tuşla konuşma moduna geç</span>
            </div>
            <div className="flex items-center gap-2">
              {pushToTalk && (
                <input
                  type="text"
                  value={pushKey}
                  onChange={(e) => setPushKey(e.target.value)}
                  className="w-16 bg-[#050b18] border border-cyan-500/30 rounded text-center text-[10px] font-bold text-cyan-300 uppercase py-0.5 outline-none"
                  title="Tuşu Değiştir"
                  id="push-key-input"
                />
              )}
              <button
                onClick={handlePushToTalkToggle}
                className={`p-1 px-2 text-[10px] uppercase font-bold rounded border transition ${pushToTalk ? "bg-[#d4af37] text-slate-950 border-[#d4af37]" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"}`}
                id="push-to-talk-btn"
              >
                {pushToTalk ? "AKTİF" : "MİKROFON SÜREKLİ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
