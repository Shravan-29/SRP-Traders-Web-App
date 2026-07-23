// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useDispatch, useSelector } from 'react-redux'
// import { loginStart, loginSuccess, loginFail } from '../redux/slices/authSlice'
// import api from '../services/api'
// import toast from 'react-hot-toast'
// import { Eye, EyeOff, Package, Lock, Mail } from 'lucide-react'

// const Login = () => {
//   const [form, setForm] = useState({ email: '', password: '' })
//   const [showPass, setShowPass] = useState(false)
//   const { isLoading } = useSelector((s) => s.auth)
//   const dispatch = useDispatch()
//   const navigate = useNavigate()

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     dispatch(loginStart())
//     try {
//       const { data } = await api.post('/auth/login', form)
//       dispatch(loginSuccess(data))
//       toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`)
//       navigate(data.user.role === 'ADMIN' ? '/admin' : '/')
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Login failed'
//       dispatch(loginFail(msg))
//       toast.error(msg)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex items-center justify-center p-4 pt-20">
//       <div className="w-full max-w-md">
//         <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
//           <div className="text-center mb-8">
//             <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
//               <Package className="w-7 h-7 text-white" />
//             </div>
//             <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
//             <p className="text-slate-500 text-sm mt-1">Sign in to SRP Traders</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//                 <input type="email" required placeholder="your@email.com"
//                   value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
//                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm transition-all"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//                 <input type={showPass ? 'text' : 'password'} required placeholder="Enter your password"
//                   value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
//                   className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm transition-all"
//                 />
//                 <button type="button" onClick={() => setShowPass(!showPass)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
//                   {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                 </button>
//               </div>
//             </div>

//             <div className="flex justify-end">
//               <Link to="/forgot-password" className="text-sm text-sky-500 hover:text-sky-600">
//                 Forgot password?
//               </Link>
//             </div>

//             <button type="submit" disabled={isLoading}
//               className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
//               {isLoading ? 'Signing in...' : 'Sign In'}
//             </button>
//           </form>

//           <p className="text-center text-sm text-slate-500 mt-6">
//             Don't have an account?{' '}
//             <Link to="/register" className="text-sky-500 font-semibold hover:text-sky-600">Register here</Link>
//           </p>
//         </div>
//         <p className="text-center text-xs text-slate-400 mt-4">
//           New accounts require admin approval before login.
//         </p>
//       </div>
//     </div>
//   )
// }

// export default Login

//new code 

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginStart, loginSuccess, loginFail } from '../redux/slices/authSlice'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const { isLoading } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    dispatch(loginStart())
    try {
      const { data } = await api.post('/auth/login', form)
      dispatch(loginSuccess(data))
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`)
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password!'
      dispatch(loginFail(msg))
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <img src="/logo.png" alt="SRP Traders" className="h-20 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to SRP Traders</p>
          </div>

          {/* Error Box */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email" required
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setError('') }}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'} required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setError('') }}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50'
                      : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                  }`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password — right corner */}
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs text-sky-500 hover:text-sky-600 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-500 font-semibold hover:text-sky-600">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          New accounts require admin approval before login.
        </p>
      </div>
    </div>
  )
}

export default Login