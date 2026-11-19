import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import SplitText from './components/SplitText'
import Accordion from './components/Accordion'
import StaticBook from './components/StaticBook'
import { STUDIO, HOURS, AREAS, TEAM, ONLINE_STEPS, COURTS, FAQ } from './content'
import { scene, reducedMotion, isMobile } from './store'

gsap.registerPlugin(ScrollTrigger)
const Scene = lazy(() => import('./three/Scene'))
const use3D = !isMobile && !reducedMotion

// Scene "poses" per section. The book opens in the hero and its pages turn with the areas of practice.
const P = {
  hero: { x: 2.5, y: -0.2, ry: -0.22, rz: 0.05, s: 1.55, camZ: 11, vis: 1 },
  studio: { x: -3.0, y: -0.2, ry: 0.18, rz: -0.04, s: 1.2, camZ: 11, vis: 1 },
  areas: { x: 3.4, y: 2.0, ry: 0, rz: 0, s: 0.9, camZ: 12, vis: 1 },
  team: { x: 3.0, y: 0.4, ry: -0.18, rz: 0.04, s: 1.0, camZ: 11.5, vis: 0.85 },
  services: { x: -3.1, y: -0.3, ry: 0.2, rz: -0.05, s: 1.1, camZ: 11.5, vis: 0.85 },
  faq: { x: -3.3, y: -1.4, ry: 0.18, rz: 0, s: 0.9, camZ: 12, vis: 0.35 },
  contact: { x: 3.0, y: 1.3, ry: -0.18, rz: 0.05, s: 0.85, camZ: 12, vis: 0.4 },
}
const pose = ({ vis, ...p }) => {
  gsap.to('.canvas-wrap', { opacity: vis, duration: 1.6, ease: 'power2.inOut', overwrite: 'auto' })
  return gsap.to(scene, { ...p, duration: 2.2, ease: 'power3.inOut', overwrite: 'auto' })
}
const poseOn = (trigger, p) =>
  use3D && ScrollTrigger.create({ trigger, start: 'top 55%', end: 'bottom 45%', onEnter: () => pose(p), onEnterBack: () => pose(p) })

function useLenis() {
  useEffect(() => {
    if (reducedMotion) return
    const lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    window.__lenis = lenis
    return () => { gsap.ticker.remove(raf); lenis.destroy() }
  }, [])
}

const go = (id) => (e) => {
  e.preventDefault()
  const el = document.getElementById(id)
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: id === 'top' ? 0 : -40 })
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
}

// fade/rise for blocks of text, once
function useReveal(ref, sel = '.rv') {
  useEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray(sel, ref.current).forEach((el) =>
        gsap.from(el, { y: 40, opacity: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      )
    }, ref)
    return () => ctx.revert()
  }, [])
}

function Nav() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const st = ScrollTrigger.create({ start: 80, onUpdate: (s) => setSolid(s.scroll() > 80), onLeaveBack: () => setSolid(false) })
    return () => st.kill()
  }, [])
  const link = (id, label) => <a href={`#${id}`} onClick={(e) => { setOpen(false); go(id)(e) }}>{label}</a>
  return (
    <header className={`nav ${solid ? 'solid' : ''} ${open ? 'menu-open' : ''}`}>
      <a href="#top" onClick={go('top')} className="logo" aria-label="Studio Legale Fornengo Germanetti, torna su">
        <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6v28M8 12h24M13 12l-5 11h10zM27 12l-5 11h10zM14 34h12" /></svg>
        <span><b>Fornengo Germanetti</b><small>Studio Legale · Bra</small></span>
      </a>
      <button className="menu-btn" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
        <span className="sr">Menu</span><i /><i />
      </button>
      <nav id="menu" aria-label="Sezioni">
        {link('studio', 'Lo studio')}
        {link('attivita', 'Attività')}
        {link('professionisti', 'Professionisti')}
        {link('servizi', 'Servizi')}
        {link('faq', 'Domande')}
        {link('contatti', 'Contatti')}
      </nav>
    </header>
  )
}

