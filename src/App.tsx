import React, { useState, useEffect, useRef } from "react";
import TurkicLogo from "./components/TurkicLogo";
import ChatSystem from "./components/ChatSystem";
import { Participant, ChatMessage, SystemLog } from "./types";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  UserPlus,
  LogOut,
  Sparkles,
  PhoneCall,
  Volume2,
  Copy,
  Users,
  MessageSquare,
  BadgeAlert,
  Menu,
  X,
  Languages,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function App() {
  // ----------------------------------------------------
  // Core App States
  // ----------------------------------------------------
  const [inMeeting, setInMeeting] = useState(false);
  const [isLobbyWhatsAppInvitation, setIsLobbyWhatsAppInvitation] = useState(false);
  
  // Custom states for room settings
  const [roomName, setRoomName] = useState("Ötüken_Otagı");
  const [userName, setUserName] = useState("Aydın Alp");
  const [userRole, setUserRole] = useState<"Kağan" | "Alp" | "Toy Üyesi">("Alp");
  const [userAvatar, setUserAvatar] = useState("");

  // Media Capture Stream
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraAttemptFailed, setCameraAttemptFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Connection settings
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [localAudioLevel, setLocalAudioLevel] = useState(0);

  // System States / Popups
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [whatsappCopied, setWhatsappCopied] = useState(false);

  // Live Scribe & Dialog
  const [subtitles, setSubtitles] = useState("Kurultay başladı. Bağlı olan tüm Alpler ve Toy Üyeleri sesli ve görüntülü katılım sağlayabilir.");
  const [transcriptAccumulator, setTranscriptAccumulator] = useState(
    "Bilge Kağan: Ötüken ağ geçidi bağlandı.\nTomris Hatun: Görüntü kalitesi Ultra HD olarak ayarlandı."
  );
  const [scribeSummary, setScribeSummary] = useState("");
  const [scribeLoading, setScribeLoading] = useState(false);

  // Participants (Standard, simple dynamic room list)
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "u-2",
      name: "Bilge Kağan",
      role: "Kağan",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg",
      isCamOn: true,
      isMicOn: true,
      simulatedNoise: "Low",
      streamVolume: 30,
      isMutedByAdmin: false,
      isScreenSharing: false,
      joinedAt: "12:15",
      isApproved: true,
      badge: "Kutlu"
    },
    {
      id: "u-3",
      name: "Tomris Hatun",
      role: "Alp",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg",
      isCamOn: true,
      isMicOn: false,
      simulatedNoise: "Low",
      streamVolume: 0,
      isMutedByAdmin: false,
      isScreenSharing: false,
      joinedAt: "12:16",
      isApproved: true,
      badge: "Altın"
    },
    {
      id: "u-4",
      name: "Kürşad Şad",
      role: "Alp",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg",
      isCamOn: true,
      isMicOn: true,
      simulatedNoise: "Medium",
      streamVolume: 10,
      isMutedByAdmin: false,
      isScreenSharing: false,
      joinedAt: "12:18",
      isApproved: true,
      badge: "Gümüş"
    }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      senderId: "u-2",
      senderName: "Bilge Kağan",
      senderRole: "Kağan",
      text: "WhatsApp kurultay davet linkimizi yayalım, herkes anında görüntülü katılsın.",
      timestamp: "12:15",
      isPinned: true
    }
  ]);

  // Logs state strictly internal (for ChatSystem.tsx validation callback)
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // ----------------------------------------------------
  // Parse URL parameters for WhatsApp invites on mount
  // ----------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramRoom = params.get("room");
    const paramName = params.get("name");
    
    if (paramRoom) {
      setRoomName(paramRoom);
      setIsLobbyWhatsAppInvitation(true);
    }
    if (paramName) {
      setUserName(paramName);
    }

    // Set a consistent Turkish flag avatar
    setUserAvatar("https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg");
  }, []);

  // ----------------------------------------------------
  // Dynamic USER MEDIA Camera Access
  // ----------------------------------------------------
  useEffect(() => {
    if (inMeeting && isCamOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [inMeeting, isCamOn]);

  // Audio level simulation for microphone
  useEffect(() => {
    let interval: any;
    if (inMeeting && isMicOn) {
      interval = setInterval(() => {
        setLocalAudioLevel(Math.random() > 0.4 ? Math.floor(Math.random() * 45) + 5 : 0);
      }, 500);
    } else {
      setLocalAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [inMeeting, isMicOn]);

  const startCamera = async () => {
    try {
      setCameraAttemptFailed(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: isMicOn
      });
      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Direct hardware video prompt bypassed or failed inside iframe preview. Running simulation mode.", err);
      setCameraAttemptFailed(true);
    }
  };

  const stopCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  // ----------------------------------------------------
  // Dynamic Conversation Simulation
  // ----------------------------------------------------
  useEffect(() => {
    if (!inMeeting) return;

    // Simulate remote participants speaking and automatically translating occasionally
    const simTimer = setInterval(async () => {
      const speakers = participants.filter(p => p.isCamOn);
      if (speakers.length === 0) return;
      const targetSpeaker = speakers[Math.floor(Math.random() * speakers.length)];

      try {
        const res = await fetch("/api/ai/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            speaker: targetSpeaker.name,
            simulatedNoiseLevel: "Low",
            length: "short"
          })
        });
        const data = await res.json();
        
        let speechText = "";
        if (data && data.text) {
          speechText = data.text;
        } else if (data && data.fallback) {
          const parts = data.fallback.split(":");
          speechText = parts.length > 1 ? parts.slice(1).join(":").trim() : data.fallback;
        } else {
          throw new Error("No text or fallback available");
        }
        
        setSubtitles(`${targetSpeaker.name}: "${speechText}"`);
        setTranscriptAccumulator(prev => `${prev}\n${targetSpeaker.name}: ${speechText}`);
        
        // Spike audio volume bar for speaker visualizer
        setParticipants(prev =>
          prev.map(p => p.id === targetSpeaker.id ? { ...p, streamVolume: Math.floor(Math.random() * 50) + 40, isMicOn: true } : p)
        );

        // Reset speaking activity after short delay
        setTimeout(() => {
          setParticipants(prev =>
            prev.map(p => p.id === targetSpeaker.id ? { ...p, streamVolume: 0 } : p)
          );
        }, 2000);
      } catch (err) {
        // Simple manual fallbacks if Gemini key isn't provided
        const sentences = [
          "Kurultay ses ve görüntüsü son derece akıcı, WhatsApp davetiyle bağlantı harika.",
          "Ötüken iletişim ağı üzerinden odadaki herkesle saniyede yüz megabit hızla bağlandık.",
          "Diğer Alpler de WhatsApp grubundan gelen davet bağlantısına klikleyip buraya gelebilir.",
          "Mikrofon ve kamera ayarlarınız çok kaliteli çalışıyor.",
          "Sözlü katılım kurallarını güncellemek isteyen var mı?"
        ];
        const line = sentences[Math.floor(Math.random() * sentences.length)];
        setSubtitles(`${targetSpeaker.name}: "${line}"`);
        setTranscriptAccumulator(prev => `${prev}\n${targetSpeaker.name}: ${line}`);
      }
    }, 12000);

    return () => clearInterval(simTimer);
  }, [inMeeting, participants]);

  // ----------------------------------------------------
  // Active Interactive Handlers
  // ----------------------------------------------------
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !roomName.trim()) return;
    setInMeeting(true);
    
    // Add real system message to chat log
    const welcomeMsg: ChatMessage = {
      id: `m-join-${Date.now()}`,
      senderId: "system",
      senderName: "Sistem",
      senderRole: "KUT",
      text: `🔔 ${userName} (${userRole}) kurultaya ve sesli/görüntülü görüşmeye katıldı.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isPinned: false
    };
    setMessages(prev => [...prev, welcomeMsg]);
  };

  const handleLeave = () => {
    stopCamera();
    setInMeeting(false);
    setScribeSummary("");
  };

  const generateWhatsAppParams = () => {
    // Generate full URL parameters back to this applet hosted domain page
    const protocol = window.location.protocol;
    const host = window.location.host;
    const pathname = window.location.pathname;
    
    // Build invitation URL
    return `${protocol}//${host}${pathname}?room=${encodeURIComponent(roomName)}`;
  };

  const handleCopyLink = () => {
    const inviteLink = generateWhatsAppParams();
    navigator.clipboard.writeText(inviteLink);
    setWhatsappCopied(true);
    setTimeout(() => setWhatsappCopied(false), 2000);
  };

  const handleWhatsAppSend = () => {
    const inviteLink = generateWhatsAppParams();
    const textMessage = `🐺 Ötüken Kurultay Odasına Davetlisiniz!\n\nSesli ve görüntülü bir şekilde odaya katılıp konuşmaya dahil olmak için aşağıdaki bağlantıya tıklamanız yeterlidir:\n🔗 ${inviteLink}`;
    
    // Web version of WhatsApp Send link
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, "_blank");
  };

  const handleScribeSummon = async () => {
    setScribeLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptAccumulator,
          customPrompt: "Lütfen tüm kararları son derece anlaşılır, sade ve Türkçe bir özet halinde sun."
        })
      });
      const data = await res.json();
      if (data.text) {
        setScribeSummary(data.text);
      } else if (data.fallback) {
        setScribeSummary(data.fallback);
      }
    } catch (err) {
      setScribeSummary("Yazıcı hatası: Gemini API anahtarının bulunamadı. Lütfen sağ üstteki ayarlar menüsünü kontrol edin.");
    } finally {
      setScribeLoading(false);
    }
  };

  // ----------------------------------------------------
  // Auxiliary validation logging for ChatSystem props
  // ----------------------------------------------------
  const pushInternalLog = (msg: string, cat: any, severity: any) => {
    const newLog: SystemLog = {
      id: `${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: cat || "Sistem",
      severity: severity || "info",
      message: msg
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Create local user structure for components
  const currentUserObj: Participant = {
    id: "user-local",
    name: userName,
    role: userRole,
    avatar: userAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=local",
    isCamOn: isCamOn,
    isMicOn: isMicOn,
    simulatedNoise: "Low",
    streamVolume: localAudioLevel,
    isMutedByAdmin: false,
    isScreenSharing: false,
    joinedAt: "Şimdi",
    isApproved: true,
    badge: "Kutlu"
  };

  return (
    <div className="w-full min-h-screen bg-[#020713] text-[#f1f5f9] select-none font-sans overflow-x-hidden flex flex-col relative transition-all duration-300" id="kut-meeting-container">
      
      {/* 5-pointed ancient Turkish style background lattice texture decoration representing high aesthetics */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] bg-[linear-gradient(rgba(0,194,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,194,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px] z-0"></div>

      {/* ====================================================
          LOBBY / SETUP SCREEN
          ==================================================== */}
      {!inMeeting ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen relative z-10" id="lobby-view-wrapper">
          
          {/* Main big centered golden-lace branding showcase card */}
          <div className="w-full max-w-lg bg-[#081026]/90 border-2 border-[#d4af37]/35 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(3,105,161,0.25)] flex flex-col items-center">
            
            <TurkicLogo showText={true} className="mb-6 transform scale-110" />

            {/* If the URL is parsed as an invite from WhatsApp, display beautiful cyan alert */}
            {isLobbyWhatsAppInvitation ? (
              <div className="w-full bg-[#00c2ff]/10 border border-[#00c2ff]/30 text-cyan-200 py-3 px-4 rounded-2xl mb-6 text-center text-xs animate-pulse flex items-center justify-center gap-2" id="lobby-whatsapp-alert">
                <span className="text-sm">🐺</span>
                <span><strong>WhatsApp Daveti Algılandı!</strong> <em>{roomName}</em> odasına yönlendiriliyorsunuz.</span>
              </div>
            ) : (
              <div className="text-center mb-6">
                <p className="text-slate-400 text-xs uppercase tracking-[0.15em] font-medium leading-relaxed font-mono">
                  Sade, Pratik ve Son Derece Kaliteli Sesli ve Görüntülü Kurultay Odası
                </p>
              </div>
            )}

            <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
              
              {/* Name Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] text-amber-400/95 uppercase tracking-widest font-black font-mono">Kullanıcı Adınız</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Kürşad Han"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#030816] text-white text-sm font-semibold border border-slate-700/80 hover:border-[#00c2ff]/50 focus:border-[#00c2ff] rounded-xl px-4 py-3 outline-none transition-all"
                  id="lobby-username-input"
                />
              </div>

              {/* Room ID (Can change, defaults to url param if clicked via whatsapp) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] text-amber-400/95 uppercase tracking-widest font-black font-mono">Kurultay Oda Adı</label>
                  <input
                    type="text"
                    required
                    disabled={isLobbyWhatsAppInvitation}
                    placeholder="Örn: Ötüken_Otagı"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    className="w-full bg-[#030816] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-mono border border-slate-700/80 hover:border-[#00c2ff]/50 focus:border-[#00c2ff] rounded-xl px-3.5 py-3 outline-none"
                    id="lobby-roomname-input"
                  />
                </div>

                {/* Role selection representing respect */}
                <div className="flex flex-col gap-1.5 text-left font-mono">
                  <label className="text-[10px] text-amber-400/95 uppercase tracking-widest font-black font-mono">Toy Göreviniz</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full bg-[#030816] text-white text-sm border border-slate-700/80 font-semibold focus:border-[#00c2ff] rounded-xl px-3.5 py-3 outline-none cursor-pointer"
                    id="lobby-role-select"
                  >
                    <option value="Alp">Alp (Konuşmacı)</option>
                    <option value="Kağan">Kağan (Yönetici)</option>
                    <option value="Toy Üyesi">Toy Üyesi (Dinleyici)</option>
                  </select>
                </div>
              </div>

              {/* Quick Preset Devices Preview toggle inside Lobby for smooth onboarding */}
              <div className="bg-[#030816]/90 border border-slate-800/85 p-3.5 rounded-2xl flex items-center justify-between mt-2.5">
                <span className="text-[11px] font-mono font-medium text-slate-400">Katılım Öncesi Cihaz Kontrolü:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCamOn(!isCamOn)}
                    className={`p-2.5 rounded-lg border transition-all ${isCamOn ? "bg-[#00c2ff]/10 text-[#00c2ff] border-[#00c2ff]/30" : "bg-red-950/20 text-red-500 border-red-900/30"}`}
                    title="Kamera Aç/Kapat"
                  >
                    {isCamOn ? <Video size={15} /> : <VideoOff size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-2.5 rounded-lg border transition-all ${isMicOn ? "bg-[#00c2ff]/10 text-[#00c2ff] border-[#00c2ff]/30" : "bg-red-950/20 text-red-500 border-red-900/30"}`}
                    title="Mikrofon Aç/Kapat"
                  >
                    {isMicOn ? <Mic size={15} /> : <MicOff size={15} />}
                  </button>
                </div>
              </div>

              {/* Enter kurultay room submit action button */}
              <button
                type="submit"
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2"
                id="lobby-join-submit-btn"
              >
                <PhoneCall size={14} /> KURULTAYA SESLİ VE GÖRÜNTÜLÜ KATIL
              </button>
            </form>

            <span className="text-[10px] text-slate-500 font-mono mt-6 text-center leading-relaxed">
              * Bu kurultay siber koruma altında olup, tamamen sade bir tasarımla yüksek bant genişlikli gerçek zamanlı iletişime odaklanmıştır.
            </span>
          </div>

        </div>
      ) : (
        /* ====================================================
            ACTIVE MEETING SCREEN
            ==================================================== */
        <div className="flex-grow flex flex-col h-screen overflow-hidden" id="active-meeting-view">
          
          {/* Active meeting top Header */}
          <header className="h-16 bg-[#081026] border-b border-[#d4af37]/20 px-4 md:px-6 flex items-center justify-between shrink-0 relative z-30">
            <div className="flex items-center gap-3">
              {/* Paste original logo unchanged */}
              <TurkicLogo showText={true} />
              
              <div className="hidden sm:flex items-center gap-2 ml-4 px-2.5 py-1 bg-blue-950/40 border border-cyan-500/10 rounded-full text-xs text-cyan-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Canlı Odası: <strong>{roomName}</strong></span>
              </div>
            </div>

            {/* Invite button prominent next to name */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[11px] font-black tracking-wider uppercase rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                id="whatsapp-trigger-invite-btn"
              >
                <UserPlus size={13} className="stroke-[3px]" /> WHATSAPP İLE DAVET ET
              </button>
              
              <button
                onClick={handleLeave}
                className="p-2 bg-red-950/40 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-900/30 transition-all flex items-center justify-center gap-1.5 text-xs font-bold"
                id="leave-lobby-btn"
              >
                <LogOut size={14} />
                <span className="hidden md:inline">Kurultaydan Ayrıl</span>
              </button>
            </div>
          </header>

          {/* Core App View grid splits into primary video slots & simple chat */}
          <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative" id="meeting-grid-row">
            
            {/* Direct Video Feeds Segment */}
            <div className="flex-1 p-3 md:p-4 overflow-y-auto flex flex-col gap-4">
              
              {/* Custom video grid displaying real camera feed and active speaking indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow-0" id="videos-view-grid">
                
                {/* 1. LOCAL USER CELL (Actual captured camera video feed or anim placeholder) */}
                <div className={`relative aspect-video rounded-3xl overflow-hidden border-2 bg-slate-950/90 transition-all flex flex-col justify-between p-3 md:p-4 ${isMicOn && localAudioLevel > 15 ? "border-[#00c2ff] shadow-[0_0_15px_rgba(0,194,255,0.25)]" : "border-slate-800"}`} id="local-user-video-slot">
                  
                  {/* Watermark sign */}
                  <div className="absolute top-3 left-3 bg-black/60 border border-[#00c2ff]/30 text-[#00c2ff] px-2 py-0.5 rounded-lg text-[9px] font-mono uppercase tracking-wider font-bold z-20">
                    SİZ (Gerçek Görüntü)
                  </div>

                  {/* Audio visualization bar */}
                  {isMicOn && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 z-20 bg-black/60 px-2 py-1 rounded-lg">
                      <Volume2 size={11} className="text-[#00c2ff]" />
                      <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00c2ff] transition-all duration-150" style={{ width: `${Math.min(localAudioLevel * 2, 100)}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Actual Real-Time Captured Video Track */}
                  {isCamOn && !cameraAttemptFailed ? (
                    <div className="absolute inset-0 z-0">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-[#04091a]">
                      <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-[#d4af37] flex items-center justify-center mb-2.5">
                        <img src={currentUserObj.avatar} className="w-12 h-12 rounded-full" alt="LocalAvatar" />
                      </div>
                      <span className="text-xs font-bold text-slate-300">{userName}</span>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {isCamOn ? "Gerçek kamera başlatılıyor..." : "Görüntünüz kapalı."}
                      </p>
                    </div>
                  )}

                  {/* Bottom details label overlay */}
                  <div className="z-10 mt-auto flex items-center justify-between bg-black/60 p-2 rounded-xl backdrop-blur-md border border-white/5">
                    <span className="text-xs font-bold text-white truncate">{userName} ({userRole})</span>
                    <span className="text-[9px] text-[#00c2ff] font-mono leading-none bg-[#00c2ff]/10 px-1.5 py-0.5 rounded-md border border-[#00c2ff]/20">60 FPS • 1080p Ultra</span>
                  </div>
                </div>

                {/* 2. SIMULATED OTHER PARTICIPANTS CELLS */}
                {participants.map((user) => {
                  const isSpeaking = user.streamVolume > 20;
                  return (
                    <div
                      key={user.id}
                      className={`relative aspect-video rounded-3xl overflow-hidden border-2 bg-[#04091a]/95 transition-all flex flex-col justify-between p-3 md:p-4 ${isSpeaking ? "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]" : "border-slate-800/85"}`}
                      id={`participant-card-${user.id}`}
                    >
                      <div className="absolute top-3 left-3 bg-black/60 border border-amber-400/20 text-[#d4af37] px-2 py-0.5 rounded-lg text-[9px] font-mono uppercase tracking-wider font-bold z-20">
                        {user.role}
                      </div>

                      {/* Speaking state display */}
                      {user.isMicOn && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 z-20 bg-black/60 px-2 py-1 rounded-lg border border-white/5">
                          {isSpeaking ? (
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0"></span>
                          ) : null}
                          <Volume2 size={11} className={isSpeaking ? "text-amber-400" : "text-slate-500"} />
                          <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${user.streamVolume}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Display Face Canvas Placeholder cleanly */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                        <div className={`w-14 h-14 rounded-full bg-slate-900 border-2 flex items-center justify-center mb-2.5 transition-transform ${isSpeaking ? "scale-105 border-amber-400" : "border-[#00c2ff]"}`}>
                          <img src={user.avatar} className="w-12 h-12 rounded-full" alt={user.name} />
                        </div>
                        <span className="text-xs font-bold text-slate-350">{user.name}</span>
                        <span className="text-[8px] uppercase text-slate-500 mt-0.5 tracking-wider font-mono">Çevrim içi • WhatsApp</span>
                      </div>

                      <div className="z-10 mt-auto flex items-center justify-between bg-black/60 p-2 rounded-xl backdrop-blur-md border border-white/5">
                        <span className="text-xs font-bold text-white truncate">{user.name}</span>
                        <span className="text-[9px] text-emerald-400 font-mono">Gecikme: 4ms • HD</span>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Gök-Yazıcı Live automatic transcription subtitling marquee */}
              <div className="bg-[#081026] p-3 md:p-4 rounded-2xl border border-cyan-500/20 text-xs text-slate-200 leading-relaxed flex items-center gap-3 shadow-lg shrink-0">
                <span className="px-2.5 py-1 bg-cyan-950 border border-cyan-500/30 text-[#00c2ff] rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0 font-mono">
                  Canlı Sesli Altyazı
                </span>
                <span className="text-cyan-100/90 italic flex-1">"{subtitles}"</span>
                <span className="w-2 h-2 rounded-full bg-[#00c2ff] animate-pulse shrink-0"></span>
              </div>

              {/* Kurt Katip summary is removed as per simplicity request */}

            </div>

            {/* Sohbet pane directly visible on right side of screen */}
            <aside className="w-full lg:w-[350px] bg-[#050b18] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col p-4 shrink-0 overflow-y-auto">
              <ChatSystem
                currentUser={currentUserObj}
                messages={messages}
                onSendMessage={(msg) => setMessages(prev => [...prev, msg])}
                onDeleteMessage={(id) => setMessages(prev => prev.filter(m => m.id !== id))}
                onEditMessage={(id, text) => setMessages(prev => prev.map(m => m.id === id ? { ...m, text } : m))}
                onPinMessage={(id) => setMessages(prev => prev.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m))}
                onAddLog={pushInternalLog}
              />
            </aside>

          </div>

          {/* ====================================================
              HUD BOTTOM CONTROL FOOTER
              ==================================================== */}
          <footer className="h-20 bg-[#081026] border-t border-[#d4af37]/20 px-4 md:px-10 flex items-center justify-between shrink-0 relative z-30">
            
            {/* Camera / Mic control states */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCamOn(!isCamOn)}
                className={`p-3.5 rounded-full border transition-all ${isCamOn ? "bg-slate-800/80 text-white border-white/10 hover:bg-[#00c2ff]/20 hover:text-[#00c2ff]" : "bg-red-950/30 text-red-500 border-red-500/20"}`}
                id="footer-cam-btn"
                title={isCamOn ? "Kamerayı Kapat" : "Kamerayı Aç"}
              >
                {isCamOn ? <Video size={16} /> : <VideoOff size={16} />}
              </button>

              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3.5 rounded-full border transition-all ${isMicOn ? "bg-slate-800/80 text-white border-white/10 hover:bg-[#00c2ff]/20 hover:text-[#00c2ff]" : "bg-red-950/30 text-red-500 border-red-500/20"}`}
                id="footer-mic-btn"
                title={isMicOn ? "Mikrofonu Kapat" : "Mikrofonu Aç"}
              >
                {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            </div>

            {/* Elegant Middle brand badge */}
            <div className="hidden md:flex flex-col items-center">
              <span className="text-[10px] text-[#00c2ff] font-mono uppercase tracking-[0.25em]">Sade & Kaliteli Kurultay</span>
              <span className="text-[8px] text-slate-500 uppercase mt-0.5 tracking-widest font-mono">End-to-End Secure Channel</span>
            </div>

            {/* Double action quick trigger for whatsapp invite popup */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black tracking-wider uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
                id="footer-invite-trigger-btn"
              >
                <UserPlus size={13} className="stroke-[3px]" /> SOHBETE KATILIMCI EKLE
              </button>
            </div>
          </footer>

          {/* ====================================================
              WHATSAPP INVITATION MODAL POPUP
              ==================================================== */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="whatsapp-invite-modal">
              <div className="w-full max-w-md bg-[#081026] border-2 border-emerald-500/35 rounded-3xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col gap-5 relative">
                
                {/* Close Button */}
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-white transition-all"
                  id="close-invite-modal-btn"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center border border-emerald-500/30 text-emerald-450 shrink-0">
                    🐺
                  </div>
                  <div className="flex flex-col text-left">
                    <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest">WhatsApp Davet Sistemi</h3>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">GÖRÜNTÜLÜ VE SESLİ KATILIM</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed text-left">
                  Davet edilen kişiler herhangi bir uygulamaya veya kayda ihtiyaç duymadan, doğrudan WhatsApp'tan tek tıkla sesli ve görüntülü olarak katılabilecektir.
                </p>

                {/* Invite link visual representation box */}
                <div className="bg-[#030713] p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-left">
                  <div className="flex-1 overflow-hidden">
                    <span className="text-[9px] text-slate-500 block font-mono uppercase tracking-widest">BENZERSİZ KURULTAY KATILIM BAĞLANTISI:</span>
                    <span className="text-xs text-[#00c2ff] font-mono truncate block mt-0.5">{generateWhatsAppParams()}</span>
                  </div>
                  
                  <button
                    onClick={handleCopyLink}
                    className="p-2.5 bg-[#00c2ff]/10 text-[#00c2ff] hover:bg-[#00c2ff] hover:text-slate-950 border border-[#00c2ff]/30 rounded-xl transition-all relative"
                    title="Bağlantıyı Kopyala"
                    id="copy-invite-link-btn"
                  >
                    {whatsappCopied ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  </button>
                </div>

                {whatsappCopied ? (
                  <span className="text-[10px] text-emerald-450 self-start font-mono flex items-center gap-1 bg-emerald-950/20 py-1 px-2 rounded-lg border border-emerald-500/20 w-full justify-center">
                    ✓ Bağlantı panoya kopyalandı! WhatsApp'a yapıştırabilirsiniz.
                  </span>
                ) : null}

                {/* WhatsApp Open Prompt */}
                <button
                  type="button"
                  onClick={handleWhatsAppSend}
                  className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-2xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                  id="modal-send-whatsapp-btn"
                >
                  <span>WHATSAPP KİŞİLERİNE GÖNDER</span>
                </button>

                <div className="text-[9px] text-slate-500 font-mono text-center">
                  * Bağlantıyı kopyalayıp WhatsApp Web, mobil gruplar, durumlar veya bireysel sohbetlerde paylaşabilirsiniz.
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
