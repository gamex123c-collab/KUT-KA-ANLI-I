import React, { useState } from "react";
import { Participant, Poll } from "../types";
import { Users, UserX, VolumeX, Mic, Check, X, ShieldAlert, HeartHandshake, Vote, Award, Sliders, ToggleLeft } from "lucide-react";

interface MeetingManagementProps {
  participants: Participant[];
  onToggleCam: (id: string) => void;
  onToggleMic: (id: string) => void;
  onKickParticipant: (id: string) => void;
  onApproveParticipant: (id: string) => void;
  onRejectParticipant: (id: string) => void;
  onAddLog: (msg: string, cat: "Güvenlik" | "Bağlantı" | "Sistem" | "Yapay Zeka", type?: "info" | "success" | "warning" | "danger") => void;
}

export default function MeetingManagement({
  participants,
  onToggleCam,
  onToggleMic,
  onKickParticipant,
  onApproveParticipant,
  onRejectParticipant,
  onAddLog
}: MeetingManagementProps) {
  // Local polls list
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: "p1",
      question: "Kut Kağanlığı altyapısında hangi medya sunucusu (SFU) mimarisi tercih edilmelidir?",
      options: [
        { id: "o1", text: "Ötüken Media Engine (Yerli C++)", votes: 42 },
        { id: "o2", text: "Janus Gateway (WebRTC Standardı)", votes: 19 },
        { id: "o3", text: "Mediasoup Node.js Entegrasyonu", votes: 35 }
      ],
      isActive: true,
      totalVotes: 96,
      votedOptionId: undefined
    },
    {
      id: "p2",
      question: "Kurultay kararlarının Gökbörü Yapay Zeka ile canlandırılması oylaması?",
      options: [
        { id: "a1", text: "Kutlu Kabul (Evet)", votes: 78 },
        { id: "a2", text: "Gözden Geçirilsin (Hayır)", votes: 5 }
      ],
      isActive: true,
      totalVotes: 83,
    }
  ]);

  // Poll creation states
  const [newQuestion, setNewQuestion] = useState("");
  const [newOption1, setNewOption1] = useState("");
  const [newOption2, setNewOption2] = useState("");
  const [newOption3, setNewOption3] = useState("");

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newOption1.trim() || !newOption2.trim()) return;

    const optionsList = [
      { id: "v1", text: newOption1, votes: 0 },
      { id: "v2", text: newOption2, votes: 0 }
    ];
    if (newOption3.trim()) {
      optionsList.push({ id: "v3", text: newOption3, votes: 0 });
    }

    const newPoll: Poll = {
      id: `p-${Date.now()}`,
      question: newQuestion,
      options: optionsList,
      isActive: true,
      totalVotes: 0
    };

    setPolls([newPoll, ...polls]);
    setNewQuestion("");
    setNewOption1("");
    setNewOption2("");
    setNewOption3("");
    onAddLog(`"${newQuestion.slice(0, 30)}..." konulu kurultay anketi oluşturuldu`, "Sistem", "success");
  };

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prevPolls =>
      prevPolls.map(p => {
        if (p.id !== pollId) return p;
        if (p.votedOptionId) return p; // prevent double vote on same poll
        
        return {
          ...p,
          votedOptionId: optionId,
          totalVotes: p.totalVotes + 1,
          options: p.options.map(opt =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          )
        };
      })
    );
    onAddLog("Anket oylamasına katılım sağlandı", "Sistem", "success");
  };

  const waitingRoomUsers = participants.filter(p => !p.isApproved);
  const activeUsers = participants.filter(p => p.isApproved);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="meeting-management">
      {/* Waiting Room & Participant Admin Panel */}
      <div className="bg-[#0a1128]/85 p-4 rounded-xl border border-[#d4af37]/20 flex flex-col gap-4">
        {/* Waiting Room Section */}
        {waitingRoomUsers.length > 0 && (
          <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldAlert size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Otomatik Bekleme Odası ({waitingRoomUsers.length} İstek)</h3>
            </div>
            <p className="text-[10px] text-slate-400">
              Oturum şifrelenmiştir. Aşağıdaki Alpler kurultaya giriş izni beklemektedir.
            </p>
            <div className="flex flex-col gap-2 mt-1">
              {waitingRoomUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between bg-[#050b18] p-2 rounded border border-amber-500/10">
                  <div className="flex items-center gap-2">
                    <img src={user.avatar} className="w-6 h-6 rounded-full border border-amber-400" alt="" />
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                        {user.name}
                        <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">{user.badge || "Yolcu"}</span>
                      </div>
                      <span className="text-[9px] text-slate-500">IP Koruma Aktif</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onApproveParticipant(user.id)}
                      className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 text-[10px] uppercase font-bold rounded transition-all"
                      title="Onayla ve Odaya Al"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => onRejectParticipant(user.id)}
                      className="p-1 text-red-400 bg-red-950/30 hover:bg-red-900/30 rounded border border-red-500/20"
                      title="Girişi Reddet"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Participants Moderation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Alpler Listesi & Moderasyon ({activeUsers.length})</h3>
            </div>
            <span className="text-[9px] text-[#d4af37] font-mono">Kağan Yetkileri Aktif</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
            {activeUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-2 bg-[#050b18]/60 rounded border border-white/5 hover:border-[#d4af37]/30 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img src={u.avatar} className="w-8 h-8 rounded-full border border-cyan-500/30" alt="" />
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#050b18] ${u.isCamOn ? "bg-green-400" : "bg-red-500"}`}></span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {u.name}
                      {u.badge && (
                        <span className="text-[8px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1 py-0.2 rounded font-sans scale-90">
                          {u.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 flex items-center gap-1">
                      <span className="text-cyan-400 font-bold">{u.role}</span>
                      <span>• Noise: {u.simulatedNoise}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Camera toggle */}
                  <button
                    onClick={() => onToggleCam(u.id)}
                    className={`p-1.5 rounded text-[10px] transition-all border ${u.isCamOn ? "bg-green-950/40 text-green-400 border-green-500/30 hover:bg-slate-800" : "bg-red-950/30 text-red-400 border-red-500/20 hover:bg-slate-800"}`}
                    title={u.isCamOn ? "Kamerayı Kapat" : "Kamerayı Açtır"}
                  >
                    Kamera
                  </button>

                  {/* Mic toggle */}
                  <button
                    onClick={() => onToggleMic(u.id)}
                    className={`p-1.5 rounded text-[10px] transition-all border ${u.isMicOn ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/30 hover:bg-slate-800" : "bg-red-950/30 text-red-500-20 border-red-500/20 hover:bg-slate-800"}`}
                    title={u.isMicOn ? "Sustur" : "Mikrofonu Açtır"}
                  >
                    {u.isMicOn ? "Ses Açık" : "Sessiz"}
                  </button>

                  {/* Kick Button (Only if not host!) */}
                  {u.role !== "Kağan" && (
                    <button
                      onClick={() => onKickParticipant(u.id)}
                      className="p-1.5 text-red-400 bg-red-950/30 hover:bg-red-900/40 rounded border border-red-500/20 ml-1"
                      title="Toydan Çıkar (Kick)"
                    >
                      <UserX size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Surveys & Interactive Polls Panel */}
      <div className="bg-[#0a1128]/85 p-4 rounded-xl border border-[#d4af37]/20 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Vote size={15} className="text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Karar Kurultayı (Anketler)</h3>
          </div>
          <span className="text-[9px] text-slate-400 uppercase">Toplam Katılım Oranı: %94</span>
        </div>

        {/* Existing active polls */}
        <div className="flex flex-col gap-3 max-h-[190px] overflow-y-auto pr-1">
          {polls.map(p => (
            <div key={p.id} className="bg-[#050b18]/80 p-3 rounded-lg border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200">{p.question}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 bg-amber-400/20 text-amber-300 font-mono tracking-wider rounded">
                  {p.votedOptionId ? "OY VERİLDİ" : "AKTİF"}
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                {p.options.map(opt => {
                  const percent = p.totalVotes > 0 ? Math.round((opt.votes / p.totalVotes) * 100) : 0;
                  const isSelected = p.votedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleVote(p.id, opt.id)}
                      disabled={p.votedOptionId !== undefined}
                      className={`relative w-full text-left p-2 rounded text-xs overflow-hidden transition-all border ${isSelected ? "border-amber-400/80 bg-amber-900/10 text-white" : "border-slate-800 hover:border-slate-700 text-slate-300"}`}
                    >
                      {/* Percent progress bar overlay */}
                      <div className="absolute top-0 left-0 bottom-0 bg-blue-500/10 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                      
                      <div className="relative flex justify-between items-center z-10">
                        <span className="font-medium flex items-center gap-1">
                          {isSelected && <Check size={11} className="text-amber-400" />}
                          {opt.text}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{opt.votes} Oy ({percent}%)</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="text-[9px] text-slate-500 font-mono self-end">
                Toplam Oylama Gücü: {p.totalVotes} Alp
              </div>
            </div>
          ))}
        </div>

        {/* Create a Poll form */}
        <form onSubmit={handleCreatePoll} className="border-t border-[#d4af37]/10 pt-3 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-400">Yeni Kurultay Oylaması Başlat</span>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Oylama sorusu... Örn: 4K yayın kalitesini onaylıyor musunuz?"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              className="w-full bg-[#050b18] border border-slate-700 hover:border-slate-600 rounded text-xs p-2 text-slate-200 outline-none"
              required
              id="new-poll-question"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Seçenek 1 (Kutlu)"
                value={newOption1}
                onChange={e => setNewOption1(e.target.value)}
                className="bg-[#050b18] border border-slate-700 rounded text-[11px] p-2 text-slate-200 outline-none"
                required
                id="new-poll-opt1"
              />
              <input
                type="text"
                placeholder="Seçenek 2 (Gerekçeli)"
                value={newOption2}
                onChange={e => setNewOption2(e.target.value)}
                className="bg-[#050b18] border border-slate-700 rounded text-[11px] p-2 text-slate-200 outline-none"
                required
                id="new-poll-opt2"
              />
              <input
                type="text"
                placeholder="Seçenek 3 (Opsiyonel)"
                value={newOption3}
                onChange={e => setNewOption3(e.target.value)}
                className="bg-[#050b18] border border-slate-700 rounded text-[11px] p-2 text-slate-200 outline-none"
                id="new-poll-opt3"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 mt-1 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/40 hover:border-[#d4af37] text-[#d4af37] font-bold text-[10px] tracking-widest uppercase rounded transition-all"
            id="create-poll-submit"
          >
            KURULTAY ANKETİNİ YAYINLA
          </button>
        </form>
      </div>
    </div>
  );
}
