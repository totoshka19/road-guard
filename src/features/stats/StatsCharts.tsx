import { Bar, Doughnut, Line } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'
import { useAppSelector } from '../../app/hooks'
import { CHART_ACCENT, CHART_ACCENT_FILL } from '../../lib/chartSetup'
import {
  selectCountByDistrict,
  selectCountByType,
  selectTimeSeries,
} from './selectors'

function TypeDoughnut() {
  const byType = useAppSelector(selectCountByType)
  const data: ChartData<'doughnut'> = {
    labels: byType.map((t) => t.label),
    datasets: [
      {
        data: byType.map((t) => t.count),
        backgroundColor: byType.map((t) => t.color),
        borderWidth: 0,
      },
    ],
  }
  const options: ChartOptions<'doughnut'> = {
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 9, boxHeight: 9, font: { size: 10 }, padding: 8 },
      },
    },
  }
  return <Doughnut data={data} options={options} />
}

function DistrictBar() {
  const byDistrict = useAppSelector(selectCountByDistrict)
  const data: ChartData<'bar'> = {
    labels: byDistrict.map((d) => d.district),
    datasets: [
      {
        data: byDistrict.map((d) => d.count),
        backgroundColor: CHART_ACCENT,
        borderRadius: 4,
        barThickness: 12,
      },
    ],
  }
  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
      y: { ticks: { font: { size: 10 } } },
    },
  }
  return <Bar data={data} options={options} />
}

function TimelineChart() {
  const series = useAppSelector(selectTimeSeries)
  const data: ChartData<'line'> = {
    labels: series.map((b) =>
      new Date(b.from).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    ),
    datasets: [
      {
        data: series.map((b) => b.count),
        borderColor: CHART_ACCENT,
        backgroundColor: CHART_ACCENT_FILL,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }
  const options: ChartOptions<'line'> = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
      x: { ticks: { maxTicksLimit: 6, font: { size: 9 } } },
    },
  }
  return <Line data={data} options={options} />
}

export function StatsCharts() {
  return (
    <div className="charts">
      <section className="chart-card">
        <h3 className="chart-card__title">По типам</h3>
        <div className="chart-card__canvas">
          <TypeDoughnut />
        </div>
      </section>
      <section className="chart-card">
        <h3 className="chart-card__title">По районам</h3>
        <div className="chart-card__canvas">
          <DistrictBar />
        </div>
      </section>
      <section className="chart-card">
        <h3 className="chart-card__title">Динамика · 30 мин</h3>
        <div className="chart-card__canvas">
          <TimelineChart />
        </div>
      </section>
    </div>
  )
}
