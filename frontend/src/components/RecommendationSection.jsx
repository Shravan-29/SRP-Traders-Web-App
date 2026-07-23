import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import { ProductSkeleton } from './LoadingSkeleton'
import api from '../services/api'

const RecommendationSection = ({
  title = 'You May Also Like',
  subtitle = '',
  apiUrl,
  emptyMessage = '',
}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!apiUrl) return
    loadRecommendations()
  }, [apiUrl])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(apiUrl)
      setProducts(data || [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Koi product nahi aaya aur loading bhi khatam — hide karo section
  if (!loading && products.length === 0) return null

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
        <Link to="/shop"
          className="text-sm text-sky-500 hover:text-sky-600 font-medium">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default RecommendationSection
