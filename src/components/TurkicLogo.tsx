import React from "react";

interface TurkicLogoProps {
  className?: string;
  showText?: boolean;
}

export default function TurkicLogo({ className = "", showText = true }: TurkicLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="kut-logo-wrapper">
      {/* Scalable, high-fidelity replica of the Turkic Sky-Blue Crescent & Runes Flag */}
      <svg
        width="54"
        height="54"
        viewBox="0 0 400 400"
        className="rounded-xl shadow-md border border-white/10"
        style={{ background: "#00C2FF" }}
        id="kut-logo-svg"
      >
        <g transform="translate(0, 0)">
          {/* Celestial White Crescent Moon */}
          <path
            d="M 180 80 
               A 120 120 0 1 0 180 320 
               A 100 100 0 1 1 180 80 Z"
            fill="#FFFFFF"
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
          />

          {/* Central Arrow/Upward Gun/Tamga Icon inside the protective Crescent arm */}
          <g transform="translate(155, 140)">
            {/* Arrowhead pointing up */}
            <path
              d="M 0 0 L -25 25 L -10 25 L -10 40 L 10 40 L 10 25 L 25 25 Z"
              fill="#FFFFFF"
            />
            
            {/* Star-containing Diamond container underneath the arrow stem */}
            <path
              d="M 0 42 L 25 67 L 0 92 L -25 67 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            {/* Central 5-pointed Star */}
            <path
              d="M 0 57 L 3 64 L 11 65 L 5 70 L 7 78 L 0 74 L -7 78 L -5 70 L -11 65 L -3 64 Z"
              fill="#FFFFFF"
            />
          </g>

          {/* Orkhon Turkic Runes (Spelling 'TÜRÜK / KUT') */}
          <g transform="translate(230, 160)" stroke="#FFFFFF" strokeWidth="2" fill="#FFFFFF" strokeLinecap="round">
            {/* Rune 1 (Arrow with two horizontal flags / 't' rune) */}
            <path
              d="M 15 0 L 15 80 M 15 20 Q 35 30 15 45 M 15 35 Q 35 45 15 60"
              fill="none"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            
            {/* Rune 2 (Curved crescent symbol / 'ü' rune) */}
            <path
              d="M 50 15 C 65 30 65 50 50 65 M 58 10 C 80 30 80 50 58 70"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Rune 3 (H-shaped Orkhon character / 'r' or 'ük' rune) */}
            <path
              d="M 90 10 L 90 70 M 120 10 L 120 70 M 90 35 L 120 35"
              fill="none"
              strokeWidth="8"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span className="text-xl font-bold tracking-wider text-amber-400 font-sans" style={{ textShadow: "0 0 10px rgba(251,191,36,0.3)" }}>
            KUT KAĞANLIĞI
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/80 font-mono mt-0.5">
            Ötüken İletişim Ağı
          </span>
        </div>
      )}
    </div>
  );
}
