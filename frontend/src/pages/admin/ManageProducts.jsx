import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, Save } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  discount: '', image: '', stock: '', featured: false, categoryId: '',
  warrantyPeriod: '', warrantyType: 'months'
}

const ManageProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/products?page=0&size=100')
      setProducts(data.content || [])
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories')
      setCategories(data)
    } catch {
      toast.error('Failed to load categories')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: parseFloat(form.originalPrice),
        discount: parseInt(form.discount),
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
      }
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload)
        toast.success('Product updated!')
      } else {
        await api.post('/products', payload)
        toast.success('Product added!')
      }
      setShowModal(false)
      setForm(EMPTY_FORM)
      setEditProduct(null)
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      discount: product.discount || '',
      image: product.image || '',
      stock: product.stock || '',
      featured: product.featured || false,
      categoryId: product.categoryId || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted!')
      loadProducts()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
            <p className="text-slate-500 text-sm mt-1">{products.length} products total</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditProduct(null); setForm(EMPTY_FORM) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search products..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-400 text-sm"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Image', 'Name', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filtered.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <img
                          src={product.image || `https://placehold.co/50x50/e0f2fe/0284c7?text=P`}
                          alt={product.name}
                          className="w-12 h-12 object-contain rounded-lg bg-slate-50"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 max-w-[200px] truncate">{product.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-sky-50 text-sky-600 rounded-lg text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">₹{product.price?.toLocaleString('en-IN')}</p>
                        {product.originalPrice > product.price && (
                          <p className="text-xs text-slate-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          product.stock > 10
                            ? 'bg-green-50 text-green-600'
                            : product.stock > 0
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-red-50 text-red-500'
                        }`}>
                          {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          product.featured ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {product.featured ? 'Featured' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 bg-sky-50 text-sky-500 rounded-lg hover:bg-sky-100 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditProduct(null); setForm(EMPTY_FORM) }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">

                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Product Name *</label>
                  <input type="text" required placeholder="Enter product name"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <textarea rows={3} placeholder="Product description"
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm resize-none"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹) *</label>
                  <input type="number" required placeholder="0"
                    value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Original Price (₹)</label>
                  <input type="number" placeholder="0"
                    value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  />
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Discount (%)</label>
                  <input type="number" placeholder="0" min="0" max="100"
                    value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Stock *</label>
                  <input type="number" required placeholder="0"
                    value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
                  <select required
                    value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Image URL</label>
                  <input type="text" placeholder="https://example.com/image.jpg"
                    value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  />
                </div>

                {/* Warranty */}
<div>
  <label className="block text-xs font-medium text-slate-600 mb-1">Warranty Period</label>
  <input type="number" placeholder="e.g. 6, 12, 24"
    value={form.warrantyPeriod}
    onChange={(e) => setForm({ ...form, warrantyPeriod: e.target.value })}
    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
  />
</div>

<div>
  <label className="block text-xs font-medium text-slate-600 mb-1">Warranty Type</label>
  <select
    value={form.warrantyType}
    onChange={(e) => setForm({ ...form, warrantyType: e.target.value })}
    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
  >
    <option value="months">Months</option>
    <option value="years">Years</option>
    <option value="lifetime">Lifetime</option>
    <option value="no_warranty">No Warranty</option>
  </select>
</div>

                {/* Featured */}
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="featured"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 text-sky-500 rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                    Featured Product (show on homepage)
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button"
                  onClick={() => { setShowModal(false); setEditProduct(null); setForm(EMPTY_FORM) }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageProducts