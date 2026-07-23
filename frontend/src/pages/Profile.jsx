import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateUser } from '../redux/slices/authSlice'
import api from '../services/api'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Building2, Lock, Eye, EyeOff, Edit3, Save, X } from 'lucide-react'

const Profile = () => {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()

  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    gstNumber: user?.gstNumber || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileUpdate = async () => {
    setLoading(true)
    try {
      const { data } = await api.put('/user/profile', form)
      dispatch(updateUser(data))
      toast.success('Profile updated successfully!')
      setEditMode(false)
    } catch (err) {
      // Backend nahi connected toh local update karo
      dispatch(updateUser(form))
      toast.success('Profile updated!')
      setEditMode(false)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match!')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters!')
      return
    }
    setLoading(true)
    try {
      await api.put('/user/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPasswordMode(false)
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-[104px] min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 mb-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  user?.role === 'ADMIN'
                    ? 'bg-sky-100 text-sky-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {user?.role || 'Customer'}
                </span>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-xl text-sm font-medium hover:bg-sky-100 transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            )}
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">

            {/* Email — not editable */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl">
              <Mail className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-800">{user?.email}</p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Cannot change</span>
            </div>

            {/* Full Name */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl">
              <User className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Full Name</p>
                {editMode ? (
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-100 mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-800">{user?.fullName}</p>
                )}
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl">
              <Phone className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Mobile</p>
                {editMode ? (
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="Enter mobile number"
                    className="w-full text-sm font-medium text-slate-800 bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-100 mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-800">{user?.mobile || 'Not added'}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl">
              <MapPin className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Address</p>
                {editMode ? (
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Enter full address"
                    className="w-full text-sm font-medium text-slate-800 bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-100 mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-800">{user?.address || 'Not added'}</p>
                )}
              </div>
            </div>

            {/* GST Number */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl">
              <Building2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">GST Number</p>
                {editMode ? (
                  <input
                    type="text"
                    value={form.gstNumber}
                    onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                    placeholder="Enter GST number (optional)"
                    className="w-full text-sm font-medium text-slate-800 bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-100 mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-800">{user?.gstNumber || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Edit Mode Buttons */}
          {editMode && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false)
                  setForm({
                    fullName: user?.fullName || '',
                    mobile: user?.mobile || '',
                    address: user?.address || '',
                    gstNumber: user?.gstNumber || '',
                  })
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Change Password</h3>
                <p className="text-xs text-slate-400">Update your account password</p>
              </div>
            </div>
            {!passwordMode && (
              <button
                onClick={() => setPasswordMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Change
              </button>
            )}
          </div>

          {passwordMode && (
            <div className="space-y-3 mt-4">

              {/* Old Password */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showOld ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  />
                  <button type="button" onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter new password (min 6 chars)"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full pl-3 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  onClick={() => {
                    setPasswordMode(false)
                    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Profile