import { useState, useEffect } from 'react'
import { CheckCircle, Package, Loader2, AlertCircle, MapPin, Phone, User, LogOut, RefreshCw, ChevronRight, Key, IndianRupee, Eye, EyeOff } from 'lucide-react'

import api from '../services/api'
import toast from 'react-hot-toast'

const VIEWS = { LOGIN: 'login', ORDERS: 'orders', DETAIL: 'detail', OTP: 'otp', SUCCESS: 'success' }

const DeliveryPortal = () => {
  const [view, setView] = useState(VIEWS.LOGIN)
  const [token, setToken] = useState(localStorage.getItem('delivery_token') || null)
  const [deliveryUser, setDeliveryUser] = useState(JSON.parse(localStorage.getItem('delivery_user') || 'null'))
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // useEffect(() => {
  //   if (token && deliveryUser) {
  //     setView(VIEWS.ORDERS)
  //     loadOrders()
  //   }
  // }, [])
  useEffect(() => {
    if (token && deliveryUser) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setView(VIEWS.ORDERS)
      loadOrders()
    }
  }, [])

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', loginForm)
      if (data.user.role !== 'DELIVERY') {
        setError('Access denied. This portal is for delivery staff only.')
        setLoading(false)
        return
      }
      localStorage.setItem('delivery_token', data.token)
      localStorage.setItem('delivery_user', JSON.stringify(data.user))
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      setToken(data.token)
      setDeliveryUser(data.user)
      setView(VIEWS.ORDERS)
      await loadOrders(data.token)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials!')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('delivery_token')
    localStorage.removeItem('delivery_user')
    setToken(null)
    setDeliveryUser(null)
    setOrders([])
    setView(VIEWS.LOGIN)
    setLoginForm({ email: '', password: '' })
  }

  const loadOrders = async (authToken) => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${authToken || token}` }
      const { data } = await api.get('/orders/delivery/assigned', { headers })
      setOrders(data)
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Session expired. Please login again.')
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const selectOrder = (order) => {
    setSelectedOrder(order)
    setOtp('')
    setError('')
    setView(VIEWS.DETAIL)
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      setError('Enter valid 6-digit OTP')
      return
    }
    setOtpLoading(true)
    setError('')
    try {
      await api.post(`/delivery-otp/verify/${selectedOrder.id}`, { otp })
      setView(VIEWS.SUCCESS)
      toast.success('Delivery confirmed!')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP!')
    } finally {
      setOtpLoading(false)
    }
  }

  const afterSuccess = () => {
    setOtp('')
    setError('')
    setSelectedOrder(null)
    setView(VIEWS.ORDERS)
    loadOrders()
  }

  // LOGIN
  // if (view === VIEWS.LOGIN) return (
  //   <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
  //     <div className="w-full max-w-sm">
  //       <div className="text-center mb-8">
  //         <img src="/logo.png" alt="SRP Traders" className="w-20.10 h-20.10 object-contain mx-auto mb-1"
  //           onError={(e) => e.target.style.display = 'none'} />
  //         {/* <h1 className="text-2xl font-bold text-white">SRP Traders</h1> */}
  //         <p className="text-slate-400 text-sm mt-1">Delivery Staff Portal</p>
  //       </div>
  //       <div className="bg-white rounded-2xl p-6 shadow-2xl">
  //         <h2 className="font-bold text-slate-900 mb-1">Staff Login</h2>
  //         <p className="text-slate-500 text-sm mb-5">Enter your delivery staff credentials</p>
  //         <form onSubmit={login} className="space-y-4">
  //           <div>
  //             <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
  //             <input type="email" required placeholder="staff@srptraders.in"
  //               value={loginForm.email}
  //               onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
  //               className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm" />
  //           </div>
  //           <div>
  //             <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
  //             <input type="password" required placeholder="••••••••"
  //               value={loginForm.password}
  //               onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
  //               className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm" />
  //           </div>
  //           {error && (
  //             <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
  //               <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
  //               <p className="text-red-600 text-xs">{error}</p>
  //             </div>
  //           )}
  //           <button type="submit" disabled={loading}
  //             className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
  //             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
  //             {loading ? 'Logging in...' : 'Login'}
  //           </button>
  //         </form>
  //       </div>
  //     </div>
  //   </div>
  // )

  // LOGIN
if (view === VIEWS.LOGIN) return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <img src="/logo.png" alt="SRP Traders"
          style={{ width: 90, height: 90, objectFit: 'contain', margin: '0 auto 8px' }}
          onError={(e) => e.target.style.display = 'none'} />
        <p className="text-slate-400 text-sm mt-1">Delivery Staff Portal</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-2xl">
        <h2 className="font-bold text-slate-900 mb-1">Staff Login</h2>
        <p className="text-slate-500 text-sm mb-5">Enter your delivery staff credentials</p>
        <form onSubmit={login} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email" required placeholder="staff@srptraders.in"
              value={loginForm.email}
              onChange={(e) => { setLoginForm({ ...loginForm, email: e.target.value }); setError('') }}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
              }`}
            />
          </div>

          {/* Password */}
<div>
  <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
  <div className="relative">
    <input
      type={showPass ? 'text' : 'password'} required placeholder="••••••••"
      value={loginForm.password}
      onChange={(e) => { setLoginForm({ ...loginForm, password: e.target.value }); setError('') }}
      className={`w-full px-3 py-2.5 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
        error
          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
          : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
      }`}
    />
    <button
      type="button"
      onClick={() => setShowPass(!showPass)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
  {/* Forgot Password */}
  <div className="flex justify-end mt-1.5">
    <a href="/forgot-password"
      className="text-xs text-sky-500 hover:text-sky-600 hover:underline transition-colors">
      Forgot password?
    </a>
  </div>
</div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-xs font-medium">
                {error.toLowerCase().includes('password') || error.toLowerCase().includes('credentials')
                  ? 'Wrong password! Please try again.'
                  : error.toLowerCase().includes('pending')
                  ? 'Your account is pending approval.'
                  : error.toLowerCase().includes('banned')
                  ? 'Your account has been banned.'
                  : error.toLowerCase().includes('access denied')
                  ? 'Access denied. Delivery staff only.'
                  : error}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  </div>
)

  // ORDERS LIST
  if (view === VIEWS.ORDERS) return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SRP" className="w-8 h-8 object-contain"
            onError={(e) => e.target.style.display = 'none'} />
          <div>
            <p className="font-bold text-slate-900 text-sm">SRP Traders</p>
            <p className="text-xs text-slate-500">{deliveryUser?.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadOrders()}
            className="p-2 text-slate-500 hover:text-sky-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={logout}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-3 py-1.5 border border-red-200 rounded-lg transition-colors">
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Today's Deliveries</h1>
            <p className="text-slate-500 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''} pending</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No pending deliveries</p>
            <p className="text-slate-400 text-sm mt-1">All orders delivered for today!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <button key={order.id} onClick={() => selectOrder(order)}
                className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-left hover:border-sky-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                      #{order.id}
                    </span>
                    {order.paymentMethod === 'CASH_ON_DELIVERY' ? (
                      <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" /> COD
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-lg">
                        PAID
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <p className="font-semibold text-slate-900 text-sm">{order.userName}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600 text-sm leading-snug">{order.deliveryAddress}, {order.deliveryCity} - {order.deliveryPincode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <p className="text-slate-600 text-sm">{order.deliveryPhone}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-xs text-slate-500">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                  <p className={`font-bold text-sm ${order.paymentMethod === 'CASH_ON_DELIVERY' ? 'text-amber-600' : 'text-green-600'}`}>
                    {order.paymentMethod === 'CASH_ON_DELIVERY'
                      ? `Collect Rs.${order.grandTotal?.toLocaleString('en-IN')}`
                      : `Rs.${order.grandTotal?.toLocaleString('en-IN')} (Paid)`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ORDER DETAIL
  if (view === VIEWS.DETAIL && selectedOrder) return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setView(VIEWS.ORDERS)}
          className="text-slate-500 hover:text-slate-700 transition-colors">
          ← Back
        </button>
        <p className="font-bold text-slate-900">Order #{selectedOrder.id}</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Customer Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide text-slate-500">Customer Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-semibold text-slate-900">{selectedOrder.userName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Delivery Address</p>
                <p className="font-semibold text-slate-900">{selectedOrder.deliveryAddress}</p>
                <p className="text-slate-600 text-sm">{selectedOrder.deliveryCity} - {selectedOrder.deliveryPincode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <a href={`tel:${selectedOrder.deliveryPhone}`}
                  className="font-semibold text-sky-600 text-lg">{selectedOrder.deliveryPhone}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-500 mb-3 text-sm uppercase tracking-wide">Items in Package</h3>
          <div className="space-y-3">
            {selectedOrder.orderItems?.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-700 font-bold text-sm flex-shrink-0">
                  {item.quantity}
                </div>
                <p className="text-slate-800 text-sm flex-1">{item.productName}</p>
                <p className="text-slate-900 font-semibold text-sm flex-shrink-0">Rs.{item.totalPrice?.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className={`rounded-2xl p-5 border-2 ${selectedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'bg-amber-50 border-amber-300' : 'bg-green-50 border-green-300'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-bold text-lg ${selectedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'text-amber-800' : 'text-green-800'}`}>
                {selectedOrder.paymentMethod === 'CASH_ON_DELIVERY'
                  ? `Collect Rs.${selectedOrder.grandTotal?.toLocaleString('en-IN')}`
                  : 'Payment Already Done'}
              </p>
              <p className={`text-sm mt-0.5 ${selectedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'text-amber-600' : 'text-green-600'}`}>
                {selectedOrder.paymentMethod === 'CASH_ON_DELIVERY'
                  ? 'Cash on Delivery — collect before handing package'
                  : 'Online payment received — just verify OTP'}
              </p>
            </div>
            <IndianRupee className={`w-8 h-8 ${selectedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'text-amber-500' : 'text-green-500'}`} />
          </div>
        </div>

        {/* Proceed to OTP */}
        <button onClick={() => { setView(VIEWS.OTP); setError('') }}
          className="w-full flex items-center justify-center gap-2 py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl transition-colors text-base shadow-lg">
          <Key className="w-5 h-5" /> Proceed to OTP Verification
        </button>
      </div>
    </div>
  )

  // OTP VERIFY
  if (view === VIEWS.OTP) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setView(VIEWS.DETAIL)} className="text-slate-500">← Back</button>
        <p className="font-bold text-slate-900">Verify OTP — Order #{selectedOrder?.id}</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg">

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-8 h-8 text-sky-500" />
              </div>
              <h2 className="font-bold text-slate-900 text-lg">Enter Customer OTP</h2>
              <p className="text-slate-500 text-sm mt-1">
                Ask <span className="font-semibold text-slate-700">{selectedOrder?.userName}</span> for their OTP
              </p>
              <p className="text-slate-400 text-xs mt-1">OTP was sent to their registered email</p>
            </div>

            <form onSubmit={verifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''))
                  setError('')
                }}
                className="w-full px-4 py-5 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-sky-400 text-center text-4xl font-mono tracking-[16px] transition-all"
                autoFocus
              />

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-colors text-base">
                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {otpLoading ? 'Verifying...' : 'Confirm Delivery'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )

  // SUCCESS
  if (view === VIEWS.SUCCESS) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-green-700 mb-2">Delivered!</h2>
          <p className="text-slate-600 text-sm mb-1">Order <span className="font-bold">#{selectedOrder?.id}</span></p>
          <p className="font-bold text-slate-900 text-lg">{selectedOrder?.userName}</p>
          <p className="text-slate-500 text-sm mb-6">{selectedOrder?.deliveryAddress}, {selectedOrder?.deliveryCity}</p>

          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left space-y-1.5">
            {['OTP verified', 'Order marked DELIVERED', 'Customer notified', 'Admin updated'].map(t => (
              <div key={t} className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> {t}
              </div>
            ))}
          </div>

          <button onClick={afterSuccess}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl transition-colors">
            Next Delivery
          </button>
        </div>
      </div>
    </div>
  )

  return null
}

export default DeliveryPortal
