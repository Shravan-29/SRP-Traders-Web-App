import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { ProductSkeleton } from '../components/LoadingSkeleton'
import api from '../services/api'
import toast from 'react-hot-toast'
import RecommendationSection from '../components/RecommendationSection'
import {
  ArrowRight, Zap, Shield, Truck, Star, Award,
  ChevronRight, Phone, Wrench, HardHat, Flame,
  Droplets, Lightbulb
} from 'lucide-react'

const DEMO_PRODUCTS = [
  { id: 1, name: 'Bosch Professional Drill Machine 20V', category: 'Power Tools', price: 4999, originalPrice: 6500, discount: 23, rating: 4.5, reviewCount: 128, image: 'https://placehold.co/300x300/e0f2fe/0284c7?text=Drill+Machine' },
  { id: 2, name: 'Stanley Combination Pliers Set 5 Pcs', category: 'Hand Tools', price: 899, originalPrice: 1200, discount: 25, rating: 4.3, reviewCount: 87, image: 'https://placehold.co/300x300/e0f2fe/0284c7?text=Pliers+Set' },
  { id: 3, name: 'Screwdriver Set Professional 32-in-1', category: 'Hand Tools', price: 649, originalPrice: 900, discount: 28, rating: 4.6, reviewCount: 203, image: 'https://placehold.co/300x300/e0f2fe/0284c7?text=Screwdriver' },
  { id: 4, name: 'Industrial Safety Gloves Cut-Resistant', category: 'Safety', price: 299, originalPrice: 450, discount: 34, rating: 4.4, reviewCount: 156, image: 'https://placehold.co/300x300/e0f2fe/0284c7?text=Safety+Gloves' },
  { id: 5, name: 'Claw Hammer 16oz Fiberglass Handle', category: 'Hand Tools', price: 449, originalPrice: 599, discount: 25, rating: 4.2, reviewCount: 94, image: 'https://placehold.co/300x300/e0f2fe/0284c7?text=Hammer' },
  { id: 6, name: 'Heavy Duty Box Cutter with Extra Blades', category: 'Hand Tools', price: 199, originalPrice: 299, discount: 33, rating: 4.1, reviewCount: 67, image: 'https://placehold.co/300x300/e0f2fe/0284c7?text=Box+Cutter' },
  { id: 7, name: 'HVLP Spray Gun 1.4mm Nozzle Kit', category: 'Painting', price: 1899, originalPrice: 2500, discount: 24, rating: 4.5, reviewCount: 43, image: 'https://placehold.co/300x300/e0f2fe/0284c7?text=Spray+Gun' },
  { id: 8, name: 'ARC Welding Machine 200A Inverter', category: 'Welding', price: 8499, originalPrice: 11000, discount: 23, rating: 4.7, reviewCount: 78, image: 'https://placehold.co/300x300/e0f2fe/0284c7?text=Welding+Machine' },
]

const CATEGORY_ICONS = {
  'Power Tools': Zap,
  'Hand Tools': Wrench,
  'Safety Equipment': HardHat,
  'Welding & Cutting': Flame,
  'Plumbing': Droplets,
  'Electrical': Lightbulb,
}

const CATEGORIES = [
  { name: 'Power Tools', color: 'from-sky-400 to-sky-600', count: '120+ Products' },
  { name: 'Hand Tools', color: 'from-slate-600 to-slate-800', count: '200+ Products' },
  { name: 'Safety Equipment', color: 'from-amber-400 to-amber-600', count: '80+ Products' },
  { name: 'Welding & Cutting', color: 'from-red-400 to-red-600', count: '60+ Products' },
  { name: 'Plumbing', color: 'from-teal-400 to-teal-600', count: '90+ Products' },
  { name: 'Electrical', color: 'from-yellow-400 to-yellow-600', count: '110+ Products' },
]

// ─── Cinematic Intro — "Precision Cut" ─────────────────────────

const TOTAL_MS = 9500

