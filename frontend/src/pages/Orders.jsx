import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Package, FileText, ChevronDown, ChevronUp, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  PENDING:    { color: 'bg-amber-100 text-amber-700',  icon: Clock,        label: 'Pending' },
  CONFIRMED:  { color: 'bg-blue-100 text-blue-700',    icon: CheckCircle,  label: 'Confirmed' },
  PROCESSING: { color: 'bg-purple-100 text-purple-700',icon: Package,      label: 'Processing' },
  SHIPPED:    { color: 'bg-sky-100 text-sky-700',      icon: Truck,        label: 'Shipped' },
  DELIVERED:  { color: 'bg-green-100 text-green-700',  icon: CheckCircle,  label: 'Delivered' },
  CANCELLED:  { color: 'bg-red-100 text-red-700',      icon: XCircle,      label: 'Cancelled' },
}

const Orders = () => {
  const { token } = useSelector((s) => s.auth)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/orders/my-orders')
      setOrders(data)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  // const downloadInvoice = (orderId) => {
  //   const url = `http://localhost:8080/api/invoice/${orderId}/view`
  //   window.open(url, '_blank')
  //   toast.success('Invoice opened!')
  // }
  const downloadInvoice = async (orderId) => {
  try {
    const response = await api.get(`/invoice/${orderId}/view`, {
      responseType: 'text'
    })
    const blob = new Blob([response.data], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    toast.success('Invoice opened!')
  } catch (err) {
    toast.error('Failed to load invoice')
  }
}


  if (loading) return (
    <div className="pt-[104px] min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
    </div>
  )

  if (orders.length === 0) return (
    <div className="pt-[104px] min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">No orders yet</h2>
        <p className="text-slate-400 text-sm mb-6">Your orders will appear here after you shop</p>
        <Link to="/shop" className="px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors">
          Start Shopping
        </Link>
      </div>
    </div>
  )

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
            <p className="text-slate-500 text-sm mt-1">{orders.length} orders total</p>
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
            const StatusIcon = status.icon
            const isExpanded = expanded === order.id

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

                {/* Order Header */}
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-sky-50 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-sky-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Order #{order.id}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>

                {/* Order Summary Bar */}
                <div className="px-5 pb-4 flex items-center justify-between border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">
                      {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="font-bold text-slate-900">
                      ₹{order.grandTotal?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                      order.paymentMethod === 'CASH_ON_DELIVERY'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' : 'Online'}
                    </span>
                  </div>

                  {/* Invoice Button */}
                  <button
                    onClick={() => downloadInvoice(order.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Invoice
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50">

                    {/* Items */}
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Items</p>
                    <div className="space-y-2 mb-4">
                      {order.orderItems?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3">
                          <img
                            src={item.productImage || `https://placehold.co/50x50/e0f2fe/0284c7?text=P`}
                            alt={item.productName}
                            className="w-12 h-12 object-contain rounded-lg bg-slate-50"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 text-sm truncate">{item.productName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-slate-900 text-sm flex-shrink-0">
                            ₹{item.totalPrice?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address */}
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Delivery Address</p>
                    <div className="bg-white rounded-xl p-3 text-sm text-slate-600">
                      <p>{order.deliveryAddress}</p>
                      <p>{order.deliveryCity} - {order.deliveryPincode}</p>
                      <p>Phone: {order.deliveryPhone}</p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="mt-4 bg-white rounded-xl p-3">
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Subtotal</span>
                        <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Delivery</span>
                        <span className={order.deliveryCharge === 0 ? 'text-green-500 font-medium' : ''}>
                          {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2">
                        <span>Total</span>
                        <span>₹{order.grandTotal?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Orders
