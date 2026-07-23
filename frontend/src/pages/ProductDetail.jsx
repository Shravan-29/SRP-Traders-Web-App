import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../redux/slices/cartSlice'
import { toggleWishlist } from '../redux/slices/wishlistSlice'
import { ShoppingCart, Heart, Star, ArrowLeft, Shield, Truck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import RecommendationSection from '../components/RecommendationSection'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const wishlistItems = useSelector((s) => s.wishlist.items)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  const isWishlisted = wishlistItems.some(i => i.id === product?.id)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/products/${id}`)
      setProduct(data)
    } catch (err) {
      toast.error('Product not found!')
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="pt-[104px] min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
    </div>
  )

  if (!product) return null

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-sky-500 mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">

            {/* Image */}
            <div className="bg-slate-50 flex items-center justify-center p-12">
              <img
                src={imgError
                  ? `https://placehold.co/400x400/e0f2fe/0284c7?text=${encodeURIComponent(product.name)}`
                  : product.image}
                alt={product.name}
                onError={() => setImgError(true)}
                className="max-w-full max-h-80 object-contain"
              />
            </div>

            {/* Details */}
            <div className="p-8">
              <span className="text-xs text-sky-500 font-medium bg-sky-50 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-3 mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-slate-500">
                  {product.rating || 0} ({product.reviewCount || 0} reviews)
                </span>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {product.description || 'No description available.'}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-slate-900">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-slate-400 line-through text-lg">
                      ₹{product.originalPrice?.toLocaleString('en-IN')}
                    </span>
                    <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              {product.stock !== null && (
                <p className={`text-sm font-medium mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => { dispatch(addToCart(product)); toast.success('Added to cart!') }}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button
                  onClick={() => {
                    dispatch(toggleWishlist(product))
                    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!')
                  }}
                  className={`w-14 flex items-center justify-center rounded-xl border-2 transition-colors ${
                    isWishlisted ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-300'
                  }`}>
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Truck className="w-4 h-4 text-sky-500" />
                  Free delivery on orders above ₹2000
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Shield className="w-4 h-4 text-sky-500" />
                  100% genuine product guarantee
                </div>
                {product.warrantyPeriod && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <span>🛡️</span>
                    <span>
                      {product.warrantyType === 'lifetime'
                        ? 'Lifetime Warranty'
                        : product.warrantyType === 'no_warranty'
                        ? 'No Warranty'
                        : `${product.warrantyPeriod} ${product.warrantyType} warranty`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products - AI Recommendation */}
      {product && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <RecommendationSection
            title="Similar Products"
            subtitle="Based on this product's category"
            apiUrl={`/recommendations/similar/${product.id}?limit=4`}
          />
        </div>
      )}
    </div>
  )
}

export default ProductDetail
