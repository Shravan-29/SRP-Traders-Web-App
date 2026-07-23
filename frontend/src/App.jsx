import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ForgotPassword from './pages/ForgotPassword'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageProducts from './pages/admin/ManageProducts'
import ManageOrders from './pages/admin/ManageOrders'
import ManageDeliveryStaff from './pages/admin/ManageDeliveryStaff'
import ProtectedRoute from './components/ProtectedRoute'
import DeliveryPortal from './pages/DeliveryPortal'

function App() {
  const location = useLocation()

  // /delivery se shuru hone wale sab pages par navbar/footer hide honge
  const isDeliveryPage = location.pathname.startsWith('/delivery')

  return (
    <div className="min-h-screen flex flex-col">
      {!isDeliveryPage && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Delivery */}
          <Route path="/delivery" element={<DeliveryPortal />} />

          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/products" element={<ManageProducts />} />
            <Route path="/admin/orders" element={<ManageOrders />} />
            <Route
              path="/admin/delivery-staff"
              element={<ManageDeliveryStaff />}
            />
          </Route>
        </Routes>
      </main>

      {!isDeliveryPage && <Footer />}
    </div>
  )
}

export default App