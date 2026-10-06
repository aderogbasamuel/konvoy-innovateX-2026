// Decorative background for the "Where are you headed?" section.
// A cable-stayed bridge at golden hour: a convoy crossing the deck, a far-lane car heading
// the other way, drifting clouds and birds, a ferry on the water, a blinking tower beacon.
// Self-contained: every animation lives in the SVG's own <style> and only runs for people who
// have not asked for reduced motion (vehicles park on the bridge instead).

const TOWERS = [420, 1020];
const PIERS = [100, 720, 1340];
const STAYS = Array.from({ length: 9 }, (_, k) => k);
const CROSSBARS: [number, number][] = [[120, 8], [190, 12], [260, 17]];
const LAMPS = Array.from({ length: 12 }, (_, i) => 60 + i * 120);

// Waves repeat every 120 units, so shifting by 120 loops seamlessly
const WAVES = (y: number) => `M-20 ${y} q30 -8 60 0` + " t60 0".repeat(26);
// Truss under the deck
const TRUSS = "M-20 298" + " l12 14 l12 -14".repeat(62);

// Far-shore skyline: [x, width, height]
const SKYLINE: [number, number, number][] = [
  [10, 34, 62], [48, 24, 92], [76, 38, 54], [118, 22, 118], [144, 30, 70], [190, 26, 88], [224, 34, 50], [270, 22, 104],
  [600, 30, 66], [634, 24, 96], [662, 36, 58], [704, 20, 126], [728, 32, 74], [766, 26, 100], [820, 38, 52], [864, 24, 84],
  [1110, 28, 70], [1142, 22, 110], [1168, 36, 60], [1210, 24, 90], [1238, 32, 130], [1274, 26, 76], [1304, 34, 54], [1346, 22, 98], [1372, 30, 66], [1406, 34, 84],
];

const WHEEL = { fill: "#0A3B22", stroke: "#FFC20E", strokeWidth: 2 };

function Van() {
  return (
    <g>
      <g fill="#0A3B22" opacity="0.85">
        <rect x="14" y="-44" width="24" height="9" rx="2" />
        <rect x="42" y="-41" width="18" height="6" rx="2" />
        <rect x="0" y="-34" width="84" height="26" rx="7" />
      </g>
      <g fill="#FFC20E">
        <rect x="8" y="-29" width="14" height="11" rx="2" />
        <rect x="26" y="-29" width="14" height="11" rx="2" />
        <rect x="44" y="-29" width="14" height="11" rx="2" />
        <path d="M62 -29 H72 Q77 -29 78 -23 L79 -18 H62 Z" />
        <rect x="81" y="-20" width="3" height="5" rx="1" />
      </g>
      <circle cx="20" cy="-8" r="8" {...WHEEL} />
      <circle cx="66" cy="-8" r="8" {...WHEEL} />
    </g>
  );
}

function Bus() {
  return (
    <g>
      <g fill="#0A3B22" opacity="0.85">
        <rect x="10" y="-52" width="30" height="9" rx="2" />
        <rect x="46" y="-49" width="22" height="6" rx="2" />
        <rect x="74" y="-50" width="18" height="7" rx="2" />
        <rect x="0" y="-44" width="120" height="36" rx="8" />
      </g>
      <g fill="#FFC20E">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={8 + i * 19} y="-38" width="14" height="13" rx="2" />
        ))}
        <path d="M102 -38 H112 Q117 -38 118 -31 L118 -25 H102 Z" />
        <rect x="0" y="-19" width="120" height="4" />
      </g>
      <circle cx="26" cy="-9" r="9" {...WHEEL} />
      <circle cx="94" cy="-9" r="9" {...WHEEL} />
    </g>
  );
}

function Car() {
  return (
    <g>
      <g fill="#0A3B22" opacity="0.85">
        <rect x="0" y="-22" width="62" height="14" rx="5" />
        <path d="M12 -22 L20 -35 H42 L52 -22 Z" />
      </g>
      <path d="M18 -23 L23 -32 H31 V-23 Z M34 -23 V-32 H41 L48 -23 Z" fill="#FFC20E" />
      <circle cx="14" cy="-7" r="7" {...WHEEL} />
      <circle cx="48" cy="-7" r="7" {...WHEEL} />
    </g>
  );
}

