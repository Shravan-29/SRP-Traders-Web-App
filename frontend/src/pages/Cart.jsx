import { useSelector, useDispatch } from 'react-redux'
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import RecommendationSection from '../components/RecommendationSection'

const Cart = () => {
  const { items } = useSelector((s) => s.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  if (items.length === 0) return (
    <div className="pt-[104px] min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Your cart is empty</h2>
        <p className="text-slate-400 text-sm mb-6">Add some products to get started</p>
        <Link to="/shop" className="px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors">
          Browse Products
        </Link>
      </div>
    </div>
  )

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Cart ({totalItems} items)</h1>
          <button onClick={() => { dispatch(clearCart()); toast.success('Cart cleared') }}
            className="text-sm text-red-400 hover:text-red-600 transition-colors">
            Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 items-center">
                <img src={item.image} alt={item.name}
                  className="w-20 h-20 object-contain bg-slate-50 rounded-xl flex-shrink-0 p-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-sky-500 font-medium">{item.category}</p>
                  <h3 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h3>
                  <p className="text-sky-600 font-bold mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => {
                    if (item.quantity === 1) { dispatch(removeFromCart(item.id)); toast.success('Item removed') }
                    else dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                  }}
                    className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:border-sky-300 hover:text-sky-500 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                    className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:border-sky-300 hover:text-sky-500 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => { dispatch(removeFromCart(item.id)); toast.success('Item removed') }}
                    className="w-8 h-8 rounded-xl border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition-colors ml-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 mb-4">Order Summary</h2>
              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className={total >= 2000 ? 'text-green-500 font-medium' : ''}>
                    {total >= 2000 ? 'FREE' : '₹99'}
                  </span>
                </div>
                {total >= 2000 && (
                  <p className="text-xs text-green-500">🎉 You get free delivery!</p>
                )}
              </div>
              <div className="border-t border-slate-100 pt-3 mb-5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span>₹{(total >= 2000 ? total : total + 99).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <Link to="/shop" className="block text-center text-sm text-slate-500 hover:text-sky-500 mt-3 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Recommendations */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <RecommendationSection
          title="Frequently Bought Together"
          subtitle="Products often purchased with items in your cart"
          apiUrl={`/recommendations/cart?productIds=${items.map(i => i.id).join(',')}&limit=4`}
        />
      </div>
    </div>
  )
}

export default Cart