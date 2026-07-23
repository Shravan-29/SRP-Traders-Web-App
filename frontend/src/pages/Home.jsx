import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { ProductSkeleton } from '../components/LoadingSkeleton'
import api from '../services/api'
import toast from 'react-hot-toast'
// import { ArrowRight, Zap, Shield, Truck, Star, Award, ChevronRight, Phone, User, Drill } from 'lucide-react'
// import { Wrench } from 'lucide-react'
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

// const CATEGORIES = [
//   { name: 'Power Tools', icon: '🔌', color: 'from-sky-400 to-sky-600', count: '120+ Products' },
//   { name: 'Hand Tools', icon: '🔧', color: 'from-slate-600 to-slate-800', count: '200+ Products' },
//   { name: 'Safety Equipment', icon: '🦺', color: 'from-amber-400 to-amber-600', count: '80+ Products' },
//   { name: 'Welding & Cutting', icon: '🔥', color: 'from-red-400 to-red-600', count: '60+ Products' },
//   { name: 'Plumbing', icon: '🚿', color: 'from-teal-400 to-teal-600', count: '90+ Products' },
//   { name: 'Electrical', icon: '💡', color: 'from-yellow-400 to-yellow-600', count: '110+ Products' },
// ]

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

// ─── Cinematic Intro ─────────────────────────────────────────
const CinematicIntro = ({ onComplete }) => {
  const introRef = useRef(null)

  useEffect(() => {
    // Auto complete after 9 seconds
    const timer = setTimeout(() => {
      onComplete()
    }, 12000)
    return () => clearTimeout(timer)
  }, [])

  const skip = () => onComplete()

  return (
    <div
      ref={introRef}
      style={{
        position: 'fixed', inset: 0, background: '#000',
        zIndex: 9999, display: 'flex', alignItems: 'center',
        justifyContent: 'center', overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes lineV {
          from { height: 0; top: 0; }
          to { height: 100%; top: 0; }
        }
        @keyframes lineH {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes glowBurst {
          0%   { width: 0px; height: 0px; opacity: 1; }
          50%  { width: 250px; height: 250px; opacity: 0.35; }
          100% { width: 480px; height: 480px; opacity: 0; }
        }
        @keyframes cmIn {
          to { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.55); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes divGrow {
          to { width: 280px; }
        }
        @keyframes progFill {
          to { width: 100%; }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1);   opacity: 0.45; }
          50%       { transform: scale(1.1); opacity: 0; }
        }
        @keyframes splitTop {
          to { transform: translateY(-100%); }
        }
        @keyframes splitBot {
          to { transform: translateY(100%); }
        }
        @keyframes flashAnim {
          0%   { opacity: 0.7; }
          100% { opacity: 0; }
        }
        @keyframes skipFade {
          to { opacity: 1; }
        }
      `}</style>

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)',
        zIndex: 1,
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.82) 100%)',
        zIndex: 1,
      }} />

      {/* Vertical Line */}
      <div style={{
        position: 'absolute', left: '50%', top: 0,
        width: '1px', height: 0,
        background: 'linear-gradient(to bottom, transparent, #0ea5e9 40%, #0ea5e9 60%, transparent)',
        transform: 'translateX(-50%)',
        animation: 'lineV 1.2s 0.3s ease forwards',
        zIndex: 2,
      }} />

      {/* Horizontal Line */}
      <div style={{
        position: 'absolute', top: '50%', left: 0,
        height: '1px', width: 0,
        background: 'linear-gradient(to right, transparent, #0ea5e9 40%, #0ea5e9 60%, transparent)',
        transform: 'translateY(-50%)',
        animation: 'lineH 1s 1.3s ease forwards',
        zIndex: 2,
      }} />

      {/* Center Glow Burst when lines meet */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 0, height: 0,
        background: 'radial-gradient(circle, rgba(14,165,233,0.65) 0%, transparent 70%)',
        borderRadius: '50%', opacity: 0,
        animation: 'glowBurst 0.6s 2.2s ease forwards',
        zIndex: 3,
      }} />

      {/* Corner Marks */}
      {[
        { style: { top: 16, left: 16, borderTop: '1.5px solid #0ea5e9', borderLeft: '1.5px solid #0ea5e9' }, delay: '2s' },
        { style: { top: 16, right: 16, borderTop: '1.5px solid #0ea5e9', borderRight: '1.5px solid #0ea5e9' }, delay: '2.1s' },
        { style: { bottom: 16, left: 16, borderBottom: '1.5px solid #0ea5e9', borderLeft: '1.5px solid #0ea5e9' }, delay: '2.2s' },
        { style: { bottom: 16, right: 16, borderBottom: '1.5px solid #0ea5e9', borderRight: '1.5px solid #0ea5e9' }, delay: '2.3s' },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', width: 32, height: 32, opacity: 0, zIndex: 4,
          animation: `cmIn 0.3s ${c.delay} ease forwards`,
          ...c.style,
        }} />
      ))}

      {/* Brand Content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Pre tag */}
        <div style={{
          fontSize: 10, letterSpacing: 6, color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase', marginBottom: 18,
          opacity: 0, animation: 'fadeUp 0.6s 2.4s ease forwards',
        }}>
          Est. 2010 — Chembur, Mumbai
        </div>

        {/* Logo row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          opacity: 0, animation: 'fadeUp 0.8s 2.7s ease forwards',
        }}>
          <div style={{
            width: 64, height: 64, background: '#0ea5e9',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <img src="/logo.png" alt="SRP Traders" className="w-20 h-20 object-contain"/>
            <div style={{
              position: 'absolute', inset: -6, borderRadius: 20,
              border: '1px solid rgba(14,165,233,0.35)',
              animation: 'ringPulse 2.5s 3.5s ease infinite',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 52, fontWeight: 500, color: '#fff', letterSpacing: 8, lineHeight: 1 }}>SRP</div>
            <div style={{ fontSize: 15, color: '#0ea5e9', letterSpacing: 8, textTransform: 'uppercase', marginTop: 4 }}>Traders</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 0, height: 1, margin: '20px 0',
          background: 'linear-gradient(to right, transparent, #0ea5e9, transparent)',
          animation: 'divGrow 0.8s 3.2s ease forwards',
        }} />

        {/* Sub text */}
        <div style={{
          fontSize: 10, letterSpacing: 5, color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase',
          opacity: 0, animation: 'fadeUp 0.6s 3.6s ease forwards',
        }}>
          Hardware &nbsp;•&nbsp; Industrial Tools &nbsp;•&nbsp; Mumbai
        </div>

        {/* Built Tough */}
        <div style={{
          fontSize: 52, fontWeight: 500, color: '#fff',
          letterSpacing: 6, textTransform: 'uppercase', marginTop: 10,
          opacity: 0, animation: 'scaleIn 0.6s 4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          Built <span style={{ color: '#0ea5e9' }}>Tough</span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: 250, height: 1, background: 'rgba(255,255,255,0.08)',
          borderRadius: 1, overflow: 'hidden', marginTop: 28,
          opacity: 0, animation: 'fadeUp 0.5s 2.6s ease forwards',
        }}>
          <div style={{
            height: '100%', width: 0,
            background: 'linear-gradient(to right, #0369a1, #0ea5e9, #38bdf8)',
            animation: 'progFill 5.5s 3s ease forwards',
          }} />
        </div>
        <div style={{
          fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 3,
          textTransform: 'uppercase', marginTop: 8,
          opacity: 0, animation: 'fadeUp 0.5s 2.7s ease forwards',
        }}>
          Loading SRP Traders...
        </div>
      </div>

      {/* Split reveal */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '50%',
        background: '#000', zIndex: 20,
        animation: 'splitTop 0.8s 8.2s cubic-bezier(0.76,0,0.24,1) forwards',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%',
        background: '#000', zIndex: 20,
        animation: 'splitBot 0.8s 8.2s cubic-bezier(0.76,0,0.24,1) forwards',
      }} />

      {/* Flash */}
      <div style={{
        position: 'absolute', inset: 0, background: '#fff',
        zIndex: 25, opacity: 0, pointerEvents: 'none',
        animation: 'flashAnim 0.2s 8.1s ease forwards',
      }} />

      {/* Skip */}
      <button
        onClick={skip}
        style={{
          position: 'absolute', bottom: 20, right: 20, zIndex: 30,
          background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.3)', fontSize: 11, padding: '7px 14px',
          borderRadius: 8, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase',
          opacity: 0, animation: 'skipFade 0.5s 2s ease forwards',
        }}
      >
        Skip ›
      </button>
    </div>
  )
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
            {/* {CATEGORIES.map((cat) => (
              <Link key={cat.name} to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className={`bg-gradient-to-br ${cat.color} text-white rounded-2xl p-5 text-center hover:scale-105 transition-transform duration-200 shadow-md`}>
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="font-semibold text-sm leading-tight">{cat.name}</p>
                <p className="text-white/70 text-xs mt-1">{cat.count}</p>
              </Link>
            ))} */}
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
