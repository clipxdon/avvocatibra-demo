# Studio Legale Fornengo Germanetti · bozza sito 3D

Bozza dimostrativa del nuovo sito dello Studio Legale Fornengo Germanetti (Bra, CN).

- `index.html`: build autonoma in un unico file, pronta per GitHub Pages
- `sorgente/`: progetto Vite + React Three Fiber, GSAP ScrollTrigger e Lenis

```bash
cd sorgente && npm ci && npm run build   # output in sorgente/dist/index.html
```

Su mobile e con prefers-reduced-motion il libro 3D viene sostituito da una versione SVG leggera.
