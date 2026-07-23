import { useState, useEffect } from 'react'
import { Package, Loader2, RefreshCw, ChevronDown, ChevronUp, Search, Send, CheckCircle, Key } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const paymentStatusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-slate-100 text-slate-700',
}

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const ManageOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [search, setSearch] = useState('')
  const [otpInputs, setOtpInputs] = useState({})
  const [otpLoading, setOtpLoading] = useState({})
  const [generatingOtp, setGeneratingOtp] = useState({})

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/orders/admin/all')
      setOrders(data)
    } catch (err) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, status) => {
    setUpdatingStatus(orderId + '_' + status)
    try {
      await api.put(`/orders/admin/${orderId}/status?status=${status}`)
      toast.success(`Order #${orderId} → ${status}`)

      // Jab SHIPPED karo tab auto OTP generate karo
      if (status === 'SHIPPED') {
        await generateOtp(orderId, true)
      }
      loadOrders()
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const generateOtp = async (orderId, silent = false) => {
    setGeneratingOtp(prev => ({ ...prev, [orderId]: true }))
    try {
      await api.post(`/delivery-otp/generate/${orderId}`)
      if (!silent) toast.success(`OTP generated & sent to customer!`)
    } catch (err) {
      if (!silent) toast.error(err.response?.data?.message || 'Failed to generate OTP')
    } finally {
      setGeneratingOtp(prev => ({ ...prev, [orderId]: false }))
    }
  }

  const verifyOtp = async (orderId) => {
    const otp = otpInputs[orderId]
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP')
      return
    }
    setOtpLoading(prev => ({ ...prev, [orderId]: true }))
    try {
      await api.post(`/delivery-otp/verify/${orderId}`, { otp })
      toast.success('OTP verified! Order marked as DELIVERED.')
      setOtpInputs(prev => ({ ...prev, [orderId]: '' }))
      loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP!')
    } finally {
      setOtpLoading(prev => ({ ...prev, [orderId]: false }))
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus
    const matchesSearch = search === '' ||
      order.id.toString().includes(search) ||
      order.userName?.toLowerCase().includes(search.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalRevenue = orders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + (o.grandTotal || 0), 0)
  const pendingCount = orders.filter(o => o.status === 'PENDING').length
  const shippedCount = orders.filter(o => o.status === 'SHIPPED').length

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Orders</h1>
            <p className="text-slate-500 text-sm mt-1">{orders.length} total orders</p>
          </div>
          <button onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Orders', value: orders.length, color: 'text-slate-900' },
            { label: 'Pending', value: pendingCount, color: 'text-amber-600' },
            { label: 'Out for Delivery', value: shippedCount, color: 'text-indigo-600' },
            { label: 'Revenue', value: `Rs.${totalRevenue.toLocaleString('en-IN')}`, color: 'text-sky-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by order ID, name or email..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-400 text-sm"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-sky-400">
            <option value="ALL">All Status</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

                <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-sky-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">Order #{order.id}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${paymentStatusColors[order.paymentStatus]}`}>
                          {order.paymentStatus}
                        </span>
                        {order.status === 'SHIPPED' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 flex items-center gap-1">
                            <Key className="w-3 h-3" /> OTP Sent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{order.userName} • {order.userEmail}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-slate-900">Rs.{order.grandTotal?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-400">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t border-slate-100 p-5 space-y-5">

                    {/* Items */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">Items</h3>
                      <div className="space-y-3">
                        {order.orderItems?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <img src={item.productImage || `https://placehold.co/50x50/e0f2fe/0284c7?text=P`}
                              alt={item.productName}
                              onError={(e) => e.target.src = `https://placehold.co/50x50/e0f2fe/0284c7?text=P`}
                              className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 text-sm truncate">{item.productName}</p>
                              <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-slate-900 text-sm flex-shrink-0">Rs.{item.totalPrice?.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price + Address */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal</span><span>Rs.{order.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Delivery</span>
                          <span>{order.deliveryCharge === 0 ? 'FREE' : `Rs.${order.deliveryCharge}`}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                          <span>Total</span><span>Rs.{order.grandTotal?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-xs text-slate-500">Payment: {order.paymentMethod === 'ONLINE' ? 'Online (Razorpay)' : 'Cash on Delivery'}</p>
                          {order.paymentId && <p className="text-xs text-slate-400 mt-1 truncate">ID: {order.paymentId}</p>}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Delivery Address</h4>
                        <p className="text-sm text-slate-700">{order.deliveryAddress}</p>
                        <p className="text-sm text-slate-700">{order.deliveryCity} - {order.deliveryPincode}</p>
                        <p className="text-xs text-slate-500 mt-1">Phone: {order.deliveryPhone}</p>
                      </div>
                    </div>

                    {/* Update Status */}
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Update Order Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {ORDER_STATUSES.filter(s => s !== 'DELIVERED').map(status => (
                          <button key={status}
                            onClick={() => updateStatus(order.id, status)}
                            disabled={order.status === status || !!updatingStatus}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              order.status === status
                                ? 'bg-sky-500 text-white cursor-default'
                                : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-600 disabled:opacity-50'
                            }`}>
                            {updatingStatus === order.id + '_' + status ? '...' : status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delivery OTP Section */}
                    {order.status === 'SHIPPED' && (
                      <div className="border-t border-slate-100 pt-4">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Key className="w-5 h-5 text-indigo-600" />
                            <h4 className="text-sm font-bold text-indigo-900">Delivery OTP Verification</h4>
                          </div>
                          <p className="text-xs text-indigo-700 mb-4">
                            Order is out for delivery. Ask the customer for their OTP and verify below to mark as delivered.
                          </p>

                          <div className="flex gap-3 flex-wrap">
                            {/* Resend OTP */}
                            <button
                              onClick={() => generateOtp(order.id)}
                              disabled={generatingOtp[order.id]}
                              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-indigo-300 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-60">
                              {generatingOtp[order.id]
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Send className="w-4 h-4" />}
                              Resend OTP
                            </button>

                            {/* OTP Input + Verify */}
                            <div className="flex gap-2 flex-1 min-w-0">
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={otpInputs[order.id] || ''}
                                onChange={(e) => setOtpInputs(prev => ({
                                  ...prev,
                                  [order.id]: e.target.value.replace(/\D/g, '')
                                }))}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-300 focus:outline-none focus:border-indigo-500 text-sm font-mono text-center text-lg tracking-widest min-w-0"
                              />
                              <button
                                onClick={() => verifyOtp(order.id)}
                                disabled={otpLoading[order.id] || !otpInputs[order.id] || otpInputs[order.id]?.length !== 6}
                                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">
                                {otpLoading[order.id]
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : <CheckCircle className="w-4 h-4" />}
                                Verify & Deliver
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Already Delivered */}
                    {order.status === 'DELIVERED' && (
                      <div className="border-t border-slate-100 pt-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-green-800">Order Successfully Delivered</p>
                            <p className="text-xs text-green-600 mt-0.5">OTP was verified and delivery confirmed</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageOrders
