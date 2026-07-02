import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux'
import type { AppDispatch, RootState } from './store'

/** Типизированные обёртки над хуками react-redux. */
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
