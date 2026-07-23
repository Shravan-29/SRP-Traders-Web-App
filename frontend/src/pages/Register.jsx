import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Package, User, Mail, Lock, Phone, MapPin, Building2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

const Register = () => {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    mobile: '', address: '', gstNumber: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ─── Validation Rules ────────────────────────────────────────
  const validations = {
    fullName: {
      minLength: form.fullName.length >= 3,
      maxLength: form.fullName.length <= 50,
      onlyLetters: /^[a-zA-Z\s]+$/.test(form.fullName),
    },
    email: {
      validFormat: /^[^\s@]+@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|srptraders\.in|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(form.email),
    },
    password: {
      minLength: form.password.length >= 8,
      hasUpper: /[A-Z]/.test(form.password),
      hasNumber: /[0-9]/.test(form.password),
      hasSpecial: /[@#$%^&*!]/.test(form.password),
    },
    confirmPassword: {
      matches: form.password === form.confirmPassword && form.confirmPassword !== '',
    },
    mobile: {
      valid: /^[6-9][0-9]{9}$/.test(form.mobile),
    },
    address: {
      minLength: form.address.length >= 10,
      maxLength: form.address.length <= 200,
    },
  }

  const isPasswordValid = Object.values(validations.password).every(Boolean)
  const isFormValid =
    validations.fullName.minLength &&
    validations.fullName.maxLength &&
    validations.fullName.onlyLetters &&
    validations.email.validFormat &&
    isPasswordValid &&
    validations.confirmPassword.matches &&
    validations.mobile.valid &&
    validations.address.minLength &&
    termsAccepted

  const PasswordRule = ({ valid, text }) => (
    <div className={`flex items-center gap-1.5 text-xs ${valid ? 'text-green-600' : 'text-slate-400'}`}>
      {valid ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {text}
    </div>
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid) {
      toast.error('Please fix all errors before submitting!')
      return
    }
    if (!termsAccepted) {
      toast.error('Please accept Terms & Conditions!')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        mobile: form.mobile,
        address: form.address,
        gstNumber: form.gstNumber
      })
      toast.success('Registration successful! Awaiting admin approval.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex items-center justify-center p-4 pt-24 pb-10">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 text-sm mt-1">Register for SRP Traders</p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-sm text-amber-700">
            ⚠️ New accounts require <strong>admin approval</strong> before you can login.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" name="fullName" required
                  placeholder="Rajesh Kumar"
                  value={form.fullName} onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-all ${
                    form.fullName && (!validations.fullName.minLength || !validations.fullName.onlyLetters)
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
              </div>
              {form.fullName && (
                <div className="mt-1.5 space-y-0.5">
                  <PasswordRule valid={validations.fullName.minLength} text="Minimum 3 characters" />
                  <PasswordRule valid={validations.fullName.maxLength} text="Maximum 50 characters" />
                  <PasswordRule valid={validations.fullName.onlyLetters} text="Only letters and spaces allowed" />
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" name="email" required
                  placeholder="rajesh@gmail.com"
                  value={form.email} onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-all ${
                    form.email && !validations.email.validFormat
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
              </div>
              {form.email && !validations.email.validFormat && (
                <p className="text-xs text-red-500 mt-1">Valid email required (e.g. name@gmail.com)</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="tel" name="mobile" required
                  placeholder="9876543210"
                  maxLength={10}
                  value={form.mobile} onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-all ${
                    form.mobile && !validations.mobile.valid
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
              </div>
              {form.mobile && !validations.mobile.valid && (
                <p className="text-xs text-red-500 mt-1">Valid 10-digit Indian mobile number required</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} name="password" required
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                  value={form.password} onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <PasswordRule valid={validations.password.minLength} text="Min 8 characters" />
                  <PasswordRule valid={validations.password.hasUpper} text="1 uppercase letter (A-Z)" />
                  <PasswordRule valid={validations.password.hasNumber} text="1 number (0-9)" />
                  <PasswordRule valid={validations.password.hasSpecial} text="1 special char (@#$%^&*!)" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" required
                  placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-all ${
                    form.confirmPassword && !validations.confirmPassword.matches
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirmPassword && !validations.confirmPassword.matches && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match!</p>
              )}
              {form.confirmPassword && validations.confirmPassword.matches && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Passwords match!
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea name="address" required
                  placeholder="Shop/House No, Street, Area, City, State - Pincode"
                  value={form.address} onChange={handleChange}
                  rows={2}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-all resize-none ${
                    form.address && !validations.address.minLength
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
              </div>
              {form.address && !validations.address.minLength && (
                <p className="text-xs text-red-500 mt-1">Address must be at least 10 characters</p>
              )}
              <p className="text-xs text-slate-400 mt-1">{form.address.length}/200 characters</p>
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                GST Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" name="gstNumber"
                  placeholder="27XXXXX1234X1ZX"
                  maxLength={15}
                  value={form.gstNumber} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm uppercase"
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-sky-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                  I have read and agree to the{' '}
                  <button type="button"
                    onClick={() => setShowTerms(!showTerms)}
                    className="text-sky-500 font-semibold hover:text-sky-600 underline">
                    Terms & Conditions
                  </button>
                  {' '}and{' '}
                  <button type="button"
                    onClick={() => setShowTerms(!showTerms)}
                    className="text-sky-500 font-semibold hover:text-sky-600 underline">
                    Privacy Policy
                  </button>
                  {' '}of SRP Traders. *
                </label>
              </div>

              {/* Terms Content */}
              {showTerms && (
                <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 max-h-64 overflow-y-auto text-xs text-slate-600 space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm">Terms & Conditions — SRP Traders</h3>
                  <p className="text-slate-400">Last updated: June 2025</p>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">1. Account Registration</h4>
                    <p>By registering on SRP Traders, you confirm that all information provided is accurate, complete, and truthful. False information may result in immediate account termination. Account approval is at the sole discretion of SRP Traders management.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">2. B2B Platform — Business Use Only</h4>
                    <p>SRP Traders is a Business-to-Business (B2B) platform intended for registered businesses, contractors, electricians, and professionals. Reselling purchased products without prior written consent from SRP Traders is prohibited.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">3. Pricing & Orders</h4>
                    <p>All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise. SRP Traders reserves the right to modify prices without prior notice. Orders once placed and confirmed cannot be cancelled without admin approval.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">4. Payment Policy</h4>
                    <p>Online payments are processed securely via Razorpay. Cash on Delivery (COD) is available only on orders above ₹2,000. SRP Traders is not responsible for any payment failures due to bank or network issues.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">5. Delivery Policy</h4>
                    <p>Delivery is available within Mumbai and surrounding areas. Free delivery is provided on orders above ₹2,000. Delivery timelines may vary based on product availability and location. SRP Traders is not liable for delays caused by third-party courier services.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">6. Return & Refund Policy</h4>
                    <p>Products may be returned within 7 days of delivery in original, unused condition with original packaging. Refunds will be processed within 5-7 business days after inspection. Damaged or used products will not be accepted for return.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">7. GST & Invoicing</h4>
                    <p>GST invoices will be provided for all transactions. Customers providing GST numbers are responsible for ensuring their GST registration is valid. SRP Traders GST No: 27XXXXX1234X1ZX.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">8. Privacy Policy</h4>
                    <p>Your personal information (name, email, mobile, address, GST number) is collected solely for order processing and account management. We do not sell or share your data with third parties except for delivery and payment processing purposes.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">9. Account Security</h4>
                    <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility. Report unauthorized access immediately to info@srptraders.in.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">10. Limitation of Liability</h4>
                    <p>SRP Traders shall not be liable for any indirect, incidental, or consequential damages arising from the use of products purchased. Product warranties are governed by the respective manufacturer's terms.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">11. Governing Law</h4>
                    <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-1">12. Contact</h4>
                    <p>For any queries, contact us at: info@srptraders.in | +91 98765 43210 | Shop No. 12, Chembur Market, Mumbai - 400071</p>
                  </div>

                  <button type="button"
                    onClick={() => { setTermsAccepted(true); setShowTerms(false) }}
                    className="w-full py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors mt-2">
                    I Accept These Terms
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-3 font-semibold rounded-xl transition-colors text-sm mt-2 ${
                isFormValid
                  ? 'bg-sky-500 hover:bg-sky-600 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              } disabled:opacity-60`}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>

            {!isFormValid && (
              <p className="text-center text-xs text-slate-400">
                Please fill all required fields correctly and accept Terms & Conditions
              </p>
            )}
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-500 font-semibold hover:text-sky-600">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