const ToolIcon = ({ type }) => {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (type) {
    case 'wrench':
      return (
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <path {...s} d="M32 10a7 7 0 1 0-9.6 9.6L8 34l6 6 14.4-14.4A7 7 0 0 0 32 10Z" />
        </svg>
      )
    case 'gear':
      return (
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <circle {...s} cx="24" cy="24" r="8" />
          <circle {...s} cx="24" cy="24" r="2.4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="22.4" y="3" width="3.2" height="8" fill="currentColor" stroke="none"
              transform={`rotate(${i * 45} 24 24)`} />
          ))}
        </svg>
      )
    case 'bolt':
      return (
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <polygon {...s} points="24,6 38,14 38,30 24,38 10,30 10,14" />
          <circle {...s} cx="24" cy="22" r="6" />
        </svg>
      )
    case 'hammer':
      return (
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <rect {...s} x="4" y="6" width="17" height="10" rx="2" transform="rotate(-40 12.5 11)" />
          <line {...s} x1="17" y1="19" x2="40" y2="42" />
        </svg>
      )
    case 'screwdriver':
      return (
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <rect {...s} x="5" y="5" width="11" height="16" rx="2.5" />
          <line {...s} x1="15" y1="18" x2="38" y2="41" />
          <line {...s} x1="34" y1="37" x2="43" y2="46" />
        </svg>
      )
    case 'ruler':
      return (
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <rect {...s} x="3" y="17" width="42" height="11" rx="1.5" />
          <line {...s} x1="9" y1="17" x2="9" y2="23" />
          <line {...s} x1="16" y1="17" x2="16" y2="25" />
          <line {...s} x1="23" y1="17" x2="23" y2="23" />
          <line {...s} x1="30" y1="17" x2="30" y2="25" />
          <line {...s} x1="37" y1="17" x2="37" y2="23" />
        </svg>
      )
    default:
      return null
  }
}

// type, top%, left%, size(px), duration(s), delay(s), opacity, float variant
const TOOLS = [
  { type: 'wrench',     top: 12, left: 8,  size: 54, dur: 16, delay: 0,   op: 0.16, v: 'a' },
  { type: 'gear',        top: 16, left: 87, size: 46, dur: 20, delay: .6, op: 0.14, v: 'b' },
  { type: 'bolt',        top: 78, left: 10, size: 42, dur: 18, delay: .3, op: 0.15, v: 'b' },
  { type: 'hammer',      top: 80, left: 89, size: 56, dur: 15, delay: .9, op: 0.16, v: 'a' },
  { type: 'screwdriver', top: 42, left: 4,  size: 48, dur: 19, delay: .4, op: 0.13, v: 'b' },
  { type: 'ruler',       top: 60, left: 93, size: 50, dur: 17, delay: .2, op: 0.14, v: 'a' },
  { type: 'gear',        top: 90, left: 46, size: 34, dur: 22, delay: .7, op: 0.11, v: 'a' },
  { type: 'bolt',        top: 6,  left: 46, size: 30, dur: 21, delay: .5, op: 0.11, v: 'b' },
]

