import { createSlice } from '@reduxjs/toolkit'

const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => { state.isLoading = true; state.error = null },
    loginSuccess: (state, action) => {
      state.isLoading = false
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      localStorage.setItem('token', action.payload.token)
    },
    loginFail: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    logout: (state) => {
  state.user = null
  state.token = null
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  localStorage.removeItem('cart')
  localStorage.removeItem('wishlist')
},
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },
})

export const { loginStart, loginSuccess, loginFail, logout, updateUser } = authSlice.actions
export default authSlice.reducer