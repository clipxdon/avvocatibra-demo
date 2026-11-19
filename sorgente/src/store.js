// Shared mutable scene state: GSAP/ScrollTrigger writes, the R3F loop reads (no React re-renders).
export const scene = {
  flip: 0,    // 0 = closed book, 1 = cover open, 1+n = n pages turned
  x: 2.5, y: -0.2,
  ry: -0.22, rz: 0.05,
  s: 1.55,
  camZ: 11,
  progress: 0,
  pointer: { x: 0, y: 0 },
}

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isMobile =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches

export const PALETTE = { paper: '#F4F0E8', ink: '#14213D', brass: '#B08D57', stone: '#6B6B6B' }