const CinematicIntro = ({ onComplete }) => {
  const rootRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const raf = () => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / 2600) * 100))
      setProgress(pct)
      if (pct < 100) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    const timer = setTimeout(() => onComplete(), TOTAL_MS)
    return () => clearTimeout(timer)
  }, [])

  const skip = () => onComplete()

  return (
    <div ref={rootRef} style={styles.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&display=swap');

        @keyframes gridIn      { from { opacity:0; transform:scale(1.04);} to { opacity:1; transform:scale(1);} }
        @keyframes hudIn       { to { opacity:1; } }
        @keyframes lineV       { from { height:0; } to { height:100%; } }
        @keyframes lineH       { from { width:0; } to { width:100%; } }
        @keyframes lineFade    { from { opacity:1; } to { opacity:0; } }
        @keyframes burst       { 0%{width:0;height:0;opacity:1;} 55%{opacity:.4;} 100%{width:420px;height:420px;opacity:0;} }
        @keyframes wipeIn      { to { clip-path: inset(0 0% 0 0); } }
        @keyframes edgeMove    { to { left:100%; } }
        @keyframes spark       { 0%{opacity:0; transform:scale(.3);} 30%{opacity:1; transform:scale(1);} 100%{opacity:0; transform:scale(.4) translateY(-6px);} }
        @keyframes fadeUp      { from{opacity:0; transform:translateY(12px);} to{opacity:1; transform:translateY(0);} }
        @keyframes corner      { to { opacity:1; } }
        @keyframes panelUp     { to { transform:translateY(-100%); } }
        @keyframes panelDown   { to { transform:translateY(100%); } }
        @keyframes seamFlash   { 0%{opacity:.9;} 100%{opacity:0;} }
        @keyframes skipIn      { to { opacity:1; } }
        @keyframes wrapFadeOut { to { opacity:0; } }
        @keyframes toolIn      { to { opacity: var(--op); } }
        @keyframes floatA      { 0%,100%{ transform:translate(0,0) rotate(0deg);} 50%{ transform:translate(10px,-14px) rotate(6deg);} }
        @keyframes floatB      { 0%,100%{ transform:translate(0,0) rotate(0deg);} 50%{ transform:translate(-12px,10px) rotate(-7deg);} }
      `}</style>

      {/* blueprint grid backdrop */}
      <div style={{ ...styles.grid, animation: 'gridIn 1.4s ease forwards' }} />
      <div style={styles.vignette} />

      {/* floating tool schematics */}
      {TOOLS.map((t, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', top: `${t.top}%`, left: `${t.left}%`,
            width: t.size, height: t.size, color: '#3b82f6', opacity: 0,
            '--op': t.op,
            animation: `toolIn 1.6s ${0.4 + t.delay}s ease forwards, ${t.v === 'a' ? 'floatA' : 'floatB'} ${t.dur}s ${t.delay}s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        >
          <ToolIcon type={t.type} />
        </div>
      ))}

      {/* HUD corner brackets */}
      {[
        { top: 18, left: 18, borderTop: '1px solid #3b82f677', borderLeft: '1px solid #3b82f677' },
        { top: 18, right: 18, borderTop: '1px solid #3b82f677', borderRight: '1px solid #3b82f677' },
        { bottom: 18, left: 18, borderBottom: '1px solid #3b82f677', borderLeft: '1px solid #3b82f677' },
        { bottom: 18, right: 18, borderBottom: '1px solid #3b82f677', borderRight: '1px solid #3b82f677' },
      ].map((c, i) => (
        <div key={i} style={{ ...styles.hudCorner, ...c, animation: `corner .3s ${1 + i * 0.08}s ease forwards` }} />
      ))}

      {/* HUD readouts */}
      <div style={{ ...styles.hudReadout, top: 26, left: 54, animation: 'hudIn .5s 1.1s ease forwards' }}>
        SEQ // CUT&nbsp;INIT
      </div>
      <div style={{ ...styles.hudReadout, top: 26, right: 54, textAlign: 'right', animation: 'hudIn .5s 1.2s ease forwards' }}>
        SRP-TR // EST.2010
      </div>
      <div style={{ ...styles.hudReadout, bottom: 26, left: 54, animation: 'hudIn .5s 1.3s ease forwards' }}>
        {String(progress).padStart(3, '0')}% CALIBRATED
      </div>
      <div style={{ ...styles.hudReadout, bottom: 26, right: 54, textAlign: 'right', animation: 'hudIn .5s 1.4s ease forwards' }}>
        CHEMBUR // MUMBAI
      </div>

      {/* crosshair laser lines (fade after collision) */}
      <div style={styles.laserV} />
      <div style={styles.laserH} />
      <div style={styles.burst} />

      {/* wordmark block */}
      <div style={styles.center}>
        <div style={styles.glow} />
        <div style={{ ...styles.eyebrow, animation: 'fadeUp .6s 2.1s ease forwards' }}>
          Precision Hardware Since 2010
        </div>

        <div style={styles.wordmarkOuter}>
          <div style={styles.wordmark}>
            SRP
            <div style={styles.edge} />
          </div>
          {[0, 1, 2, 3, 4, 5].map((sp) => (
            <div key={sp} style={{ ...styles.spark, left: `${8 + sp * 16}%`, animation: `spark .5s ${2.3 + sp * 0.28}s ease forwards` }} />
          ))}
        </div>

        <div style={{ ...styles.subword, animation: 'fadeUp .6s 3.3s ease forwards' }}>Traders</div>
        <div style={{ ...styles.divider, animation: 'fadeUp .5s 3.6s ease forwards' }} />
        <div style={{ ...styles.tagline, animation: 'fadeUp .6s 3.8s ease forwards' }}>
          Hardware &nbsp;·&nbsp; Industrial Tools &nbsp;·&nbsp; Mumbai
        </div>
        <div style={{ ...styles.builtTough, animation: 'fadeUp .7s 4.1s ease forwards' }}>
          Built <span style={{ color: '#3b82f6' }}>Tough</span>
        </div>

        <div style={{ ...styles.gaugeWrap, animation: 'fadeUp .5s 4.4s ease forwards' }}>
          <div style={styles.gaugeTicks}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{ ...styles.tick, background: progress >= (i / 24) * 100 ? '#3b82f6' : 'rgba(20,35,55,0.12)' }} />
            ))}
          </div>
          <div style={styles.gaugeLabel}>READY&nbsp;&nbsp;{String(progress).padStart(3, '0')}%</div>
        </div>
      </div>

      {/* toolbox-lid split reveal (fires after the hold) */}
      <div style={styles.panelTop}><div style={styles.rivetsRow} /></div>
      <div style={styles.panelBottom}><div style={{ ...styles.rivetsRow, top: 0, bottom: 'auto' }} /></div>
      <div style={styles.seamFlash} />

      <button onClick={skip} style={styles.skip}>Skip ›</button>
    </div>
  )
}

