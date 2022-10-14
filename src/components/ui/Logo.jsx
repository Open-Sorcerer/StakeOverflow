// An homage to the Stack Overflow mark: the same tray and fanning bars,
// except the top bar has flipped into a coin. Coordinates follow the
// proportions of the original logo (400-unit box).
const TRAY_COLOR = "rgba(244,241,234,0.45)";
const BARS = [
  { d: "M118 348H268", color: TRAY_COLOR },
  { d: "M118 291L268 305", color: "#b59d84" },
  { d: "M128 229L274 262", color: "#c99659" },
  { d: "M160 153L290 229", color: "#e0893a" },
  { d: "M232 80L318 194", color: "#f48024" },
];

export function LogoMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="40 30 380 380" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logo-coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe2bf" />
          <stop offset="0.5" stopColor="#ffb36b" />
          <stop offset="1" stopColor="#f48024" />
        </linearGradient>
      </defs>
      <path d="M81 258V404H309V258" stroke={TRAY_COLOR} strokeWidth="24" />
      {BARS.map((bar) => (
        <path key={bar.d} d={bar.d} stroke={bar.color} strokeWidth="30" />
      ))}
      <g transform="rotate(-18 344 96)">
        <ellipse cx="344" cy="96" rx="46" ry="38" fill="url(#logo-coin)" />
        <ellipse
          cx="344"
          cy="96"
          rx="28"
          ry="22"
          stroke="#b4531a"
          strokeOpacity="0.55"
          strokeWidth="7"
        />
      </g>
    </svg>
  );
}

function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span>
        <span className="logo-light">Stake</span>
        <span className="logo-strong">Overflow</span>
      </span>
    </span>
  );
}

export default Logo;
