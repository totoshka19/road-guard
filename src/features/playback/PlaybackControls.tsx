import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { PLAYBACK_SPEEDS, setSpeed, togglePlaying } from './playbackSlice'

export function PlaybackControls() {
  const dispatch = useAppDispatch()
  const playing = useAppSelector((s) => s.playback.playing)
  const speed = useAppSelector((s) => s.playback.speed)

  return (
    <div className="playback">
      <button
        type="button"
        className="playback__toggle"
        onClick={() => dispatch(togglePlaying())}
        aria-pressed={playing}
      >
        <span className="playback__icon" aria-hidden>
          {playing ? '❚❚' : '▶'}
        </span>
        {playing ? 'Пауза' : 'Продолжить'}
      </button>

      <div
        className="playback__speeds"
        role="group"
        aria-label="Скорость потока"
      >
        {PLAYBACK_SPEEDS.map((value) => (
          <button
            key={value}
            type="button"
            className={
              value === speed
                ? 'playback__speed playback__speed--active'
                : 'playback__speed'
            }
            onClick={() => dispatch(setSpeed(value))}
            aria-pressed={value === speed}
          >
            {value}×
          </button>
        ))}
      </div>
    </div>
  )
}