const styles = {
  wrap: {
    position: 'fixed', inset: 0, background: '#eef3f9', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', fontFamily: "'Inter', sans-serif",
    animation: 'wrapFadeOut .6s 8.9s ease forwards',
  },
  grid: {
    position: 'absolute', inset: 0, opacity: 0,
    backgroundImage:
      'linear-gradient(rgba(20,45,75,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20,45,75,0.05) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
  },
  vignette: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 35%, rgba(170,190,215,0.4) 100%)',
  },
  glow: {
    position: 'absolute', width: 520, height: 420, left: '50%', top: '50%',
    transform: 'translate(-50%,-50%)',
    background: 'radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)',
  },
  hudCorner: { position: 'absolute', width: 30, height: 30, opacity: 0 },
  hudReadout: {
    position: 'absolute', fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, letterSpacing: 2, color: 'rgba(20,40,65,0.45)', opacity: 0,
  },
  laserV: {
    position: 'absolute', left: '50%', top: 0, width: 1, height: 0,
    background: 'linear-gradient(to bottom, transparent, #3b82f6 40%, #93c5fd 60%, transparent)',
    transform: 'translateX(-50%)',
    animation: 'lineV 1s .5s ease forwards, lineFade .4s 2.7s ease forwards',
  },
  laserH: {
    position: 'absolute', top: '50%', left: 0, height: 1, width: 0,
    background: 'linear-gradient(to right, transparent, #3b82f6 40%, #93c5fd 60%, transparent)',
    transform: 'translateY(-50%)',
    animation: 'lineH .9s 1.4s ease forwards, lineFade .4s 2.7s ease forwards',
  },
  burst: {
    position: 'absolute', left: '50%', top: '50%', width: 0, height: 0,
    transform: 'translate(-50%,-50%)', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
    animation: 'burst .6s 2.15s ease forwards',
  },
  center: { position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  eyebrow: {
    fontSize: 10, letterSpacing: 5, color: 'rgba(20,40,65,0.4)', textTransform: 'uppercase',
    marginBottom: 22, opacity: 0,
  },
  wordmarkOuter: { position: 'relative' },
  wordmark: {
    position: 'relative', fontFamily: "'Oswald', sans-serif", fontWeight: 700,
    fontSize: 96, letterSpacing: 14, color: 'transparent',
    background: 'linear-gradient(180deg, #2b3440 0%, #4b5563 45%, #1f2937 55%, #374151 100%)',
    WebkitBackgroundClip: 'text', backgroundClip: 'text',
    clipPath: 'inset(0 100% 0 0)', animation: 'wipeIn 1.1s 1.9s cubic-bezier(.6,0,.2,1) forwards',
    lineHeight: 1,
  },
  edge: {
    position: 'absolute', top: -6, bottom: -6, left: 0, width: 3,
    background: '#3b82f6', boxShadow: '0 0 14px 2px #3b82f6',
    animation: 'edgeMove 1.1s 1.9s cubic-bezier(.6,0,.2,1) forwards',
  },
  spark: {
    position: 'absolute', top: -10, width: 4, height: 4, borderRadius: '50%',
    background: '#dbeafe', boxShadow: '0 0 8px 2px #3b82f6', opacity: 0,
  },
  subword: {
    fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 17,
    letterSpacing: 10, textTransform: 'uppercase', color: '#2563eb', marginTop: 6, opacity: 0,
  },
  divider: {
    width: 60, height: 1, margin: '20px 0 16px', opacity: 0,
    background: 'linear-gradient(to right, transparent, rgba(20,40,65,0.3), transparent)',
  },
  tagline: {
    fontSize: 11, letterSpacing: 3.5, color: 'rgba(20,40,65,0.45)',
    textTransform: 'uppercase', opacity: 0,
  },
  builtTough: {
    fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 34,
    letterSpacing: 3, textTransform: 'uppercase', color: '#1e293b', marginTop: 16, opacity: 0,
  },
  gaugeWrap: { marginTop: 34, opacity: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  gaugeTicks: { display: 'flex', gap: 4 },
  tick: { width: 6, height: 16, borderRadius: 1, transition: 'background .15s linear' },
  gaugeLabel: {
    marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
    letterSpacing: 2, color: 'rgba(20,40,65,0.45)',
  },
  panelTop: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '50%',
    background: '#eef3f9', zIndex: -1, animation: 'panelUp .85s 8.6s cubic-bezier(.76,0,.24,1) forwards',
  },
  panelBottom: {
    position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%',
    background: '#eef3f9', zIndex: -1, animation: 'panelDown .85s 8.6s cubic-bezier(.76,0,.24,1) forwards',
  },
  rivetsRow: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
    background:
      'repeating-linear-gradient(to right, rgba(20,40,65,0.18) 0 2px, transparent 2px 34px)',
  },
  seamFlash: {
    position: 'absolute', top: '50%', left: 0, right: 0, height: 3, transform: 'translateY(-50%)',
    background: '#3b82f6', zIndex: 1, opacity: 0, boxShadow: '0 0 20px 4px #3b82f6',
    animation: 'seamFlash .35s 8.55s ease forwards',
  },
  skip: {
    position: 'absolute', bottom: 20, right: 20, zIndex: 30,
    background: 'rgba(20,40,65,0.05)', border: '1px solid rgba(20,40,65,0.15)',
    color: 'rgba(20,40,65,0.5)', fontSize: 11, padding: '7px 14px', borderRadius: 6,
    cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', opacity: 0,
    animation: 'skipIn .5s 1.5s ease forwards', fontFamily: "'Inter', sans-serif",
  },
}

