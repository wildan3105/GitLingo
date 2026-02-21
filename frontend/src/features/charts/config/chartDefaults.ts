/**
 * Chart.js Default Configuration
 * Global defaults for all charts in the application
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

/**
 * Common chart options (not exported, used as base for specific chart types)
 */
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        padding: 16,
        usePointStyle: true,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 4,
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart' as const,
  },
}

/**
 * Options specific to Bar charts
 */
export const barChartOptions: ChartOptions<'bar'> = {
  ...baseOptions,
  indexAxis: 'y', // Horizontal bars
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 12,
        },
      },
    },
    y: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 12,
        },
      },
    },
  },
} as ChartOptions<'bar'>

/**
 * Options specific to Pie charts
 */
export const pieChartOptions: ChartOptions<'pie'> = {
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    legend: {
      ...baseOptions.plugins.legend,
      position: 'right',
    },
  },
} as ChartOptions<'pie'>

/**
 * Options specific to Polar Area charts
 */
export const polarAreaChartOptions: ChartOptions<'polarArea'> = {
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    legend: {
      ...baseOptions.plugins.legend,
      position: 'right',
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 11,
        },
        backdropColor: 'transparent',
      },
    },
  },
} as ChartOptions<'polarArea'>