function Hero() {
  const ref = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      poseOn(ref.current, P.hero)
      if (reducedMotion) return
      gsap.from('.hero-rule', { scaleX: 0, transformOrigin: 'left', duration: 1.8, ease: 'power3.inOut', delay: 0.2 })
      gsap.from('.hero-meta > *', { opacity: 0, y: 20, duration: 1.4, ease: 'power3.out', stagger: 0.12, delay: 0.9 })
      if (use3D) {
        // reading the first screen brings the scale into balance
        gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 1 } })
          .to(scene, { flip: 1, ease: 'none' }, 0)
          .to('.hero-title', { yPercent: -18, opacity: 0.2, ease: 'none' }, 0)
      } else {
        // light SVG version: pages turn as you scroll through the first two screens
        const pages = gsap.utils.toArray('.sbk-page').reverse()
        pages.forEach((el, i) =>
          gsap.fromTo(el, { scaleX: 1 }, {
            scaleX: -1, ease: 'none',
            onUpdate() { el.querySelector('.sbk-ink').style.opacity = gsap.getProperty(el, 'scaleX') > 0 ? 1 : 0 },
            scrollTrigger: { trigger: ref.current, start: `top+=${i * 22}% top`, end: `top+=${i * 22 + 34}% top`, scrub: 0.6 },
          })
        )
      }
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="top" className="hero" ref={ref}>
      <p className="eyebrow hero-meta"><span>Studio Legale</span><span>Bra · Cuneo</span></p>
      <h1 className="hero-title">
        <SplitText as="span" text="Fornengo" immediate delay={0.25} className="ht ht-1" />
        <SplitText as="span" text="Germanetti" immediate delay={0.45} className="ht ht-2" />
      </h1>
      <span className="hero-rule" aria-hidden="true" />
      <div className="hero-meta hero-bottom">
        <p className="lead">Assistenza legale in diritto civile, in sede giudiziale e stragiudiziale. Via Marconi 85, Bra.</p>
        <div className="ctas">
          <a className="btn btn-ink" href={STUDIO.tel}>Chiama lo studio</a>
          <a className="btn btn-line" href="#contatti" onClick={go('contatti')}>Fissa un appuntamento</a>
        </div>
      </div>
      {!use3D && <StaticBook className="hero-svg" />}
      <a href="#studio" onClick={go('studio')} className="scroll-hint"><span>Scorri</span><i aria-hidden="true" /></a>
    </section>
  )
}

function Studio() {
  const ref = useRef(null)
  useReveal(ref)
  useEffect(() => { const st = poseOn(ref.current, P.studio); return () => st && st.kill() }, [])
  return (
    <section id="studio" className="studio" ref={ref}>
      <div className="col">
        <span className="label">§ 1 · Lo studio</span>
        <SplitText text="Ogni questione merita ascolto, metodo e chiarezza." italic={[4, 5, 6]} className="h2" />
        <p className="rv">Lo Studio Legale Fornengo Germanetti assiste privati, professionisti e imprese nelle questioni di diritto civile: dalla consulenza preventiva alla redazione degli atti, fino alla difesa in giudizio.</p>
        <p className="rv">Lo Studio offre un’assistenza personalizzata e, a chi non può recarsi in studio offriamo anche la consulenza a distanza.</p>
        <dl className="facts rv">
          <div><dt>Ambito</dt><dd>Diritto civile</dd></div>
          <div><dt>Sede</dt><dd>Via Marconi 85, Bra</dd></div>
          <div><dt>Uffici giudiziari</dt><dd>Asti, Cuneo e circondario</dd></div>
        </dl>
      </div>
    </section>
  )
}