// ─── Main Home ────────────────────────────────────────────────
const Home = () => {
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [showIntro, setShowIntro] = useState(true) // Har refresh pe aaye
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/products?page=0&size=8')
        if (data.content?.length > 0) setProducts(data.content)
      } catch {
        // demo products use honge
      } finally {
        setLoading(false)
      }
    }

    const loadReviews = async () => {
      setReviewsLoading(true)
      try {
        const { data } = await api.get('/reviews/recent?limit=6')
        setReviews(data)
      } catch {
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }

    loadProducts()
    loadReviews()
  }, [])

  return (
    <>
      {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}

      <div className="pt-[104px]">

      {/* OFFER STRIP */}
<div className="offer-banner">
  <div className="offer-marquee">
    <span>
      ◆ PREMIUM TOOLS ◆ FREE DELIVERY ABOVE ₹2000 ◆ TRUSTED SINCE 2010 ◆ BEST PRICE IN MUMBAI ◆ INDUSTRIAL QUALITY ◆ NEW OFFERS ◆
    </span>

    <span>
      ◆ PREMIUM TOOLS ◆ FREE DELIVERY ABOVE ₹2000 ◆ TRUSTED SINCE 2010 ◆ BEST PRICE IN MUMBAI ◆ INDUSTRIAL QUALITY ◆ NEW OFFERS ◆
    </span>
  </div>
</div>

        {/* HERO */}
        <section className="relative bg-gradient-to-br from-sky-600 via-sky-500 to-sky-400 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-200 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Mumbai's Trusted Hardware Store
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Professional
                  <span className="block text-sky-100">Tools & Hardware</span>
                  <span className="block text-white">For Every Job</span>
                </h1>
                <p className="text-sky-100 text-lg mb-8 leading-relaxed">
                  From power tools to safety equipment — everything a professional needs.
                  Serving Mumbai's contractors, electricians & workshops since 2010.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/shop"
                    className="flex items-center gap-2 px-7 py-3.5 bg-white text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition-colors shadow-lg">
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a href="tel:+919876543210"
                    className="flex items-center gap-2 px-7 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-xl hover:bg-white/30 transition-colors">
                    <Phone className="w-4 h-4" /> Call Us
                  </a>
                </div>
                <div className="flex gap-8 mt-10 pt-8 border-t border-white/20">
                  {[{ num: '500+', label: 'Products' }, { num: '10K+', label: 'Customers' }, { num: '15+', label: 'Years' }].map(stat => (
                    <div key={stat.label}>
                      <div className="text-2xl font-bold">{stat.num}</div>
                      <div className="text-sky-200 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 w-full max-w-sm">
                  <div className="text-center">
                    {/* <div className="text-6xl mb-4">🔧</div> */}
                    <div className="flex justify-center mb-4">
  <div className="bg-white/15 p-5 rounded-2xl border border-white/20 shadow-xl">
    <Wrench className="w-14 h-14 text-white" />
  </div>
</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Mega Sale!</h3>
                    <p className="text-sky-100 mb-4">Up to 35% off on premium tools</p>
                    <div className="bg-white/20 rounded-xl p-4 mb-4">
                      <p className="text-sky-100 text-sm">Use code</p>
                      <p className="text-2xl font-bold text-white">SRP2025</p>
                      <p className="text-sky-100 text-xs">For extra 5% off</p>
                    </div>
                    <Link to="/shop" className="block w-full py-3 bg-white text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition-colors">
                      Grab Deal
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: 'Free Delivery', desc: 'Orders above ₹2000' },
                { icon: Shield, title: 'Genuine Products', desc: '100% authentic brands' },
                { icon: Award, title: 'Best Prices', desc: 'Lowest market rates' },
                { icon: Zap, title: 'Fast Shipping', desc: '1-3 day delivery Mumbai' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{title}</p>
                    <p className="text-slate-400 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
              <p className="text-slate-500 text-sm mt-1">Find exactly what you need</p>
            </div>
            <Link to="/shop" className="flex items-center gap-1 text-sky-500 text-sm font-medium hover:text-sky-600">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => {
  const IconComponent = CATEGORY_ICONS[cat.name] || Wrench
  return (
    <Link key={cat.name} to={`/shop?category=${encodeURIComponent(cat.name)}`}
      className={`bg-gradient-to-br ${cat.color} text-white rounded-2xl p-5 text-center hover:scale-105 transition-transform duration-200 shadow-md`}>
      <div className="flex justify-center mb-3">
        <IconComponent className="w-8 h-8 text-white" />
      </div>
      <p className="font-semibold text-sm leading-tight">{cat.name}</p>
      <p className="text-white/70 text-xs mt-1">{cat.count}</p>
    </Link>
  )
})}
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
              <p className="text-slate-500 text-sm mt-1">Top picks for professionals</p>
            </div>
            <Link to="/shop" className="flex items-center gap-1 text-sky-500 text-sm font-medium hover:text-sky-600">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Personalized Recommendations */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
  <RecommendationSection
    title="Recommended For You"
    subtitle="Based on your shopping history"
    apiUrl="/recommendations/top-rated?limit=8"
  />
</div>

        {/* CUSTOMER REVIEWS - Real data from backend */}
        {!reviewsLoading && reviews.length > 0 && (
          <section className="bg-slate-50 py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900">What Our Customers Say</h2>
                <p className="text-slate-500 text-sm mt-1">Real reviews from verified buyers</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star}
                          className={`w-4 h-4 ${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    {r.comment && (
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">"{r.comment}"</p>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-sm flex-shrink-0">
                        {r.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{r.userName}</p>
                        <p className="text-slate-400 text-xs truncate">on {r.productName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* NEWSLETTER */}
        <section className="bg-sky-500 py-14">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Get Exclusive Deals</h2>
            <p className="text-sky-100 mb-6">Subscribe to get the latest offers and new product alerts</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none"
              />
              <button onClick={() => { toast.success('Subscribed!'); setEmail('') }}
                className="px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}

export default Home
