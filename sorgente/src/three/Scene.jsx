import { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scene, PALETTE } from '../store'
import { AREAS } from '../content'

// ---------- Backdrop: warm paper, a soft light pool and fine grain (one cheap fragment shader)
function Backdrop() {
  const { size } = useThree()
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        depthTest: false,
        uniforms: { uTime: { value: 0 }, uProg: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uLight: { value: new THREE.Vector2(0.65, 0.55) } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }`,
        fragmentShader: `
          varying vec2 vUv; uniform float uTime; uniform float uProg; uniform vec2 uRes; uniform vec2 uLight;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
          float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
            return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
          void main(){
            vec2 asp = vec2(uRes.x/uRes.y, 1.0);
            vec2 p = vUv * asp;
            vec3 paper = vec3(0.957, 0.941, 0.910);
            vec3 warm  = vec3(0.992, 0.965, 0.905);
            vec3 shade = vec3(0.886, 0.859, 0.812);
            vec3 ink   = vec3(0.078, 0.129, 0.239);
            vec2 lp = uLight * asp + vec2(sin(uTime*0.07), cos(uTime*0.05)) * 0.04;
            float l = smoothstep(0.95, 0.0, length(p - lp));
            vec3 col = mix(shade, paper, smoothstep(1.35, 0.25, length((vUv-0.5)*asp)));
            col = mix(col, warm, l * 0.75);
            float n = noise(p * 3.0 + vec2(uTime*0.01, 0.0)) * 0.6 + noise(p * 9.0) * 0.4;
            col -= (n - 0.5) * 0.025;
            col = mix(col, mix(col, ink, 0.10), smoothstep(0.75, 1.0, uProg) * smoothstep(0.6, 0.0, vUv.y));
            col += (hash(vUv * uRes + fract(uTime)) - 0.5) * 0.018;
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    []
  )
  useEffect(() => { mat.uniforms.uRes.value.set(size.width, size.height) }, [size, mat])
  useFrame((s) => {
    mat.uniforms.uTime.value = s.clock.elapsedTime
    mat.uniforms.uProg.value = scene.progress
  })
  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

// ---------- Page textures, drawn once on canvases
const TW = 512, TH = 704
const SERIF = '"Cormorant Garamond", Georgia, serif'
const SANS = 'Inter, system-ui, sans-serif'

function wrap(x, text, cx, y, maxW, lh) {
  const words = text.split(' ')
  let line = ''
  for (const w of words) {
    const t = line ? line + ' ' + w : w
    if (x.measureText(t).width > maxW && line) { x.fillText(line, cx, y); y += lh; line = w } else line = t
  }
  if (line) x.fillText(line, cx, y)
  return y + lh
}

function drawPage(x, kind, d) {
  const ink = PALETTE.ink, brass = PALETTE.brass
  if (kind === 'cover') {
    x.fillStyle = ink; x.fillRect(0, 0, TW, TH)
    x.strokeStyle = brass; x.lineWidth = 3; x.strokeRect(34, 34, TW - 68, TH - 68)
    x.lineWidth = 1; x.strokeRect(46, 46, TW - 92, TH - 92)
    x.fillStyle = brass; x.textAlign = 'center'
    x.font = `600 15px ${SANS}`; x.fillText('S T U D I O   L E G A L E', TW / 2, 230)
    x.font = `500 64px ${SERIF}`; x.fillText('Fornengo', TW / 2, 330)
    x.font = `italic 500 64px ${SERIF}`; x.fillText('Germanetti', TW / 2, 400)
    x.fillRect(TW / 2 - 40, 450, 80, 1.5)
    x.font = `500 22px ${SERIF}`; x.fillText('Bra', TW / 2, 500)
    return
  }
  // paper
  const g = x.createLinearGradient(0, 0, TW, 0)
  const spineLeft = kind !== 'back' && kind !== 'endpaper'
  g.addColorStop(spineLeft ? 0 : 1, '#E9E2D4'); g.addColorStop(spineLeft ? 0.08 : 0.92, '#FBF8F2'); g.addColorStop(spineLeft ? 1 : 0, '#F7F2E8')
  x.fillStyle = g; x.fillRect(0, 0, TW, TH)
  x.textAlign = 'center'
  if (kind === 'endpaper') {
    x.fillStyle = brass; x.font = `italic 500 40px ${SERIF}`; x.fillText('Ex libris', TW / 2, 300)
    x.fillRect(TW / 2 - 30, 330, 60, 1.5)
    x.fillStyle = ink; x.font = `600 13px ${SANS}`; x.fillText('V I A   M A R C O N I   8 5  ·  B R A', TW / 2, 370)
    return
  }
  if (kind === 'last') {
    x.fillStyle = brass; x.font = `600 13px ${SANS}`; x.fillText('C O N T A T T I', TW / 2, 200)
    x.fillRect(TW / 2 - 28, 225, 56, 1.5)
    x.fillStyle = ink; x.font = `500 34px ${SERIF}`; x.fillText('Studio Legale', TW / 2, 290)
    x.font = `italic 500 34px ${SERIF}`; x.fillText('Fornengo Germanetti', TW / 2, 332)
    x.fillStyle = '#2B3A5C'; x.font = `400 21px ${SERIF}`
    ;['Via Marconi 85 · 12042 Bra (CN)', 'Tel. 0172 413718', 'Lunedì – venerdì, 9–13 · 15–19'].forEach((l, i) => x.fillText(l, TW / 2, 400 + i * 32))
    return
  }
  if (kind === 'front') {
    x.fillStyle = brass; x.font = `italic 500 96px ${SERIF}`; x.fillText(d.n, TW / 2, 190)
    x.fillStyle = ink; x.font = `600 40px ${SERIF}`
    let y = wrap(x, d.title, TW / 2, 270, TW - 120, 46)
    x.fillStyle = brass; x.fillRect(TW / 2 - 28, y - 14, 56, 1.5)
    x.fillStyle = '#2B3A5C'; x.font = `400 19px ${SERIF}`
    wrap(x, d.text, TW / 2, y + 30, TW - 130, 27)
    x.fillStyle = PALETTE.stone; x.font = `500 13px ${SANS}`; x.fillText(String(d.i * 2 + 1), TW / 2, TH - 40)
    return
  }
  // back of a page: a column of "body text" lines, like a printed code
  x.fillStyle = brass; x.font = `600 13px ${SANS}`; x.fillText('§ ' + d.n, TW / 2, 90)
  x.fillStyle = 'rgba(20,33,61,.32)'
  let s = d.i * 13 + 5
  for (let r = 0; r < 22; r++) {
    s = (s * 16807) % 2147483647
    const w = r % 6 === 5 ? 160 + (s % 120) : 330 + (s % 60)
    x.fillRect(80, 140 + r * 22, w, 6)
  }
  x.fillStyle = PALETTE.stone; x.font = `500 13px ${SANS}`; x.fillText(String(d.i * 2 + 2), TW / 2, TH - 40)
}

function makeTex(kind, d) {
  const c = document.createElement('canvas')
  c.width = TW; c.height = TH
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const draw = () => { drawPage(c.getContext('2d'), kind, d); tex.needsUpdate = true }
  draw()
  if (document.fonts) document.fonts.ready.then(draw)
  return tex
}

// ---------- A bendable page: the vertex shader rolls it around the spine with a soft curl
const W = 1.6, H = 2.2, T = 0.16
const pageGeo = new THREE.PlaneGeometry(W, H, 28, 1).translate(W / 2, 0, 0)
const coverGeo = new THREE.PlaneGeometry(W + 0.06, H + 0.08, 28, 1).translate((W + 0.06) / 2, 0, 0)

const pageVert = `
  uniform float uAngle; uniform float uBend; uniform float uW; uniform float uZ;
  varying vec2 vUv; varying float vShade;
  void main(){
    vUv = uv;
    float u = position.x;
    float k = u / uW;
    float a = uAngle - uBend * sin(uAngle) * k * k;
    vec3 p = vec3(cos(a) * u, position.y, sin(a) * u + uZ);
    vec3 n = vec3(-sin(a), 0.0, cos(a));
    vShade = dot(n, normalize(vec3(0.35, 0.55, 1.0)));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`
const pageFrag = `
  uniform sampler2D uFront; uniform sampler2D uBack; uniform float uFade;
  varying vec2 vUv; varying float vShade;
  void main(){
    vec4 c = gl_FrontFacing ? texture2D(uFront, vUv) : texture2D(uBack, vec2(1.0 - vUv.x, vUv.y));
    float s = gl_FrontFacing ? vShade : -vShade;
    c.rgb *= 0.72 + 0.32 * clamp(s, 0.0, 1.0);
    gl_FragColor = vec4(c.rgb, 1.0);
    #include <colorspace_fragment>
  }`

function Page({ index, front, back, cover = false, z }) {
  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: { uAngle: { value: 0 }, uBend: { value: cover ? 0.08 : 0.55 }, uW: { value: cover ? W + 0.06 : W }, uZ: { value: 0 }, uFront: { value: front }, uBack: { value: back }, uFade: { value: 1 } },
      vertexShader: pageVert,
      fragmentShader: pageFrag,
    }),
    [front, back, cover]
  )
  useFrame(() => {
    const t = THREE.MathUtils.clamp(scene.flip - index, 0, 1)
    const e = t * t * (3 - 2 * t)
    const a = e * Math.PI
    mat.uniforms.uAngle.value = a
    // keep the stacking order right on both sides (avoids z-fighting)
    if (z !== undefined) mat.uniforms.uZ.value = z
    else if (cover) mat.uniforms.uZ.value = THREE.MathUtils.lerp(0.035, -T - 0.004, e)
    else mat.uniforms.uZ.value = (e < 0.5 ? (20 - index) : index) * 0.0012 + 0.001
  })
  return <mesh geometry={cover ? coverGeo : pageGeo} material={mat} frustumCulled={false} />
}

