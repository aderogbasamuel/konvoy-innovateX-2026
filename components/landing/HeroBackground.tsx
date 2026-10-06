import { useId } from "react";

// Decorative hero background: atmospheric hills, contour lines, a shaded road
// and a loaded-up danfo-style van. Pure SVG, no image requests.
// Hidden from assistive tech. Same props/usage as before (none).
export default function HeroBackground() {
  // Unique ids so gradients/clips don't collide if this renders twice.
  const uid = useId().replace(/:/g, "");
  const id = (n) => `${uid}-${n}`;
  const url = (n) => `url(#${id(n)})`;

  const ROAD = "M-60 740 C 260 700, 420 780, 760 730 S 1200 640, 1500 690";
  const BODY =
    "M4 68 V22 Q4 10 16 10 H116 C126 10 132 14 138 24 L150 40 Q154 44 160 45 L166 47 Q172 49 172 56 V68 Z";

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMinYMax slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        {/* Warm haze behind the far hills */}
        <radialGradient id={id("glow")} gradientUnits="userSpaceOnUse" cx="1100" cy="380" r="560">
          <stop offset="0" stopColor="#FFC20E" stopOpacity="0.16" />
          <stop offset="0.55" stopColor="#8FD1A9" stopOpacity="0.05" />
          <stop offset="1" stopColor="#8FD1A9" stopOpacity="0" />
        </radialGradient>

        {/* Hills get darker and denser as they come forward (depth) */}
        <linearGradient id={id("hillFar")} gradientUnits="userSpaceOnUse" x1="0" y1="340" x2="0" y2="700">
          <stop offset="0" stopColor="#1E7A4F" stopOpacity="0.38" />
          <stop offset="1" stopColor="#0B3B25" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={id("hillMid")} gradientUnits="userSpaceOnUse" x1="0" y1="520" x2="0" y2="760">
          <stop offset="0" stopColor="#11593A" stopOpacity="0.75" />
          <stop offset="1" stopColor="#072C1A" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={id("verge")} gradientUnits="userSpaceOnUse" x1="0" y1="690" x2="0" y2="800">
          <stop offset="0" stopColor="#052A18" />
          <stop offset="1" stopColor="#021109" />
        </linearGradient>

        {/* Asphalt: a touch lighter near the viewer, darker in the distance */}
        <linearGradient id={id("asphalt")} gradientUnits="userSpaceOnUse" x1="-60" y1="0" x2="1500" y2="0">
          <stop offset="0" stopColor="#10452B" />
          <stop offset="0.5" stopColor="#0A3722" />
          <stop offset="1" stopColor="#062A19" />
        </linearGradient>

        {/* Van */}
        <linearGradient id={id("paint")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE170" />
          <stop offset="0.35" stopColor="#FFC20E" />
          <stop offset="1" stopColor="#C98F00" />
        </linearGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3C7A62" />
          <stop offset="0.45" stopColor="#123F2B" />
          <stop offset="1" stopColor="#08241A" />
        </linearGradient>
        <radialGradient id={id("rim")} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#F1F4F2" />
          <stop offset="1" stopColor="#7C8782" />
        </radialGradient>
        <linearGradient id={id("beam")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF3B0" stopOpacity="0.4" />
          <stop offset="1" stopColor="#FFF3B0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("mattress")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4EEDC" />
          <stop offset="1" stopColor="#C9C1A8" />
        </linearGradient>

        <filter id={id("blur")} x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation="3" />
        </filter>

        <clipPath id={id("body")}>
          <path d={BODY} />
        </clipPath>
        <clipPath id={id("wins")}>
          <rect x="14" y="18" width="28" height="20" rx="3" />
          <rect x="48" y="18" width="28" height="20" rx="3" />
          <rect x="82" y="18" width="20" height="20" rx="3" />
        </clipPath>
      </defs>

      {/* Atmosphere + far hills */}
      <rect width="1440" height="800" fill={url("glow")} />
      <path d="M-40 470 C 200 400, 460 480, 720 420 S 1160 330, 1500 380 V800 H-40 Z" fill={url("hillFar")} />

      {/* Contour lines */}
      <g fill="none" stroke="#8FD1A9" strokeWidth="1.5" opacity="0.16">
        <path d="M-40 640 C 200 560, 380 720, 640 640 S 1100 540, 1500 620" />
        <path d="M-40 580 C 220 490, 420 660, 680 580 S 1120 470, 1500 550" />
        <path d="M-40 520 C 240 420, 460 600, 720 520 S 1140 400, 1500 480" />
        <path d="M-40 460 C 260 350, 500 540, 760 460 S 1160 330, 1500 410" />
        <path d="M-40 400 C 280 280, 540 480, 800 400 S 1180 270, 1500 340" />
        <path d="M-40 340 C 300 210, 580 420, 840 340 S 1200 210, 1500 270" />
        <path d="M-40 280 C 320 140, 620 360, 880 280 S 1220 150, 1500 200" />
      </g>

      {/* Mid hill + roadside bushes */}
      <path d="M-40 610 C 220 560, 440 640, 700 590 S 1160 520, 1500 570 V800 H-40 Z" fill={url("hillMid")} />
      <g fill="#0A3F27" opacity="0.9">
        <ellipse cx="330" cy="688" rx="30" ry="14" />
        <ellipse cx="352" cy="692" rx="20" ry="10" />
        <ellipse cx="977" cy="650" rx="28" ry="13" />
        <ellipse cx="1145" cy="624" rx="34" ry="15" />
        <ellipse cx="1172" cy="630" rx="20" ry="10" />
      </g>

      {/* Foreground verge */}
      <path d="M-60 792 C 260 752, 420 832, 760 782 S 1200 692, 1500 742 V800 H-60 Z" fill={url("verge")} />

      {/* Road: shoulder, painted edge lines, asphalt, centre dashes */}
      <path d={ROAD} fill="none" stroke="#0D3D26" strokeWidth="92" strokeLinecap="round" opacity="0.55" />
      <path d={ROAD} fill="none" stroke="#E8F5EC" strokeWidth="80" strokeLinecap="round" opacity="0.32" />
      <path d={ROAD} fill="none" stroke={url("asphalt")} strokeWidth="72" strokeLinecap="round" />
      <path d={ROAD} fill="none" stroke="#FFC20E" strokeWidth="3.5" strokeDasharray="20 24" opacity="0.85" />

      {/* Van */}
      <g transform="translate(28 656)">
        {/* Headlight beam + ground shadow */}
        <polygon points="170,52 340,26 340,92 170,60" fill={url("beam")} />
        <ellipse cx="88" cy="83" rx="96" ry="6" fill="#000" opacity="0.5" filter={url("blur")} />

        {/* Roof load: mattress, boxes, duffel, tied down */}
        <rect x="12" y="3" width="108" height="3" rx="1.5" fill="#1A1A1A" />
        <rect x="22" y="6" width="3" height="4" fill="#1A1A1A" />
        <rect x="106" y="6" width="3" height="4" fill="#1A1A1A" />

        <rect x="12" y="-14" width="108" height="17" rx="8" fill={url("mattress")} />
        <g stroke="#B9B093" strokeWidth="1" opacity="0.7">
          <line x1="36" y1="-12" x2="36" y2="1" />
          <line x1="66" y1="-12" x2="66" y2="1" />
          <line x1="96" y1="-12" x2="96" y2="1" />
        </g>

        <rect x="22" y="-38" width="38" height="24" rx="2" fill="#B5651D" />
        <rect x="38" y="-38" width="6" height="24" fill="#D9A05B" opacity="0.8" />
        <rect x="22" y="-38" width="38" height="4" rx="2" fill="#000" opacity="0.14" />

        <rect x="64" y="-30" width="32" height="16" rx="7" fill="#2F6F8F" />
        <path d="M74 -30 Q80 -38 86 -30" fill="none" stroke="#1E4A60" strokeWidth="2.5" />
        <line x1="68" y1="-22" x2="92" y2="-22" stroke="#1E4A60" strokeWidth="1.2" />

        <rect x="98" y="-28" width="18" height="14" rx="2" fill="#5B4B8A" />
        <rect x="98" y="-28" width="18" height="3" fill="#fff" opacity="0.12" />

        <g stroke="#141414" strokeWidth="2" opacity="0.75" fill="none">
          <path d="M52 -39 V5" />
          <path d="M92 -31 V5" />
          <path d="M52 -39 Q72 -44 92 -31" />
        </g>

        {/* Body */}
        <path d={BODY} fill={url("paint")} />
        <g clipPath={url("body")}>
          {/* Black danfo stripe */}
          <rect x="0" y="45" width="172" height="8" fill="#241A00" />
          {/* Wheel arches */}
          <circle cx="38" cy="68" r="17.5" fill="#07150D" />
          <circle cx="134" cy="68" r="17.5" fill="#07150D" />
          {/* Lower-body shade */}
          <rect x="0" y="54" width="172" height="14" fill="#000" opacity="0.12" />
        </g>
        <path d="M12 12 H114 C123 12 128 15 133 23" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4" />

        {/* Windows */}
        <g fill={url("glass")}>
          <rect x="14" y="18" width="28" height="20" rx="3" />
          <rect x="48" y="18" width="28" height="20" rx="3" />
          <rect x="82" y="18" width="20" height="20" rx="3" />
          <path d="M108 18 H124 Q129 18 132 23 L142 37 H108 Z" />
        </g>
        {/* Passenger silhouettes */}
        <g clipPath={url("wins")} fill="#04140C" opacity="0.8">
          <circle cx="27" cy="28" r="4.5" />
          <ellipse cx="27" cy="39" rx="8" ry="7" />
          <circle cx="90" cy="27" r="4.5" />
          <ellipse cx="90" cy="38" rx="8" ry="7" />
        </g>
        {/* Glass glare */}
        <g fill="#fff" opacity="0.14">
          <path d="M20 18 L30 18 L22 38 L14 38 Z" />
          <path d="M54 18 L64 18 L56 38 L48 38 Z" />
          <path d="M114 18 H122 L128 28 H112 Z" />
        </g>

        {/* Door seam, handle, mirror */}
        <path d="M106 14 V64" stroke="#8A6200" strokeWidth="1" opacity="0.7" />
        <rect x="96" y="40" width="7" height="2.5" rx="1" fill="#241A00" />
        <rect x="143" y="30" width="5" height="9" rx="1.5" fill="#1A1A1A" />

        {/* Lights + bumpers */}
        <rect x="0" y="32" width="4" height="12" rx="1" fill="#E5322D" />
        <rect x="166" y="50" width="6" height="7" rx="2" fill="#FFF6C8" />
        <rect x="-2" y="62" width="20" height="7" rx="2" fill="#1A1A1A" />
        <rect x="154" y="62" width="20" height="7" rx="2" fill="#1A1A1A" />

        {/* Wheels */}
        {[38, 134].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="68" r="14" fill="#0B0B0B" />
            <circle cx={cx} cy="68" r="14" fill="none" stroke="#2A2A2A" strokeWidth="1.5" />
            <circle cx={cx} cy="68" r="8.5" fill={url("rim")} />
            <circle cx={cx} cy="68" r="5.5" fill="#4B5551" />
            <circle cx={cx} cy="68" r="2.2" fill="#D3D9D6" />
            <g stroke="#2F3834" strokeWidth="1.2">
              <line x1={cx} y1="60" x2={cx} y2="76" />
              <line x1={cx - 8} y1="68" x2={cx + 8} y2="68" />
              <line x1={cx - 5.6} y1="62.4" x2={cx + 5.6} y2="73.6" />
              <line x1={cx - 5.6} y1="73.6" x2={cx + 5.6} y2="62.4" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}