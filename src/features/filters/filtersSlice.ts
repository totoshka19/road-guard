import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ActiveFilters, TimeWindow } from '../../lib/filters'
import type { ViolationType } from '../../data/types'

export type FiltersState = ActiveFilters

const initialState: FiltersState = {
  types: [],
  districts: [],
  window: 'all',
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    toggleType(state, action: PayloadAction<ViolationType>) {
      state.types = toggle(state.types, action.payload)
    },
    toggleDistrict(state, action: PayloadAction<string>) {
      state.districts = toggle(state.districts, action.payload)
    },
    setWindow(state, action: PayloadAction<TimeWindow>) {
      state.window = action.payload
    },
    resetFilters() {
      return initialState
    },
  },
})

export const { toggleType, toggleDistrict, setWindow, resetFilters } =
  filtersSlice.actions
export default filtersSlice.reducer