export default function SearchBackground() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute bottom-0 left-0 h-[220px] w-full md:h-[360px]"
    >
      <defs>
        <pattern id="kv-win" width="8" height="10" patternUnits="userSpaceOnUse">
          <rect x="2" y="3" width="3" height="4" fill="#FFC20E" />
        </pattern>
      </defs>

      <style>{`
        .kv-d1 { transform: translateX(900px); }
        .kv-d2 { transform: translateX(740px); }
        .kv-d3 { transform: translateX(610px); }
        .kv-left { transform: translateX(2000px); }
        .kv-cloud-a { transform: translateX(260px); }
        .kv-cloud-b { transform: translateX(820px); }
        .kv-cloud-c { transform: translateX(1180px); }
        .kv-birds { transform: translateX(520px); }
        .kv-boat { transform: translateX(1050px); }
        @media (prefers-reduced-motion: no-preference) {
          .kv-d1, .kv-d2, .kv-d3 { animation: kv-drive 20s linear infinite; }
          .kv-d1 { animation-delay: -3.4s; }
          .kv-d2 { animation-delay: -1.7s; }
          .kv-left { animation: kv-left 26s linear infinite -9s; }
          .kv-cloud-a { animation: kv-sky 90s linear infinite -20s; }
          .kv-cloud-b { animation: kv-sky 120s linear infinite -70s; }
          .kv-cloud-c { animation: kv-sky 100s linear infinite -45s; }
          .kv-birds { animation: kv-sky 55s linear infinite -15s; }
          .kv-boat { animation: kv-boat 80s linear infinite -30s; }
          .kv-wave-a { animation: kv-wave 6s linear infinite; }
          .kv-wave-b { animation: kv-wave 9s linear infinite; }
          .kv-beacon { animation: kv-blink 2.4s ease-in-out infinite; }
        }
        @keyframes kv-drive { from { transform: translateX(-220px); } to { transform: translateX(1660px); } }
        @keyframes kv-left { from { transform: translateX(-270px); } to { transform: translateX(2870px); } }
        @keyframes kv-sky { from { transform: translateX(-260px); } to { transform: translateX(1700px); } }
        @keyframes kv-boat { from { transform: translateX(1700px); } to { transform: translateX(-200px); } }
        @keyframes kv-wave { from { transform: translateX(0); } to { transform: translateX(-120px); } }
        @keyframes kv-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
      `}</style>

      {/* sun and halos */}
      <g fill="none" stroke="#FFE27A">
        <circle cx="740" cy="118" r="82" strokeWidth="2" opacity="0.3" />
        <circle cx="740" cy="118" r="62" strokeWidth="2" opacity="0.5" />
      </g>
      <circle cx="740" cy="118" r="44" fill="#FFE27A" opacity="0.9" />

      {/* clouds */}
      <g fill="#fff" opacity="0.4">
        <g transform="translate(0 96)"><g className="kv-cloud-a"><path d="M0 0 q10 -16 28 -10 q10 -16 30 -4 q20 -6 24 14 z" /></g></g>
        <g transform="translate(0 70)"><g className="kv-cloud-b"><path d="M0 0 q12 -20 34 -12 q12 -18 36 -4 q24 -4 28 16 z" /></g></g>
        <g transform="translate(0 132)"><g className="kv-cloud-c"><path d="M0 0 q8 -12 22 -8 q8 -12 24 -2 q16 -2 18 10 z" /></g></g>
      </g>

      {/* birds */}
      <g transform="translate(0 84)">
        <g className="kv-birds" fill="none" stroke="#0A3B22" strokeWidth="1.6" strokeLinecap="round" opacity="0.35">
          <path d="M0 0 q5 -6 10 0 q5 -6 10 0" />
          <path d="M34 -10 q4 -5 8 0 q4 -5 8 0" />
          <path d="M26 12 q4 -5 8 0 q4 -5 8 0" />
        </g>
      </g>

      {/* far-shore skyline */}
      <g fill="#0A3B22" opacity="0.1">
        {SKYLINE.map(([x, w, h]) => (
          <g key={x}>
            <rect x={x} y={346 - h} width={w} height={h} />
            <rect x={x} y={346 - h} width={w} height={h} fill="url(#kv-win)" opacity="0.9" />
          </g>
        ))}
        <rect x="1253" y="190" width="2" height="26" />
      </g>

      {/* water, waves and ferry */}
      <rect x="0" y="346" width="1440" height="60" fill="#0A3B22" opacity="0.09" />
      <g fill="none" stroke="#0A3B22" strokeWidth="2" strokeLinecap="round" opacity="0.16">
        <path className="kv-wave-a" d={WAVES(364)} />
        <path className="kv-wave-b" d={WAVES(382)} />
      </g>
      <g transform="translate(0 338)">
        <g className="kv-boat" fill="#0A3B22" opacity="0.28">
          <path d="M0 0 h52 l-9 10 h-34 z" />
          <rect x="14" y="-10" width="22" height="10" rx="2" />
          <rect x="24" y="-20" width="2" height="10" />
        </g>
      </g>

      {/* bridge: piers, deck, truss, railing, lamps, towers and cables */}
      <g fill="#0A3B22" stroke="#0A3B22" opacity="0.2">
        {PIERS.map((x) => (
          <g key={x}>
            <path d={`M${x - 8} 298 L${x - 5} 348 L${x + 5} 348 L${x + 8} 298 Z`} stroke="none" />
            <ellipse cx={x} cy="350" rx="26" ry="4" fill="none" strokeWidth="1.5" />
          </g>
        ))}
        <rect x="-20" y="288" width="1480" height="10" stroke="none" />
        <path d={TRUSS} fill="none" strokeWidth="2" strokeLinejoin="round" />
        <line x1="-20" y1="276" x2="1460" y2="276" strokeWidth="1.5" />
        <line x1="-20" y1="280" x2="1460" y2="280" strokeWidth="8" strokeDasharray="1.5 11" />
        {LAMPS.map((x) => (
          <g key={x}>
            <line x1={x} y1="288" x2={x} y2="256" strokeWidth="2" />
            <path d={`M${x} 256 q0 -7 9 -7`} fill="none" strokeWidth="2" />
            <circle cx={x + 9} cy="251" r="3" stroke="none" />
          </g>
        ))}
        {TOWERS.map((x) => (
          <g key={x}>
            <rect x={x - 34} y="340" width="68" height="12" rx="2" stroke="none" />
            <path d={`M${x - 26} 348 L${x - 3} 56 L${x + 3} 56 L${x - 14} 348 Z`} stroke="none" />
            <path d={`M${x + 26} 348 L${x + 3} 56 L${x - 3} 56 L${x + 14} 348 Z`} stroke="none" />
            {CROSSBARS.map(([y, hw]) => (
              <line key={y} x1={x - hw} y1={y} x2={x + hw} y2={y} strokeWidth="4" />
            ))}
            {STAYS.flatMap((k) =>
              [-1, 1].map((s) => (
                <line key={`${k}${s}`} x1={x} y1={72 + k * 10} x2={x + s * (50 + k * 38)} y2="288" strokeWidth="1.6" />
              ))
            )}
          </g>
        ))}
      </g>
      {TOWERS.map((x) => (
        <circle key={x} className="kv-beacon" cx={x} cy="50" r="3.5" fill="#D8321F" />
      ))}

      {/* far lane: a car heading the other way, smaller and fainter for depth */}
      <g transform="translate(1500 284) scale(-0.6 0.6)" opacity="0.45">
        <g className="kv-left"><Car /></g>
      </g>

      {/* near lane: the convoy (van leads, then bus, then car) */}
      <g transform="translate(0 288)">
        <g className="kv-d1"><Van /></g>
        <g className="kv-d2"><Bus /></g>
        <g className="kv-d3"><Car /></g>
      </g>
    </svg>
  );
}