import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../redux/slices/cartSlice'
import { toggleWishlist } from '../redux/slices/wishlistSlice'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const wishlistItems = useSelector((s) => s.wishlist.items)
  const isWishlisted = wishlistItems.some((i) => i.id === product.id)
  const [imgError, setImgError] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    dispatch(addToCart(product))
    toast.success(`${product.name} added to cart!`)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    dispatch(toggleWishlist(product))
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!')
  }

  return (
    <Link to={`/product/${product.id}`}
      className="group bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 overflow-hidden block">
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        <img
          src={imgError
            ? `https://placehold.co/300x300/e0f2fe/0284c7?text=${encodeURIComponent(product.name)}`
            : product.image}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{product.discount}%
          </span>
        )}
        <button onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-sky-500 font-medium mb-1">{product.category}</p>
        <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star}
              className={`w-3 h-3 ${star <= Math.round(product.rating || 0)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-200'}`}
            />
          ))}
          <span className="text-xs text-slate-400 ml-1">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-slate-900">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through ml-2">
                ₹{product.originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <button onClick={handleAddToCart}
            className="w-9 h-9 bg-sky-500 hover:bg-sky-600 text-white rounded-xl flex items-center justify-center transition-colors active:scale-95">
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard