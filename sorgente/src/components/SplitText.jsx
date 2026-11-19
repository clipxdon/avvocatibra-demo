// Adapted from the React Bits "SplitText" pattern (github.com/DavidHDev/react-bits):
// splits a heading into words and lets them rise from a mask, slowly, when scrolled into view.
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { reducedMotion } from '../store'

export default function SplitText({ text, as: Tag = 'h2', className = '', delay = 0, stagger = 0.06, start = 'top 85%', immediate = false, italic = [] }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current.querySelectorAll('.st-in'),
        { yPercent: 105 },
        { yPercent: 0, duration: 1.4, ease: 'power3.out', stagger, delay, scrollTrigger: immediate ? undefined : { trigger: ref.current, start, once: true } }
      )
    }, ref)
    return () => ctx.revert()
  }, [delay, stagger, start, immediate])
  const words = text.split(' ')
  return (
    <Tag ref={ref} className={`split ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span className="st-word" key={i} aria-hidden="true">
          <span className={`st-in ${italic.includes(i) ? 'it' : ''}`}>{w}</span>
        </span>
      ))}
    </Tag>
  )
}
