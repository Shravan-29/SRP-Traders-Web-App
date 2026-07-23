import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
  name: 'products',
  initialState: { list: [], loading: false, error: null, selected: null },
  reducers: {
    fetchStart: (state) => { state.loading = true },
    fetchSuccess: (state, action) => { state.loading = false; state.list = action.payload },
    fetchFail: (state, action) => { state.loading = false; state.error = action.payload },
    setSelected: (state, action) => { state.selected = action.payload },
  },
})

export const { fetchStart, fetchSuccess, fetchFail, setSelected } = productSlice.actions
export default productSlice.reducer