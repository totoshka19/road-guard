import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/** Доступные скорости воспроизведения потока. */
export type PlaybackSpeed = 1 | 2 | 5
export const PLAYBACK_SPEEDS: readonly PlaybackSpeed[] = [1, 2, 5]

export interface PlaybackState {
  /** Идёт ли поток новых событий. */
  playing: boolean
  /** Множитель темпа эмиссии мок-потока. */
  speed: PlaybackSpeed
}

const initialState: PlaybackState = {
  playing: true,
  speed: 1,
}

const playbackSlice = createSlice({
  name: 'playback',
  initialState,
  reducers: {
    setPlaying(state, action: PayloadAction<boolean>) {
      state.playing = action.payload
    },
    togglePlaying(state) {
      state.playing = !state.playing
    },
    setSpeed(state, action: PayloadAction<PlaybackSpeed>) {
      state.speed = action.payload
    },
  },
})

export const { setPlaying, togglePlaying, setSpeed } = playbackSlice.actions
export default playbackSlice.reducer
