// Lightweight SVG open book, used on mobile and with prefers-reduced-motion.
// On mobile the three loose pages (.sbk-page) turn around the spine with the scroll.
export default function StaticBook({ className = '' }) {
  const lines = (x0) => Array.from({ length: 9 }, (_, i) => <rect key={i} x={x0} y={92 + i * 16} width={i % 4 === 3 ? 70 : 120} height="4" />)
  return (
    <svg className={`static-book ${className}`} viewBox="0 0 400 300" aria-hidden="true">
      <ellipse cx="200" cy="268" rx="170" ry="10" fill="#14213D" opacity=".12" />
      <path d="M20 58h180v200H28a8 8 0 0 1-8-8z M200 58h180v192a8 8 0 0 1-8 8H200z" fill="#14213D" />
      <path d="M30 50c60-8 120-6 170 6v196c-50-12-110-14-170-6z" fill="#E9E2D4" />
      <path d="M370 50c-60-8-120-6-170 6v196c50-12 110-14 170-6z" fill="#E9E2D4" />
      <path d="M34 46c58-8 116-6 166 6v196c-50-12-108-14-166-6z" fill="#FBF8F2" />
      <path d="M366 46c-58-8-116-6-166 6v196c50-12 108-14 166-6z" fill="#FBF8F2" />
      <g fill="#14213D" opacity=".28">{lines(56)}</g>
      <g>
        {[0, 1, 2].map((i) => (
          <g key={i} className="sbk-page" style={{ transformOrigin: '200px 150px', transformBox: 'view-box' }}>
            <path d="M366 46c-58-8-116-6-166 6v196c50-12 108-14 166-6z" fill="#FBF8F2" stroke="#E2D9C6" strokeWidth="1" />
            <g className="sbk-ink">
            <text x="283" y="112" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontStyle="italic" fontSize="38" fill="#B08D57">{['III', 'II', 'I'][i]}</text>
            <g fill="#14213D" opacity=".28">{Array.from({ length: 5 }, (_, r) => <rect key={r} x="226" y={140 + r * 16} width={r === 4 ? 60 : 114} height="4" />)}</g>
            </g>
          </g>
        ))}
      </g>
      <rect x="199" y="52" width="2" height="198" fill="#B08D57" opacity=".6" />
    </svg>
  )
}
