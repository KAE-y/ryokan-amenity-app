// 画像URLが未設定のときに表示する簡易間取り図（青焼き風）
export function SimpleFloorPlan() {
  return (
    <svg
      viewBox="0 0 800 560"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="簡易間取り図"
    >
      <defs>
        <pattern id="tatami" width="80" height="40" patternUnits="userSpaceOnUse">
          <rect width="80" height="40" fill="none" />
          <path d="M0 0H80M0 40H80M0 0V40M80 0V40" stroke="#c8cfd6" strokeWidth="1" />
          <path d="M40 0V40" stroke="#dfe4e8" strokeWidth="1" />
        </pattern>
        <linearGradient id="bathwater" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cddbe4" />
          <stop offset="1" stopColor="#aec6d4" />
        </linearGradient>
      </defs>

      {/* 全体背景 */}
      <rect x="0" y="0" width="800" height="560" fill="#f3f4ee" />
      <rect x="28" y="28" width="744" height="504" fill="#fbfaf5" stroke="#2a4a63" strokeWidth="3" />

      {/* 主室（畳） */}
      <rect x="52" y="52" width="420" height="330" fill="url(#tatami)" stroke="#2a4a63" strokeWidth="2" />
      <text x="262" y="230" textAnchor="middle" fontSize="22" fill="#7c8891" fontFamily="serif" letterSpacing="6">
        主 室
      </text>

      {/* 床の間 */}
      <rect x="472" y="52" width="176" height="120" fill="#efeadd" stroke="#2a4a63" strokeWidth="2" />
      <text x="560" y="118" textAnchor="middle" fontSize="15" fill="#8a8272" fontFamily="serif" letterSpacing="4">
        床の間
      </text>

      {/* 広縁 / 縁側 */}
      <rect x="52" y="382" width="420" height="126" fill="#efe7d6" stroke="#2a4a63" strokeWidth="2" />
      <text x="262" y="452" textAnchor="middle" fontSize="15" fill="#8a8272" fontFamily="serif" letterSpacing="4">
        広 縁
      </text>

      {/* 洗面・水回り */}
      <rect x="472" y="172" width="176" height="110" fill="#eef1f0" stroke="#2a4a63" strokeWidth="2" />
      <rect x="500" y="196" width="120" height="26" rx="6" fill="#dbe3e6" stroke="#9fb0b8" />
      <text x="560" y="258" textAnchor="middle" fontSize="13" fill="#8a8272" fontFamily="serif" letterSpacing="3">
        洗面
      </text>

      {/* 半露天風呂 */}
      <rect x="472" y="282" width="176" height="226" fill="#e7eef2" stroke="#2a4a63" strokeWidth="2" />
      <rect x="512" y="356" width="96" height="118" rx="14" fill="url(#bathwater)" stroke="#7fa0b2" strokeWidth="2" />
      <text x="560" y="332" textAnchor="middle" fontSize="13" fill="#8a8272" fontFamily="serif" letterSpacing="2">
        半露天風呂
      </text>

      {/* 玄関 */}
      <rect x="648" y="440" width="100" height="68" fill="#efe7d6" stroke="#2a4a63" strokeWidth="2" />
      <text x="698" y="479" textAnchor="middle" fontSize="12" fill="#8a8272" fontFamily="serif" letterSpacing="2">
        玄関
      </text>

      {/* 方位マーク */}
      <g transform="translate(720,70)" opacity="0.6">
        <circle r="18" fill="none" stroke="#9a7b3f" strokeWidth="1.5" />
        <path d="M0 -14 L4 2 L0 -2 L-4 2 Z" fill="#c05640" />
        <text x="0" y="-22" textAnchor="middle" fontSize="10" fill="#9a7b3f">N</text>
      </g>
    </svg>
  )
}
