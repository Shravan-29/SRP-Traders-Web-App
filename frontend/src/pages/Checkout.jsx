import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearCart } from '../redux/slices/cartSlice'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Truck, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import ReviewModal from '../components/ReviewModal'

const Checkout = () => {
  const { items } = useSelector((s) => s.cart)
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [paymentMethod, setPaymentMethod] = useState('ONLINE')
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState({
    name: user?.fullName || '',
    phone: user?.mobile || '',
    street: user?.address || '',
    city: 'Mumbai',
    pincode: ''
  })

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewItems, setReviewItems] = useState([])

  const itemsRef = useRef(items)
  itemsRef.current = items

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const delivery = total >= 2000 ? 0 : 99
  const grandTotal = total + delivery
  const showCOD = total >= 2000

  const validateAddress = () => {
    if (!address.name || !address.phone || !address.street || !address.pincode) {
      toast.error('Please fill all address fields')
      return false
    }
    if (address.phone.replace(/\s/g, '').length < 10) {
      toast.error('Enter valid phone number')
      return false
    }
    if (address.pincode.toString().length !== 6) {
      toast.error('Enter valid 6-digit pincode')
      return false
    }
    return true
  }

  const placeCodOrder = async () => {
    if (!validateAddress()) return
    setLoading(true)
    try {
      await api.post('/orders', {
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentId: null,
        deliveryAddress: address.street,
        deliveryCity: address.city,
        deliveryPincode: address.pincode.toString(),
        deliveryPhone: address.phone,
      })
      dispatch(clearCart())
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const placeOnlineOrder = async () => {
    if (!validateAddress()) return
    setLoading(true)

    const capturedItems = itemsRef.current.map(i => ({
      productId: i.id,
      productName: i.name,
      productImage: i.image,
      quantity: i.quantity,
    }))

    const orderPayload = {
      items: itemsRef.current.map(i => ({ productId: i.id, quantity: i.quantity })),
      paymentMethod: 'ONLINE',
      deliveryAddress: address.street,
      deliveryCity: address.city,
      deliveryPincode: address.pincode.toString(),
      deliveryPhone: address.phone,
    }

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Payment gateway load nahi hua. Internet check karo.')
        setLoading(false)
        return
      }

      const { data: rzpOrder } = await api.post('/payment/create-order', {
        amount: grandTotal
      })

      const options = {
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'SRP Traders',
        description: 'Hardware & Tools — Chembur, Mumbai',
        image: 'https://placehold.co/100x100/0ea5e9/ffffff?text=SRP',
        order_id: rzpOrder.orderId,
        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email || '',
        },
        notes: { address: address.street },
        theme: { color: '#0ea5e9' },

        handler: async (response) => {
          try {
            // Step 1: Verify payment
            await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })

            // Step 2: Create order with paymentId
            await api.post('/orders', {
              ...orderPayload,
              paymentId: response.razorpay_payment_id,
            })

            // Step 3: Cart clearing
            dispatch(clearCart())
            toast.success('Payment successful! Order placed.')
            setLoading(false)

            // Step 4: show Review modal 
            setReviewItems(capturedItems)
            setShowReviewModal(true)

          } catch (err) {
            console.error('Order creation error:', err)
            toast.error(err.response?.data?.message || 'Order creation failed. Contact support.')
            setLoading(false)
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false)
            toast.error('Payment cancelled')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error)
        toast.error('Payment failed. Please try again.')
        setLoading(false)
      })
      rzp.open()

    } catch (err) {
      console.error('Checkout error:', err)
      toast.error(err.response?.data?.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const handleOrder = () => {
    if (paymentMethod === 'CASH_ON_DELIVERY') placeCodOrder()
    else placeOnlineOrder()
  }

  const handleReviewModalClose = () => {
    setShowReviewModal(false)
    navigate('/orders')
  }
  
  if (items.length === 0 && !showReviewModal) {
    navigate('/cart')
    return null
  }

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-bold text-slate-900 mb-4">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Rajesh Kumar', col: 1 },
                  { key: 'phone', label: 'Phone Number', placeholder: '9876543210', col: 1 },
                  { key: 'street', label: 'Street Address', placeholder: 'Shop No, Street Name', col: 2 },
                  { key: 'city', label: 'City', placeholder: 'Mumbai', col: 1 },
                  { key: 'pincode', label: 'Pincode', placeholder: '400071', col: 1 },
                ].map(({ key, label, placeholder, col }) => (
                  <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input
                      type={key === 'pincode' ? 'number' : 'text'}
                      placeholder={placeholder}
                      value={address[key]}
                      onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-bold text-slate-900 mb-4">Payment Method</h2>
              <div className="space-y-2.5">
                <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'ONLINE' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="payment" value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')} />
                  <CreditCard className="w-4 h-4 text-sky-500" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">Online Payment</p>
                    <p className="text-xs text-slate-400">UPI, Cards, Net Banking via Razorpay</p>
                  </div>
                  <div className="flex gap-1.5">
                    {['UPI', 'CARD', 'NB'].map(m => (
                      <span key={m} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{m}</span>
                    ))}
                  </div>
                </label>

                {showCOD ? (
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="payment" value="CASH_ON_DELIVERY"
                      checked={paymentMethod === 'CASH_ON_DELIVERY'}
                      onChange={() => setPaymentMethod('CASH_ON_DELIVERY')} />
                    <Truck className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="font-medium text-slate-800 text-sm">Cash on Delivery</p>
                      <p className="text-xs text-slate-400">Pay when your order arrives</p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed">
                    <Truck className="w-4 h-4 text-slate-300" />
                    <div>
                      <p className="font-medium text-slate-400 text-sm">Cash on Delivery</p>
                      <p className="text-xs text-slate-400">Available on orders above Rs.2000 only</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-slate-600">
                    <span className="truncate pr-2">{item.name} ×{item.quantity}</span>
                    <span className="flex-shrink-0 font-medium">
                      Rs.{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>Rs.{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? 'text-green-500 font-medium' : ''}>
                    {delivery === 0 ? 'FREE' : `Rs.${delivery}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>Rs.{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button onClick={handleOrder} disabled={loading}
                className="w-full flex items-center justify-center gap-2 mt-5 py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : paymentMethod === 'ONLINE' ? (
                  <><CreditCard className="w-4 h-4" /> Pay Rs.{grandTotal.toLocaleString('en-IN')}</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Place Order (COD)</>
                )}
              </button>

              {paymentMethod === 'ONLINE' && (
                <p className="text-center text-xs text-slate-400 mt-3">
                  Secure payment via Razorpay
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && reviewItems.length > 0 && (
        <ReviewModal
          orderItems={reviewItems}
          onClose={handleReviewModalClose}
        />
      )}
    </div>
  )
}

export default Checkout

