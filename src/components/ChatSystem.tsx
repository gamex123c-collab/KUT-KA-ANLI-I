import React, { useState } from "react";
import { ChatMessage, Participant } from "../types";
import { Send, Pin, Trash2, Edit2, Globe, Sparkles, Smile, Image, Paperclip, MoreVertical, ShieldAlert } from "lucide-react";

interface ChatSystemProps {
  currentUser: Participant;
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onDeleteMessage: (id: string) => void;
  onEditMessage: (id: string, text: string) => void;
  onPinMessage: (id: string) => void;
  onAddLog: (msg: string, cat: "Güvenlik" | "Bağlantı" | "Sistem" | "Yapay Zeka", type?: "info" | "success" | "warning" | "danger") => void;
}

export default function ChatSystem({
  currentUser,
  messages,
  onSendMessage,
  onDeleteMessage,
  onEditMessage,
  onPinMessage,
  onAddLog
}: ChatSystemProps) {
  const [inputText, setInputText] = useState("");
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [translationLangs, setTranslationLangs] = useState<{ [id: string]: string }>({});
  const [translationLoadingId, setTranslationLoadingId] = useState<string | null>(null);

  // File Upload Simulators
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    const messageContent = inputText.trim();
    setInputText("");

    // Simulate Moderation via AI Endpoint
    try {
      onAddLog("Mesaj canılı içerik filtresinden geçiriliyor...", "Güvenlik", "info");
      const modRes = await fetch("/api/ai/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageContent, speaker: currentUser.name })
      });
      const modData = await modRes.json();

      if (!modData.isApproved) {
        onAddLog(`Küfür veya spam tespit edildi! Gönderen: ${currentUser.name}. Spam Puanı: ${modData.spamScore}`, "Güvenlik", "danger");
      }

      const attachments: any[] = [];
      if (selectedFile) {
        attachments.push({
          name: selectedFile.name,
          type: "document",
          size: selectedFile.size
        });
        setSelectedFile(null);
      }

      const newMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text: modData.cleanedMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isPinned: false,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      onSendMessage(newMsg);
      onAddLog("Sohbet mesajı başarıyla yayınlandı.", "Sistem", "success");
    } catch (err) {
      console.error(err);
      // Fallback
      const newMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text: messageContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isPinned: false
      };
      onSendMessage(newMsg);
    }
  };

  const handleTranslate = async (msgId: string, text: string, targetLang: string) => {
    setTranslationLoadingId(msgId);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang })
      });
      const data = await res.json();
      setTranslationLangs(prev => ({ ...prev, [msgId]: data.text }));
      onAddLog(`Mesaj '${targetLang}' diline başarıyla çevrildi.`, "Yapay Zeka", "success");
    } catch (err) {
      console.error(err);
    } finally {
      setTranslationLoadingId(null);
    }
  };

  // Drag and drop attachment simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`
      });
      onAddLog(`Sohbete yüklenecek dosya ayarlandı: ${file.name}`, "Sistem", "info");
    }
  };

  const selectManualFile = () => {
    setSelectedFile({
      name: "Töre_Maddeleri_Kurultay_V9.pdf",
      size: "2.4 MB"
    });
    onAddLog("Varsayılan döküman PDF eki hazırlandı.", "Sistem", "info");
  };

  return (
    <div
      className={`bg-[#0a1128]/85 rounded-xl border border-[#d4af37]/25 h-full flex flex-col justify-between overflow-hidden relative ${dragActive ? "border-amber-400" : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      id="chat-box"
    >
      {/* File Drag Highlight overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-[#050b18]/90 z-50 flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-400">
          <Paperclip size={36} className="text-[#d4af37] animate-bounce mb-3" />
          <span className="text-sm font-bold text-slate-200">Dosyaları Buraya Bırakın</span>
          <p className="text-xs text-slate-400 mt-1">Ötüken Şifreli Sunucusu ile anında buluta yüklenir</p>
        </div>
      )}

      {/* Header */}
      <div className="p-3 bg-[#0c142c] border-b border-[#d4af37]/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">Göktürk Canlı Sohbet</h3>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">End-to-End TLS</span>
      </div>

      {/* Pinned message marquee element if any exists */}
      {messages.some(m => m.isPinned) && (
        <div className="bg-amber-950/20 border-b border-amber-500/10 p-2 text-[11px] text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Pin size={11} className="text-[#d4af37] rotate-45 shrink-0" />
            <span className="truncate">
              <strong>Sabitlendi:</strong> {messages.find(m => m.isPinned)?.text}
            </span>
          </div>
          <button
            onClick={() => {
              const pinned = messages.find(m => m.isPinned);
              if (pinned) onPinMessage(pinned.id);
            }}
            className="text-[9px] text-red-400 cursor-pointer uppercase font-bold shrink-0 ml-2"
          >
            Kaldır
          </button>
        </div>
      )}

      {/* Messages Stream list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 max-h-[350px]">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 italic text-[11px] py-16">
            Henüz sohbet başlatılmadı. İlk kutlu mesajı siz atın.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1 text-xs group" id={`chat-msg-${msg.id}`}>
              {/* Heading name */}
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${msg.senderId === currentUser.id ? "text-amber-400" : "text-cyan-400"}`}>
                    {msg.senderName}
                  </span>
                  <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">
                    {msg.senderRole}
                  </span>
                </div>
                
                {/* Meta details / actions */}
                <div className="flex items-center gap-1 text-[9px] text-slate-400 opacity-60 group-hover:opacity-100 transition-all">
                  <span>{msg.timestamp}</span>
                  
                  {/* Pin action */}
                  <button onClick={() => onPinMessage(msg.id)} title="Mesajlı Sabitle" className="hover:text-amber-400">
                    <Pin size={10} className={msg.isPinned ? "text-[#d4af37] rotate-45" : ""} />
                  </button>

                  {/* Edit action */}
                  {msg.senderId === currentUser.id && (
                    <button
                      onClick={() => {
                        setEditingMsgId(msg.id);
                        setEditingText(msg.text);
                      }}
                      title="Düzenle"
                      className="hover:text-blue-400"
                    >
                      <Edit2 size={10} />
                    </button>
                  )}

                  {/* Delete action */}
                  {(msg.senderId === currentUser.id || currentUser.role === "Kağan") && (
                    <button onClick={() => onDeleteMessage(msg.id)} title="Sil" className="hover:text-red-400">
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>

              {/* Message text / attachments */}
              {editingMsgId === msg.id ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 bg-slate-900 text-xs text-white p-1 rounded border border-blue-500 outline-none"
                    id={`edit-input-${msg.id}`}
                  />
                  <button
                    onClick={() => {
                      onEditMessage(msg.id, editingText);
                      setEditingMsgId(null);
                    }}
                    className="px-2 py-0.5 bg-emerald-600 text-slate-950 font-bold text-[10px] rounded hover:bg-emerald-500"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => setEditingMsgId(null)}
                    className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded hover:bg-slate-700"
                  >
                    X
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1 bg-[#050b18]/40 p-2 rounded border border-white/5">
                  <p className="text-slate-200 leading-relaxed break-words">{msg.text}</p>
                  
                  {/* Attachments rendering */}
                  {msg.attachments && msg.attachments.map((file, i) => (
                    <div key={i} className="mt-1 flex items-center justify-between text-[10px] bg-slate-950/60 p-1.5 rounded border border-dashed border-[#d4af37]/30">
                      <span className="text-[#d4af37] truncate">📄 {file.name} ({file.size})</span>
                      <a href="#" className="text-cyan-400 underline font-bold" onClick={(e) => { e.preventDefault(); alert("Dosya korumalı bulut ortamından indiriliyor."); }}>İndir</a>
                    </div>
                  ))}

                  {/* Translations if translated */}
                  {translationLangs[msg.id] && (
                    <div className="mt-1.5 pt-1.5 border-t border-cyan-500/10 text-[10px] italic text-cyan-300 bg-cyan-950/20 px-1.5 py-1 rounded">
                      🗣️ {translationLangs[msg.id]}
                    </div>
                  )}

                  {/* Quick Translation menu triggers */}
                  <div className="flex gap-1.5 mt-1">
                    <button
                      onClick={() => handleTranslate(msg.id, msg.text, "English")}
                      disabled={translationLoadingId === msg.id}
                      className="text-[9px] text-[#d4af37] hover:underline"
                    >
                      ENG'e Çevir
                    </button>
                    <button
                      onClick={() => handleTranslate(msg.id, msg.text, "Old_Turkic_Runic_Latin")}
                      disabled={translationLoadingId === msg.id}
                      className="text-[9px] text-cyan-400 hover:underline"
                    >
                      Göktürkçeye Çevir (Tamga)
                    </button>
                    {translationLoadingId === msg.id && (
                      <span className="text-[8px] text-amber-200 animate-pulse">Çeviriliyor...</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input section & attachment list pre-send */}
      <div className="p-3 bg-[#0c142c] border-t border-[#d4af37]/20 flex flex-col gap-2">
        {selectedFile && (
          <div className="flex items-center justify-between text-[9px] bg-slate-950 p-1.5 rounded border border-[#d4af37]/30">
            <span className="text-slate-300 font-medium truncate">Hazırlanan Ek: {selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="text-red-400 font-bold hover:underline">X</button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2">
          {/* Quick attachment mock triggers */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={selectManualFile}
              className="p-2 bg-slate-950 border border-slate-800 rounded hover:border-[#d4af37]/50 text-slate-400 hover:text-[#d4af37]"
              title="Dosya Gönder"
              id="clip-attachment-btn"
            >
              <Paperclip size={13} />
            </button>
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Fikir belirtin veya bir dosya bırakın..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-[#050b18] border border-[#d4af37]/25 rounded-lg py-1.5 pl-3 pr-8 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              id="chat-text-input"
            />
            {/* Quick emoji popover or sign */}
            <button
              type="button"
              onClick={() => setInputText(prev => prev + " 🐺")}
              className="absolute right-2 top-1.5 text-slate-400 hover:text-[#d4af37]"
              title="Börü Ekle"
            >
              🐺
            </button>
          </div>

          <button
            type="submit"
            className="px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded transition-all flex items-center justify-center"
            id="send-message-btn"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}
