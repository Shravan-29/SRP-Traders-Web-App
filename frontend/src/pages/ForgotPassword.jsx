import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Package, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react'

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1=email, 2=otp+password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter email!'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('OTP sent to your email!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP!')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!otp) { toast.error('Please enter OTP!'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match!'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters!'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1
                ? 'Enter your email to receive OTP'
                : `OTP sent to ${email}`}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-sky-500' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-sky-500' : 'bg-slate-200'}`} />
          </div>

          {/* Step 1 — Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email" required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2 — OTP + New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">

              {/* OTP */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Enter OTP
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" required maxLength={6}
                    placeholder="6 digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm tracking-widest font-bold text-center text-lg"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Check your email — OTP valid for 10 minutes
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'} required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password" required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              {/* Resend OTP */}
              <button type="button"
                onClick={() => { setStep(1); setOtp('') }}
                className="w-full text-center text-sm text-sky-500 hover:text-sky-600 transition-colors">
                Resend OTP
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Remember password?{' '}
            <Link to="/login" className="text-sky-500 font-semibold hover:text-sky-600">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword