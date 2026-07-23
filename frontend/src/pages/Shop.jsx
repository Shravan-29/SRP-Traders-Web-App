import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { ProductSkeleton } from '../components/LoadingSkeleton'
import api from '../services/api'
import {
  Search, X, Zap, Wrench, HardHat, Flame,
  Droplets, Lightbulb, Paintbrush, Ruler, LayoutGrid
} from 'lucide-react'

// Category name ke according Lucide icon map
const CATEGORY_ICONS = {
  'Power Tools': Zap,
  'Hand Tools': Wrench,
  'Safety Equipment': HardHat,
  'Welding & Cutting': Flame,
  'Plumbing': Droplets,
  'Electrical': Lightbulb,
  'Painting': Paintbrush,
  'Measuring Tools': Ruler,
}

const Shop = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [sortBy, setSortBy] = useState('default')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [search, selectedCategory, sortBy, products])

  useEffect(() => {
    const cat = searchParams.get('category')
    const srch = searchParams.get('search')
    if (cat) setSelectedCategory(cat)
    if (srch) setSearch(srch)
  }, [searchParams])

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories')
      setCategories(data)
    } catch {
      setCategories([])
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/products?page=0&size=100')
      setProducts(data.content || [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...products]

    if (search) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory)
    }

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    if (sortBy === 'discount') result.sort((a, b) => (b.discount || 0) - (a.discount || 0))

    setFiltered(result)
  }

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Shop All Products</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} products found</p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search products..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-400 text-sm text-slate-700">
            <option value="default">Sort: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Best Discount</option>
          </select>
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-8">

          {/* All button */}
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedCategory === 'All'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-500'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            All
          </button>

          {/* Dynamic categories from backend */}
          {categories.map(cat => {
            const IconComponent = CATEGORY_ICONS[cat.name] || Wrench
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-500'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">No products found</h3>
            <p className="text-slate-400 text-sm mt-1">Try a different search or category</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('All') }}
              className="mt-4 px-6 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop