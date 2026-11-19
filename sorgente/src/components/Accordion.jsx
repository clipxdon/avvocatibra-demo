import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { reducedMotion } from '../store'

// Accessible disclosure list: native buttons + aria-expanded, height animated with GSAP.
function Item({ q, a, i }) {
  const [open, setOpen] = useState(false)
  const body = useRef(null)
  const toggle = () => {
    const next = !open
    setOpen(next)
    const el = body.current
    if (reducedMotion) { el.style.height = next ? 'auto' : '0px'; return }
    gsap.to(el, { height: next ? 'auto' : 0, duration: 0.6, ease: 'power3.inOut' })
  }
  return (
    <li className={`acc-item ${open ? 'open' : ''}`}>
      <h3>
        <button aria-expanded={open} aria-controls={`faq-${i}`} id={`faq-b-${i}`} onClick={toggle}>
          <span className="acc-n">{String(i + 1).padStart(2, '0')}</span>
          <span className="acc-q">{q}</span>
          <span className="acc-ic" aria-hidden="true" />
        </button>
      </h3>
      <div className="acc-body" id={`faq-${i}`} role="region" aria-labelledby={`faq-b-${i}`} ref={body} style={{ height: 0 }}>
        <p>{a}</p>
      </div>
    </li>
  )
}

export default function Accordion({ items }) {
  return <ul className="acc">{items.map((it, i) => <Item key={i} i={i} {...it} />)}</ul>
}
