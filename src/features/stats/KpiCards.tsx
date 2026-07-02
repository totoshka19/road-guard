import { useAppSelector } from '../../app/hooks'
import { selectKpis } from './selectors'

export function KpiCards() {
  const kpis = useAppSelector(selectKpis)

  return (
    <div className="kpis">
      <div className="kpi">
        <span className="kpi__value">{kpis.total}</span>
        <span className="kpi__label">событий в выборке</span>
      </div>
      <div className="kpi">
        <span className="kpi__value">
          {kpis.activeCameras}
          <span className="kpi__sub">/{kpis.totalCameras}</span>
        </span>
        <span className="kpi__label">активных камер</span>
      </div>
      <div className="kpi">
        {kpis.topType ? (
          <span className="kpi__value kpi__value--type">
            <span
              className="kpi__dot"
              style={{ background: kpis.topType.color }}
              aria-hidden
            />
            {kpis.topType.count}
          </span>
        ) : (
          <span className="kpi__value">—</span>
        )}
        <span className="kpi__label">
          {kpis.topType ? kpis.topType.label : 'частый тип'}
        </span>
      </div>
    </div>
  )
}
