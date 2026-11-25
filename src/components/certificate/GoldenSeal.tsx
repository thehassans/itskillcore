import React from "react";

/**
 * Architectural Minimalist Credential Seal for IT SkillCore.
 * Aligned strictly with the brand mark palette: Deep Pine (#063F38),
 * Electric Lime (#C9FA52), and Soft Cream (#F4FFE2).
 */
export default function GoldenSeal({
  className = "",
  label = "OFFICIAL SEAL",
}: {
  className?: string;
  label?: string;
}) {
  // 36 fine Swiss chronometer dial tick marks around the perimeter
  const ticks = Array.from({ length: 36 }, (_, idx) => {
    const angle = (idx * 10 * Math.PI) / 180;
    const isMajor = idx % 3 === 0;
    const rOuter = 74;
    const rInner = isMajor ? 68.5 : 71;
    const x1 = (90 + Math.cos(angle) * rInner).toFixed(2);
    const y1 = (90 + Math.sin(angle) * rInner).toFixed(2);
    const x2 = (90 + Math.cos(angle) * rOuter).toFixed(2);
    const y2 = (90 + Math.sin(angle) * rOuter).toFixed(2);
    return { x1, y1, x2, y2, isMajor };
  });

  return (
    <div className={`relative inline-flex select-none items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 180 180"
        className="h-full w-full drop-shadow-[0_4px_10px_rgba(6,63,56,0.12)]"
        aria-label="IT SkillCore Official Verification Seal"
      >
        <defs>
          <radialGradient id="pineCore" cx="45%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#095249" />
            <stop offset="70%" stopColor="#063F38" />
            <stop offset="100%" stopColor="#042B26" />
          </radialGradient>
          <path id="sealTopArc" d="M 32,90 A 58,58 0 1,1 148,90" />
          <path id="sealBottomArc" d="M 148,94 A 58,58 0 1,1 32,94" />
        </defs>

        {/* Outer Soft Cream Halo */}
        <circle cx="90" cy="90" r="82" fill="#F4FFE2" stroke="#063F38" strokeOpacity="0.22" strokeWidth="1.5" />

        {/* Deep Pine Dial Ring */}
        <circle cx="90" cy="90" r="76" fill="url(#pineCore)" stroke="#063F38" strokeWidth="1.5" />

        {/* Precision Dial Ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isMajor ? "#C9FA52" : "#F4FFE2"}
            strokeOpacity={t.isMajor ? "0.95" : "0.35"}
            strokeWidth={t.isMajor ? "1.6" : "0.9"}
            strokeLinecap="round"
          />
        ))}

        {/* Inner Fine Lime Ring */}
        <circle cx="90" cy="90" r="46" fill="#042B26" stroke="#C9FA52" strokeOpacity="0.65" strokeWidth="1.2" />

        {/* Top & Bottom Curved Typography */}
        <text
          fill="#F4FFE2"
          fontSize="9.6"
          fontWeight="700"
          letterSpacing="2.8"
          fontFamily="sans-serif"
        >
          <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
            IT SKILLCORE
          </textPath>
        </text>
        <text
          fill="#C9FA52"
          fontSize="8.2"
          fontWeight="700"
          letterSpacing="2.1"
          fontFamily="sans-serif"
        >
          <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">
            {label}
          </textPath>
        </text>

        {/* Minimalist Side Dots */}
        <circle cx="31" cy="90" r="2.2" fill="#C9FA52" />
        <circle cx="149" cy="90" r="2.2" fill="#C9FA52" />

        {/* Central Minimalist Geometric Mark (Inspired by it-skillcore-mark.svg) */}
        <path fill="#C9FA52" d="M 73 96 L 84 74 H 95 L 84 96 Z" />
        <circle fill="#C9FA52" cx="93.5" cy="66.5" r="4.6" />
        <path fill="#F4FFE2" d="M 88 96 L 96.5 79 H 104 L 95.5 96 Z" />

        {/* Crisp Verification Tag */}
        <rect
          x="52"
          y="104"
          width="76"
          height="16"
          rx="8"
          fill="#F4FFE2"
          stroke="#C9FA52"
          strokeWidth="1"
        />
        <text
          x="90"
          y="114.8"
          fill="#063F38"
          fontSize="8"
          fontWeight="800"
          letterSpacing="2.2"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          VERIFIED
        </text>
      </svg>
    </div>
  );
}
