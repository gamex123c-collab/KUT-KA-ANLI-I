import React, { useState, useRef, useEffect } from "react";
import { WhiteboardElement } from "../types";
import { Sparkles, Trash2, Square, Circle as CircleIcon, MoveRight, PenTool, Type, HelpCircle } from "lucide-react";

interface WhiteboardProps {
  onAddLog: (msg: string, cat: "Güvenlik" | "Bağlantı" | "Sistem" | "Yapay Zeka", type?: "info" | "success" | "warning" | "danger") => void;
}

export default function Whiteboard({ onAddLog }: WhiteboardProps) {
  const [elements, setElements] = useState<WhiteboardElement[]>([
    { id: "e1", type: "rect", x: 60, y: 50, width: 140, height: 70, color: "#d4af37", text: "Kurultay Olasılığı" },
    { id: "e2", type: "circle", x: 280, y: 85, width: 90, height: 90, color: "#00c2ff", text: "Alp Katılımı" },
    { id: "e3", type: "line", x: 200, y: 85, points: [{ x: 200, y: 85 }, { x: 235, y: 85 }], color: "#ffffff" }
  ]);
  const [tool, setTool] = useState<"rect" | "circle" | "line" | "free" | "text">("free");
  const [color, setColor] = useState<string>("#d4af37");
  const [textInput, setTextInput] = useState<string>("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const canvasRef = useRef<SVGSVGElement | null>(null);

  const startDraw = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    if (tool === "text") {
      const newEl: WhiteboardElement = {
        id: `w-${Date.now()}`,
        type: "text",
        x,
        y,
        color,
        text: textInput || "Kutlu Yazı",
      };
      setElements([...elements, newEl]);
      setIsDrawing(false);
      setTextInput("");
      onAddLog("Yazı ögesi tahtaya eklendi", "Sistem", "info");
      return;
    }

    const newEl: WhiteboardElement = {
      id: `w-${Date.now()}`,
      type: tool,
      x,
      y,
      width: 0,
      height: 0,
      color,
      points: tool === "free" ? [{ x, y }] : undefined,
    };
    setElements([...elements, newEl]);
  };

  const draw = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || elements.length === 0) return;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updated = [...elements];
    const target = updated[updated.length - 1];

    if (tool === "free" && target.points) {
      target.points = [...target.points, { x, y }];
    } else {
      target.width = x - target.x;
      target.height = y - target.y;
    }
    setElements(updated);
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setElements([]);
    onAddLog("Beyaz tahta temizlendi", "Sistem", "warning");
  };

  const getAiAdvisor = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/whiteboard-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elements,
          userInstructions: "Çizilen bu şemayı Kut Kağanlığı mimarisi için optimize et ve önerilerde bulun."
        })
      });
      const data = await res.json();
      setAiFeedback(data.feedback);
      onAddLog("Gökbörü Şema Danışmanı başarıyla çalıştırıldı", "Yapay Zeka", "success");
    } catch (err) {
      console.error(err);
      setAiFeedback("Öneri alınamadı. Lütfen API bağlantısını kontrol edin.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050b18]/60 rounded-xl border border-[#d4af37]/20 overflow-hidden" id="whiteboard-container">
      {/* Title & Toolbar */}
      <div className="p-3 bg-[#0a1128] border-b border-[#d4af37]/20 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Kurultay Akıllı Tahtası</h4>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool("free")}
            className={`p-1.5 rounded transition ${tool === "free" ? "bg-[#d4af37] text-[#050b18]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            title="Serbest Çizim"
            id="tool-free"
          >
            <PenTool size={14} />
          </button>
          <button
            onClick={() => setTool("rect")}
            className={`p-1.5 rounded transition ${tool === "rect" ? "bg-[#d4af37] text-[#050b18]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            title="Dikdörtgen"
            id="tool-rect"
          >
            <Square size={14} />
          </button>
          <button
            onClick={() => setTool("circle")}
            className={`p-1.5 rounded transition ${tool === "circle" ? "bg-[#d4af37] text-[#050b18]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            title="Daire"
            id="tool-circle"
          >
            <CircleIcon size={14} />
          </button>
          <button
            onClick={() => setTool("line")}
            className={`p-1.5 rounded transition ${tool === "line" ? "bg-[#d4af37] text-[#050b18]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            title="Ok / Bağlantı Çizgisi"
            id="tool-line"
          >
            <MoveRight size={14} />
          </button>
          <button
            onClick={() => setTool("text")}
            className={`p-1.5 rounded transition ${tool === "text" ? "bg-[#d4af37] text-[#050b18]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            title="Metin Yaz"
            id="tool-text"
          >
            <Type size={14} />
          </button>

          <span className="h-5 w-px bg-slate-700 mx-1"></span>

          {tool === "text" && (
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Yazı yazın..."
              className="px-2 py-0.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 outline-none w-24"
              id="whiteboard-text-input"
            />
          )}

          {/* Color pickers */}
          <div className="flex gap-1">
            {["#d4af37", "#00c2ff", "#ff4a4a", "#4ade80", "#ffffff"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-4 h-4 rounded-full border ${color === c ? "border-white scale-125" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <span className="h-5 w-px bg-slate-700 mx-1"></span>

          <button
            onClick={clearCanvas}
            className="p-1 px-2 text-[10px] uppercase font-bold text-red-400 bg-red-950/40 hover:bg-red-900/30 rounded border border-red-500/20 transition-all"
            title="Temizle"
            id="clear-whiteboard-btn"
          >
            <Trash2 size={12} className="inline mr-1" /> Temizle
          </button>
        </div>
      </div>

      {/* Main Grid: SVG Canvas + AI Advisor split */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        {/* SVG Drawing Zone */}
        <div className="col-span-2 relative bg-slate-950 flex flex-col justify-between border-r border-[#d4af37]/10" style={{ minHeight: "260px" }}>
          <div className="absolute top-2 left-2 text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded pointer-events-none uppercase">
            Canlı Çizim Sahnesi (Yapay Zeka Destekli)
          </div>
          
          <svg
            ref={canvasRef}
            className="w-full h-full cursor-crosshair select-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            id="whiteboard-svg"
          >
            {elements.map((el) => {
              if (el.type === "rect") {
                return (
                  <g key={el.id}>
                    <rect
                      x={el.x}
                      y={el.y}
                      width={el.width || 0}
                      height={el.height || 0}
                      fill="none"
                      stroke={el.color}
                      strokeWidth="2.5"
                    />
                    {el.text && (
                      <text x={el.x + 8} y={el.y + 20} fill="#ffffff" fontSize="10" fontFamily="sans-serif">
                        {el.text}
                      </text>
                    )}
                  </g>
                );
              } else if (el.type === "circle") {
                const rx = Math.abs((el.width || 0) / 2);
                const ry = Math.abs((el.height || 0) / 2);
                const cx = el.x + rx;
                const cy = el.y + ry;
                return (
                  <g key={el.id}>
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={rx || 0}
                      ry={ry || 0}
                      fill="none"
                      stroke={el.color}
                      strokeWidth="2.5"
                    />
                    {el.text && (
                      <text x={cx - 30} y={cy + 4} fill="#ffffff" fontSize="10" fontFamily="sans-serif">
                        {el.text}
                      </text>
                    )}
                  </g>
                );
              } else if (el.type === "line") {
                return (
                  <line
                    key={el.id}
                    x1={el.x}
                    y1={el.y}
                    x2={el.x + (el.width || 0)}
                    y2={el.y + (el.height || 0)}
                    stroke={el.color}
                    strokeWidth="3"
                    markerEnd="url(#arrow)"
                  />
                );
              } else if (el.type === "free" && el.points) {
                return (
                  <path
                    key={el.id}
                    d={`M ${el.points.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
                    fill="none"
                    stroke={el.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              } else if (el.type === "text" && el.text) {
                return (
                  <text
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    fill={el.color}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {el.text}
                  </text>
                );
              }
              return null;
            })}
          </svg>
        </div>

        {/* AI Sketch Advisor and Blueprint feedback */}
        <div className="bg-[#080d1e] p-3 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-cyan-400 mb-2">
              <Sparkles size={14} className="animate-spin" />
              <span className="text-xs font-bold tracking-wider uppercase">GÖKBÖRÜ MİMARİ ANALİZ</span>
            </div>
            
            <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
              Çizdiğiniz akış semalarını ve topolojileri gerçek zamanlı tarayıp, sistem performansını artıracak Kutlu Kurultay tavsiyeleri edinin.
            </p>

            {aiLoading ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-amber-200">Gökbörü Şema Planları Çözümlüyor...</span>
              </div>
            ) : aiFeedback ? (
              <div className="bg-[#0c142c] p-2.5 rounded border border-cyan-500/20 text-[11px] text-slate-200 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-sans">
                {aiFeedback}
              </div>
            ) : (
              <div className="p-4 rounded border border-slate-800 text-center text-slate-500 text-[10px] italic">
                Cihaz şeması veya akış önerisi talep etmek için aşağıdaki butona tıklayın.
              </div>
            )}
          </div>

          <button
            onClick={getAiAdvisor}
            disabled={aiLoading}
            className="mt-3 w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[11px] rounded transition-all uppercase flex items-center justify-center gap-2 tracking-wider shadow-md"
            id="get-whiteboard-ai-advisor-btn"
          >
            <Sparkles size={12} /> ŞEMAYI YAPAY ZEKA İLE DEĞERLENDİR
          </button>
        </div>
      </div>
    </div>
  );
}