function Areas() {
  const ref = useRef(null)
  const track = useRef(null)
  const bar = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      poseOn(ref.current, P.areas)
      if (reducedMotion) return
      if (!isMobile) {
        const dist = () => track.current.scrollWidth - window.innerWidth
        gsap.to(track.current, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: ref.current, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
            onUpdate: (s) => {
              bar.current && (bar.current.style.transform = `scaleX(${s.progress})`)
              if (use3D && s.progress > 0) scene.flip = 1 + s.progress * AREAS.length
            },
          },
        })
      } else {
        gsap.utils.toArray('.area', ref.current).forEach((el) =>
          gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
        )
      }
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="attivita" className="areas" ref={ref}>
      <div className="areas-head">
        <span className="label">§ 2 · Aree di attività</span>
        <SplitText text="Le materie che seguiamo." italic={[3]} className="h2" />
        <p>Lo Studio resta a disposizione per pareri anche in ambiti non elencati.</p>
      </div>
      <div className="areas-track" ref={track}>
        {AREAS.map((a) => (
          <article key={a.n} className="area">
            <span className="area-n">{a.n}</span>
            <h3>{a.title}</h3>
            <p>{a.text}</p>
            <ul className="tags">{a.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          </article>
        ))}
        <div className="area-end" aria-hidden="true" />
      </div>
      <div className="areas-progress" aria-hidden="true"><i ref={bar} /></div>
    </section>
  )
}

function Team() {
  const ref = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      poseOn(ref.current, P.team)
      if (reducedMotion) return
      gsap.from('.member', { y: 60, opacity: 0, duration: 1.3, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '.team-grid', start: 'top 82%', once: true } })
      gsap.from('.member .rule', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'power3.inOut', stagger: 0.15, delay: 0.3, scrollTrigger: { trigger: '.team-grid', start: 'top 82%', once: true } })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="professionisti" className="team" ref={ref}>
      <span className="label">§ 3 · Professionisti</span>
      <SplitText text="Gli avvocati dello studio." italic={[3]} className="h2" />
      <div className="team-grid">
        {TEAM.map((m) => (
          <article key={m.name} className="member" tabIndex={0}>
            <span className="mono" aria-hidden="true">{m.initials}</span>
            <span className="rule" aria-hidden="true" />
            <h3>Avv. {m.name}</h3>
            <p>{m.ordine}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Services() {
  const ref = useRef(null)
  useReveal(ref)
  useEffect(() => {
    const ctx = gsap.context(() => {
      poseOn(ref.current, P.services)
      if (reducedMotion) return
      gsap.from('.step', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.14, scrollTrigger: { trigger: '.steps', start: 'top 85%', once: true } })
      gsap.fromTo('.steps-line i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 50%', scrub: 1 } })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section id="servizi" className="services" ref={ref}>
      <span className="label">§ 4 · Servizi</span>
      <SplitText text="Vicini anche a distanza." italic={[3]} className="h2" />
      <div className="svc-block">
        <h3 className="h3 rv">Consulenza online</h3>
        <p className="rv">Pareri e redazione di atti e contratti senza recarsi in studio: diffide, lettere, contratti di locazione e altro.</p>
        <div className="steps">
          <div className="steps-line" aria-hidden="true"><i /></div>
          {ONLINE_STEPS.map((s) => (
            <div className="step" key={s.n}><span className="step-n">{s.n}</span><h4>{s.title}</h4><p>{s.text}</p></div>
          ))}
        </div>
        <a className="link-arrow rv" href={`mailto:${STUDIO.emailOnline}?subject=Richiesta%20di%20consulenza`}>Scrivi a {STUDIO.emailOnline}</a>
      </div>
      <div className="svc-two">
        <article className="svc-card rv">
          <h3 className="h3">Patrocinio a spese dello Stato</h3>
          <p>Per chi ha un reddito entro la soglia di legge, lo Studio verifica i requisiti e predispone la domanda di ammissione, nei giudizi civili e amministrativi.</p>
        </article>
        <article className="svc-card rv">
          <h3 className="h3">Domiciliazioni per i colleghi</h3>
          <p>Disponibilità per domiciliazioni presso:</p>
          <ul className="courts">{COURTS.map((c) => <li key={c}>{c}</li>)}</ul>
        </article>
      </div>
    </section>
  )
}

function Faq() {
  const ref = useRef(null)
  useReveal(ref)
  useEffect(() => { const st = poseOn(ref.current, P.faq); return () => st && st.kill() }, [])
  return (
    <section id="faq" className="faq" ref={ref}>
      <div className="faq-head">
        <span className="label">§ 5 · Domande frequenti</span>
        <SplitText text="Prima di chiamarci." italic={[2]} className="h2" />
        <p className="rv note">Informazioni di carattere generale, che non sostituiscono un parere sul caso concreto.</p>
      </div>
      <div className="rv"><Accordion items={FAQ} /></div>
    </section>
  )
}

function Contact() {
  const ref = useRef(null)
  useReveal(ref)
  useEffect(() => { const st = poseOn(ref.current, P.contact); return () => st && st.kill() }, [])
  return (
    <section id="contatti" className="contact" ref={ref}>
      <span className="label">§ 6 · Contatti</span>
      <SplitText text="Ci trovate in Via Marconi." italic={[3, 4]} className="h2" />
      <div className="contact-grid">
        <div className="c-block rv">
          <h3>Studio</h3>
          <address><b>{STUDIO.name}</b><br />{STUDIO.address}<br />{STUDIO.city}</address>
          <a className="link-arrow" href={STUDIO.maps} target="_blank" rel="noopener">Indicazioni stradali</a>
        </div>
        <div className="c-block rv">
          <h3>Telefono ed email</h3>
          <p>{STUDIO.phones.map((p) => <a key={p} href={`tel:+39${p.replace(/\s/g, '')}`}>{p}<br /></a>)}<span className="muted">Fax {STUDIO.fax}</span></p>
          <p><a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a></p>
        </div>
        <div className="c-block rv">
          <h3>Orari</h3>
          <ul className="hours">{HOURS.map((h) => <li key={h.d}><span>{h.d}</span><span>{h.h}</span></li>)}</ul>
        </div>
        <div className="c-block rv">
          <h3>PEC</h3>
          <ul className="pec">{STUDIO.pec.map((p) => <li key={p}><a href={`mailto:${p}`}>{p}</a></li>)}</ul>
        </div>
      </div>
      <div className="cta-band rv">
        <p>Per fissare un appuntamento chiamate lo <a href={STUDIO.tel}>0172 413718</a> o scrivete allo studio.</p>
        <a className="btn btn-ink" href={`mailto:${STUDIO.email}?subject=Richiesta%20di%20appuntamento`}>Scrivi allo studio</a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <p className="f-big" aria-hidden="true">Fornengo <em>Germanetti</em></p>
      <div className="f-row">
        <p>© 2026 {STUDIO.name} · {STUDIO.address}, {STUDIO.city} · P.IVA {STUDIO.vat}</p>
        <p>Avvocati iscritti all’Ordine degli Avvocati di Asti · Bozza dimostrativa</p>
      </div>
    </footer>
  )
}

export default function App() {
  useLenis()
  const [show3d, setShow3d] = useState(false)
  useEffect(() => {
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { scene.progress = s.progress } })
    if (use3D) {
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200))
      idle(() => setShow3d(true))
    }
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh())
    return () => st.kill()
  }, [])
  return (
    <>
      {show3d && <Suspense fallback={null}><Scene /></Suspense>}
      <div className="paper-fallback" aria-hidden="true" />
      <a className="skip" href="#studio">Vai al contenuto</a>
      <Nav />
      <main>
        <Hero />
        <Studio />
        <Areas />
        <Team />
        <Services />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
