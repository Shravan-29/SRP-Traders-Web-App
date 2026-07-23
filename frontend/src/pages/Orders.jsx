// import { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import api from '../services/api'
// import { Package, ChevronDown, ChevronUp, Loader2, ShoppingBag, RefreshCw } from 'lucide-react'

// const statusColors = {
//   PENDING: 'bg-amber-100 text-amber-700',
//   CONFIRMED: 'bg-blue-100 text-blue-700',
//   PROCESSING: 'bg-purple-100 text-purple-700',
//   SHIPPED: 'bg-indigo-100 text-indigo-700',
//   DELIVERED: 'bg-green-100 text-green-700',
//   CANCELLED: 'bg-red-100 text-red-700',
// }

// const paymentStatusColors = {
//   PENDING: 'bg-amber-100 text-amber-700',
//   PAID: 'bg-green-100 text-green-700',
//   FAILED: 'bg-red-100 text-red-700',
//   REFUNDED: 'bg-slate-100 text-slate-700',
// }

// const Orders = () => {
//   const [orders, setOrders] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [expandedOrder, setExpandedOrder] = useState(null)
//   const { user } = useSelector((s) => s.auth)
//   const navigate = useNavigate()

//   useEffect(() => {
//     // Admin ko ManageOrders pe redirect karo
//     if (user?.role === 'ADMIN') {
//       navigate('/admin/orders')
//       return
//     }
//     loadOrders()
//   }, [user])

//   const loadOrders = async () => {
//     setLoading(true)
//     try {
//       const { data } = await api.get('/orders/my-orders')
//       setOrders(data)
//     } catch (err) {
//       console.error('Failed to load orders:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) return (
//     <div className="pt-[104px] min-h-screen bg-slate-50 flex items-center justify-center">
//       <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
//     </div>
//   )

//   if (orders.length === 0) return (
//     <div className="pt-[104px] min-h-screen bg-slate-50 flex items-center justify-center">
//       <div className="text-center">
//         <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
//         <h2 className="text-xl font-bold text-slate-700 mb-2">No orders yet</h2>
//         <p className="text-slate-400 text-sm mb-6">Your orders will appear here once you place one</p>
//         <Link to="/shop" className="px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors">
//           Browse Products
//         </Link>
//       </div>
//     </div>
//   )

//   return (
//     <div className="pt-[104px] min-h-screen bg-slate-50">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
//             <p className="text-slate-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
//           </div>
//           <button onClick={loadOrders}
//             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
//             <RefreshCw className="w-4 h-4" /> Refresh
//           </button>
//         </div>

//         <div className="space-y-4">
//           {orders.map((order) => (
//             <div key={order.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

//               {/* Order Header */}
//               <div
//                 className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
//                 onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
//                 <div className="flex items-center gap-4">
//                   <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
//                     <Package className="w-5 h-5 text-sky-500" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-slate-900">Order #{order.id}</p>
//                     <p className="text-xs text-slate-400 mt-0.5">
//                       {new Date(order.createdAt).toLocaleDateString('en-IN', {
//                         day: 'numeric', month: 'long', year: 'numeric',
//                         hour: '2-digit', minute: '2-digit'
//                       })}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   <div className="text-right hidden sm:block">
//                     <p className="font-bold text-slate-900">
//                       Rs.{order.grandTotal?.toLocaleString('en-IN')}
//                     </p>
//                     <p className="text-xs text-slate-400">
//                       {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}
//                     </p>
//                   </div>
//                   <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
//                     {order.status}
//                   </span>
//                   {expandedOrder === order.id
//                     ? <ChevronUp className="w-4 h-4 text-slate-400" />
//                     : <ChevronDown className="w-4 h-4 text-slate-400" />}
//                 </div>
//               </div>

//               {/* Expanded Details */}
//               {expandedOrder === order.id && (
//                 <div className="border-t border-slate-100 p-5 space-y-5">

//                   {/* Items */}
//                   <div>
//                     <h3 className="text-sm font-semibold text-slate-700 mb-3">Items Ordered</h3>
//                     <div className="space-y-3">
//                       {order.orderItems?.map((item, i) => (
//                         <div key={i} className="flex items-center gap-3">
//                           <img
//                             src={item.productImage || `https://placehold.co/60x60/e0f2fe/0284c7?text=P`}
//                             alt={item.productName}
//                             onError={(e) => e.target.src = `https://placehold.co/60x60/e0f2fe/0284c7?text=P`}
//                             className="w-14 h-14 object-contain bg-slate-50 rounded-xl p-1 flex-shrink-0"
//                           />
//                           <div className="flex-1 min-w-0">
//                             <p className="font-medium text-slate-800 text-sm truncate">{item.productName}</p>
//                             <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity}</p>
//                           </div>
//                           <div className="text-right flex-shrink-0">
//                             <p className="font-semibold text-slate-900 text-sm">
//                               Rs.{item.totalPrice?.toLocaleString('en-IN')}
//                             </p>
//                             <p className="text-xs text-slate-400">
//                               Rs.{item.price?.toLocaleString('en-IN')} each
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Price Summary */}
//                   <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
//                     <div className="flex justify-between text-slate-600">
//                       <span>Subtotal</span>
//                       <span>Rs.{order.totalAmount?.toLocaleString('en-IN')}</span>
//                     </div>
//                     <div className="flex justify-between text-slate-600">
//                       <span>Delivery Charge</span>
//                       <span className={order.deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
//                         {order.deliveryCharge === 0 ? 'FREE' : `Rs.${order.deliveryCharge}`}
//                       </span>
//                     </div>
//                     <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
//                       <span>Grand Total</span>
//                       <span>Rs.{order.grandTotal?.toLocaleString('en-IN')}</span>
//                     </div>
//                   </div>

//                   {/* Payment + Delivery */}
//                   <div className="grid sm:grid-cols-2 gap-4">
//                     <div className="bg-slate-50 rounded-xl p-4">
//                       <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
//                         Payment Details
//                       </h4>
//                       <p className="text-sm font-medium text-slate-800">
//                         {order.paymentMethod === 'ONLINE' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}
//                       </p>
//                       <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${paymentStatusColors[order.paymentStatus] || 'bg-slate-100 text-slate-600'}`}>
//                         {order.paymentStatus}
//                       </span>
//                       {order.paymentId && (
//                         <p className="text-xs text-slate-400 mt-2">
//                           Transaction ID: {order.paymentId}
//                         </p>
//                       )}
//                     </div>
//                     <div className="bg-slate-50 rounded-xl p-4">
//                       <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
//                         Delivery Address
//                       </h4>
//                       <p className="text-sm text-slate-700 leading-relaxed">
//                         {order.deliveryAddress}
//                       </p>
//                       <p className="text-sm text-slate-700">
//                         {order.deliveryCity} - {order.deliveryPincode}
//                       </p>
//                       <p className="text-xs text-slate-500 mt-1">
//                         Phone: {order.deliveryPhone}
//                       </p>
//                     </div>
//                   </div>

//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Orders

//new code 

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