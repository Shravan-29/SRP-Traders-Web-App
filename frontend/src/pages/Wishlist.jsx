import { useSelector, useDispatch } from 'react-redux'
import { toggleWishlist } from '../redux/slices/wishlistSlice'
import { addToCart } from '../redux/slices/cartSlice'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

const Wishlist = () => {
  const { items } = useSelector((s) => s.wishlist)
  const dispatch = useDispatch()

  if (items.length === 0) return (
    <div className="pt-[104px] min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Your wishlist is empty</h2>
        <p className="text-slate-400 text-sm mb-6">Save products you love for later</p>
        <Link to="/shop" className="px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors">
          Browse Products
        </Link>
      </div>
    </div>
  )

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Wishlist ({items.length})</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="relative aspect-square bg-slate-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-4" />
                <button onClick={() => { dispatch(toggleWishlist(item)); toast.success('Removed from wishlist') }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-sky-500 font-medium mb-1">{item.category}</p>
                <h3 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">₹{item.price?.toLocaleString('en-IN')}</span>
                  <button onClick={() => { dispatch(addToCart(item)); toast.success('Added to cart!') }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium rounded-lg transition-colors">
                    <ShoppingCart className="w-3 h-3" /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Wishlist