const boardMat = new THREE.MeshStandardMaterial({ color: PALETTE.ink, roughness: 0.7, metalness: 0.1 })
const edgeMat = new THREE.MeshStandardMaterial({ color: '#F3EDE1', emissive: '#E8E0D0', emissiveIntensity: 0.45, roughness: 0.95 })

function Book() {
  const root = useRef()
  const leftStack = useRef()
  const rightStack = useRef()
  const tex = useMemo(() => {
    const endpaper = makeTex('endpaper')
    return {
      cover: makeTex('cover'),
      endpaper,
      last: makeTex('last'),
      pages: AREAS.map((a, i) => ({ front: makeTex('front', { ...a, i }), back: makeTex('back', { ...a, i }) })),
    }
  }, [])
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    const c = THREE.MathUtils.clamp(scene.flip, 0, 1)
    const turned = THREE.MathUtils.clamp((scene.flip - 1) / AREAS.length, 0, 1)
    const ls = Math.max(0.001, turned)
    leftStack.current.scale.z = ls
    leftStack.current.position.z = -T - 0.006 + (T * ls) / 2
    leftStack.current.visible = c > 0.98 && turned > 0.02
    rightStack.current.scale.z = Math.max(0.15, 1 - turned * 0.85)
    rightStack.current.position.z = -T - 0.002 + (T * rightStack.current.scale.z) / 2
    const k = 1 - Math.pow(0.001, dt)
    root.current.rotation.x += ((-0.42 - scene.pointer.y * 0.06 + Math.sin(t * 0.4) * 0.015) - root.current.rotation.x) * k * 0.5
    root.current.rotation.y += ((scene.pointer.x * 0.12 + scene.ry) - root.current.rotation.y) * k * 0.5
    root.current.rotation.z += ((scene.rz) - root.current.rotation.z) * k * 0.5
    root.current.position.x += (scene.x - root.current.position.x) * k * 0.6
    root.current.position.y += (scene.y + Math.sin(t * 0.5) * 0.04 - root.current.position.y) * k * 0.6
    root.current.scale.setScalar(root.current.scale.x + (scene.s - root.current.scale.x) * k * 0.6)
    s.camera.position.z += (scene.camZ - s.camera.position.z) * k * 0.6
  })
  return (
    <group ref={root}>
      {/* back board + spine */}
      <mesh material={boardMat} position={[W / 2 + 0.03, 0, -T - 0.03]}><boxGeometry args={[W + 0.06, H + 0.08, 0.04]} /></mesh>
      <mesh material={boardMat} position={[0, 0, -T - 0.03]}><boxGeometry args={[0.1, H + 0.08, 0.04]} /></mesh>
      {/* page blocks */}
      <mesh ref={rightStack} material={edgeMat} position={[W / 2, 0, -T / 2 - 0.002]}><boxGeometry args={[W - 0.02, H - 0.03, T]} /></mesh>
      <mesh ref={leftStack} material={edgeMat} position={[-W / 2, 0, -T / 2]}><boxGeometry args={[W - 0.02, H - 0.03, T]} /></mesh>
      {/* turning pages, then the cover on top */}
      <Page index={1000} z={0.0004} front={tex.last} back={tex.last} />
      {tex.pages.map((p, i) => <Page key={i} index={i + 1} front={p.front} back={p.back} />)}
      <Page index={0} cover front={tex.cover} back={tex.endpaper} />
    </group>
  )
}

// Fine dust in the light: a few hundred points, one draw call
function Dust() {
  const ref = useRef()
  const geo = useMemo(() => {
    const n = 220, a = new Float32Array(n * 3)
    let seed = 11
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < n; i++) { a[i * 3] = (r() - 0.5) * 16; a[i * 3 + 1] = (r() - 0.5) * 10; a[i * 3 + 2] = (r() - 0.5) * 6 - 1 }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(a, 3))
    return g
  }, [])
  useFrame((s) => {
    ref.current.rotation.y = s.clock.elapsedTime * 0.01
    ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.1) * 0.2 + scene.progress * 2
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={PALETTE.brass} size={0.025} sizeAttenuation transparent opacity={0.6} depthWrite={false} />
    </points>
  )
}

export default function Scene() {
  useEffect(() => {
    const onMove = (e) => { scene.pointer.x = e.clientX / window.innerWidth * 2 - 1; scene.pointer.y = e.clientY / window.innerHeight * 2 - 1 }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 9], fov: 38 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <Backdrop />
        <hemisphereLight args={['#fff8ec', '#8a7a66', 1.1]} />
        <directionalLight position={[4, 6, 5]} intensity={2.0} color="#fff1dc" />
        <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#c9d4ff" />
        <Book />
        <Dust />
      </Canvas>
    </div>
  )
}
