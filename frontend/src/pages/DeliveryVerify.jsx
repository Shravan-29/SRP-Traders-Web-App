import { useState } from 'react'
import { CheckCircle, Package, Loader2, AlertCircle } from 'lucide-react'
import api from '../services/api'

const DeliveryVerify = () => {
  const [orderId, setOrderId] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const [orderInfo, setOrderInfo] = useState(null)

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!orderId || !otp || otp.length !== 6) {
      setErrorMsg('Please enter valid Order ID and 6-digit OTP')
      setResult('error')
      return
    }
    setLoading(true)
    setResult(null)
    setErrorMsg('')
    try {
      const { data } = await api.post(`/delivery-otp/verify/${orderId}`, { otp })
      setOrderInfo({ orderId })
      setResult('success')
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid OTP or Order ID!')
      setResult('error')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setOrderId('')
    setOtp('')
    setResult(null)
    setErrorMsg('')
    setOrderInfo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="SRP Traders"
            className="w-20 h-20 object-contain mx-auto mb-4"
            onError={(e) => e.target.style.display = 'none'} />
          <h1 className="text-2xl font-bold text-slate-900">SRP Traders</h1>
          <p className="text-slate-500 text-sm mt-1">Delivery Verification Portal</p>
        </div>

        {/* Success State */}
        {result === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Delivery Confirmed!</h2>
            <p className="text-slate-600 text-sm mb-2">
              Order <span className="font-bold">#{orderInfo?.orderId}</span> has been successfully delivered.
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Order status updated to <span className="font-semibold text-green-600">DELIVERED</span>
            </p>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-green-700 text-sm font-medium">Customer notification sent!</p>
              <p className="text-green-600 text-xs mt-1">Customer has been notified via email</p>
            </div>
            <button onClick={handleReset}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors text-sm">
              Verify Another Order
            </button>
          </div>
        )}

        {/* Verification Form */}
        {result !== 'success' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Verify Delivery OTP</h2>
                <p className="text-slate-500 text-xs mt-0.5">Ask customer for their OTP</p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              {/* Order ID */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Order ID
                </label>
                <input
                  type="number"
                  placeholder="Enter Order ID (e.g. 12)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                  required
                />
              </div>

              {/* OTP */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Customer OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm font-mono text-center text-2xl tracking-widest"
                  required
                />
              </div>

              {/* Error */}
              {result === 'error' && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{errorMsg}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !orderId || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors mt-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                  : <><CheckCircle className="w-4 h-4" /> Confirm Delivery</>
                }
              </button>
            </form>

            {/* Instructions */}
            <div className="mt-6 bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">Instructions:</p>
              <ul className="space-y-1">
                {[
                  'Enter the Order ID from your delivery sheet',
                  'Ask the customer for their 6-digit OTP',
                  'OTP was sent to customer\'s registered email',
                  'Verify OTP before handing over the package',
                ].map((tip, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="text-sky-400 font-bold mt-0.5">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-4">
          SRP Traders — Chembur, Mumbai | For support: info@srptraders.in
        </p>
      </div>
    </div>
  )
}

export default DeliveryVerify
