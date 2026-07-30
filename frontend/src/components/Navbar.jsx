import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/slices/authSlice'
import { ShoppingCart, Heart, User, Search, Menu, X, Package, LogOut, Settings } from 'lucide-react'
import api from '../services/api'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userDropdown, setUserDropdown] = useState(false)
  const [categories, setCategories] = useState([])

  const { user } = useSelector((s) => s.auth)
  const cartItems = useSelector((s) => s.cart.items)
  const wishlistItems = useSelector((s) => s.wishlist.items)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories')
      setCategories(data)
    } catch {
      // fallback — koi categories nahi toh empty
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/shop?search=${searchQuery}`)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    setUserDropdown(false)
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  // Navbar mein max 7 categories dikhao
  const navCategories = categories.slice(0, 7)

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-sky-100'
        : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

  <Link to="/" className="flex items-center gap-1 flex-shrink-0">
  <img
    src="/logo.png"
    alt="SRP Traders"
    className="h-14 w-auto object-contain"
  />
  <div className="-ml-1">
    <div className="flex items-baseline gap-1">
      <span className="font-bold text-xl text-slate-900">SRP</span>
      <span className="font-bold text-xl text-sky-500">Traders</span>
    </div>
    <div className="text-[10px] text-slate-400 leading-none -mt-0.5">Hardware & Tools</div>
  </div>
</Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools, machines, equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm transition-all"
              />
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            <Link to="/wishlist" className="relative p-2.5 rounded-xl hover:bg-sky-50 transition-colors">
              <Heart className="w-5 h-5 text-slate-600" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-sky-50 transition-colors">
              <ShoppingCart className="w-5 h-5 text-slate-600" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-sky-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-sky-50 transition-colors"
                >
                  <div className="w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[80px] truncate">
                    {user.fullName?.split(' ')[0]}
                  </span>
                </button>
                {userDropdown && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <Link to="/profile" onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 transition-colors">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-sky-600 font-medium hover:bg-sky-50 transition-colors">
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="ml-1 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 transition-colors">
                Login
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-sky-50 ml-1 transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Categories bar — backend se */}
        <div className="hidden md:flex items-center gap-6 pb-2 text-sm">
          <Link to="/shop"
            className="text-slate-500 hover:text-sky-500 transition-colors whitespace-nowrap font-medium">
            All Tools
          </Link>
          {navCategories.map(cat => (
            <Link key={cat.id} to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="text-slate-500 hover:text-sky-500 transition-colors whitespace-nowrap font-medium">
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search products..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
              />
            </div>
          </form>
          <Link to="/shop" onClick={() => setMenuOpen(false)}
            className="block py-2 text-slate-600 hover:text-sky-500 font-medium transition-colors">
            All Tools
          </Link>
          {navCategories.map(cat => (
            <Link key={cat.id} to={`/shop?category=${encodeURIComponent(cat.name)}`}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-slate-600 hover:text-sky-500 font-medium transition-colors">
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar
