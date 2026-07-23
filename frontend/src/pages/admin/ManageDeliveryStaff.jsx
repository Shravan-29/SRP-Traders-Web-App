import { useState, useEffect } from 'react'
import { Truck, Plus, Loader2, RefreshCw, CheckCircle, Ban, Trash2, Eye, EyeOff, X } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const ManageDeliveryStaff = () => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', mobile: '', address: 'Mumbai'
  })

  useEffect(() => { loadStaff() }, [])

  const loadStaff = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users')
      setStaff(data.filter(u => u.role === 'DELIVERY'))
    } catch {
      toast.error('Failed to load delivery staff')
    } finally {
      setLoading(false)
    }
  }

  const addStaff = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setAddLoading(true)
    try {
      await api.post('/admin/delivery-staff', form)
      toast.success('Delivery staff added successfully!')
      setShowAddModal(false)
      setForm({ fullName: '', email: '', password: '', mobile: '', address: 'Mumbai' })
      loadStaff()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add staff')
    } finally {
      setAddLoading(false)
    }
  }

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/admin/users/${id}/${action}`)
      toast.success(`Staff ${action}d successfully!`)
      loadStaff()
    } catch {
      toast.error(`Failed to ${action} staff`)
    }
  }

  const deleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery staff?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('Staff deleted!')
      loadStaff()
    } catch {
      toast.error('Failed to delete staff')
    }
  }

  const statusColors = {
    APPROVED: 'bg-green-100 text-green-700',
    BANNED: 'bg-red-100 text-red-700',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Delivery Staff</h1>
            <p className="text-slate-500 text-sm mt-1">{staff.length} staff member{staff.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadStaff}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Staff
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6">
          <p className="text-sky-800 text-sm font-medium mb-1">Delivery Staff Login URL:</p>
          <p className="text-sky-600 text-sm font-mono">
            {window.location.origin}/delivery
          </p>
          <p className="text-sky-600 text-xs mt-1">Share this URL with delivery staff along with their credentials.</p>
        </div>

        {/* Staff List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No delivery staff added yet</p>
            <p className="text-slate-400 text-sm mt-1">Click "Add Staff" to add a delivery boy</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Name', 'Email', 'Mobile', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {staff.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                            {member.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{member.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{member.email}</td>
                      <td className="px-6 py-4 text-slate-600">{member.mobile || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[member.status] || 'bg-slate-100 text-slate-600'}`}>
                          {member.status === 'PENDING_APPROVAL' ? 'PENDING' : member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {member.status === 'APPROVED' ? (
                            <button onClick={() => updateStatus(member.id, 'ban')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                              <Ban className="w-3 h-3" /> Ban
                            </button>
                          ) : (
                            <button onClick={() => updateStatus(member.id, 'approve')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                              <CheckCircle className="w-3 h-3" /> Activate
                            </button>
                          )}
                          <button onClick={() => deleteStaff(member.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Add Delivery Staff</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={addStaff} className="p-6 space-y-4">
              {[
                { key: 'fullName', label: 'Full Name', placeholder: 'Raju Kumar', type: 'text' },
                { key: 'email', label: 'Email', placeholder: 'raju@srptraders.in', type: 'email' },
                { key: 'mobile', label: 'Mobile', placeholder: '9876543210', type: 'tel' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label} *</label>
                  <input type={type} required placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors">
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {addLoading ? 'Adding...' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageDeliveryStaff
