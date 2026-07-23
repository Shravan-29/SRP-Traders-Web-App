import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// import { Users, Package, ShoppingBag, TrendingUp, Loader2, RefreshCw } from 'lucide-react'
import { Users, Package, ShoppingBag, TrendingUp, Loader2, RefreshCw, Truck } from 'lucide-react'
import api from '../../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingUsers: 0,
    pendingOrders: 0,
    paidOrders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      // Parallel fetch - agar koi fail ho toh baki chal sake
      const results = await Promise.allSettled([
        api.get('/admin/users'),
        api.get('/products?page=0&size=1000'),
        api.get('/orders/admin/all'),
      ])

      const usersResult = results[0]
      const productsResult = results[1]
      const ordersResult = results[2]

      let totalUsers = 0
      let pendingUsers = 0
      if (usersResult.status === 'fulfilled') {
        const users = usersResult.value.data
        totalUsers = users.filter(u => u.role !== 'ADMIN').length
        pendingUsers = users.filter(u => u.status === 'PENDING_APPROVAL').length
      }

      let totalProducts = 0
      if (productsResult.status === 'fulfilled') {
        // content array ya totalElements — dono handle karo
        const data = productsResult.value.data
        if (data.totalElements !== undefined) {
          totalProducts = data.totalElements
        } else if (data.content) {
          totalProducts = data.content.length
        } else if (Array.isArray(data)) {
          totalProducts = data.length
        }
      }

      let totalOrders = 0
      let totalRevenue = 0
      let pendingOrders = 0
      let paidOrders = 0
      let orders = []
      if (ordersResult.status === 'fulfilled') {
        orders = ordersResult.value.data
        totalOrders = orders.length
        totalRevenue = orders
          .filter(o => o.paymentStatus === 'PAID')
          .reduce((sum, o) => sum + (o.grandTotal || 0), 0)
        pendingOrders = orders.filter(o => o.status === 'PENDING').length
        paidOrders = orders.filter(o => o.paymentStatus === 'PAID').length
      }

      setStats({ totalUsers, totalProducts, totalOrders, totalRevenue, pendingUsers, pendingOrders, paidOrders })
      setRecentOrders(orders.slice(0, 5))

    } catch (err) {
      setError('Dashboard load failed. Please re-login if issue persists.')
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  if (loading) return (
    <div className="pt-[104px] min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
    </div>
  )

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">SRP Traders — Real-time overview</p>
          </div>
          <button onClick={loadDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">
            {error} — <button onClick={loadDashboard} className="underline font-medium">Try again</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            <p className="text-slate-500 text-sm mt-0.5">Total Users</p>
            {stats.pendingUsers > 0 && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                {stats.pendingUsers} pending approval
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-sky-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalProducts}</p>
            <p className="text-slate-500 text-sm mt-0.5">Total Products</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
            <p className="text-slate-500 text-sm mt-0.5">Total Orders</p>
            {stats.pendingOrders > 0 && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                {stats.pendingOrders} pending
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              Rs.{stats.totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-slate-500 text-sm mt-0.5">Total Revenue</p>
            {stats.paidOrders > 0 && (
              <p className="text-xs text-green-600 font-medium mt-1">
                {stats.paidOrders} paid orders
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Manage Users', to: '/admin/users', icon: Users, desc: 'Approve, reject, ban users' },
            { label: 'Manage Products', to: '/admin/products', icon: Package, desc: 'Add, edit, delete products' },
            { label: 'Manage Orders', to: '/admin/orders', icon: ShoppingBag, desc: 'View and update orders' },
            { label: 'Delivery Staff', to: '/admin/delivery-staff', icon: Truck, desc: 'Manage delivery boys' },
          ].map(({ label, to, icon: Icon, desc }) => (
            <Link key={to} to={to}
              className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-sky-200 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center mb-3 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{label}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-sky-500 hover:text-sky-600 font-medium">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Order ID', 'Customer', 'Amount', 'Payment', 'Status'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">#{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{order.userName}</p>
                        <p className="text-xs text-slate-400">{order.userEmail}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        Rs.{order.grandTotal?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {recentOrders.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No orders yet</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminDashboard
