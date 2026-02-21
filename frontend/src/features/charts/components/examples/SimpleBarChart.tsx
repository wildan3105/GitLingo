/**
 * Simple Bar Chart Example
 * Used to verify Chart.js setup is working correctly
 */

import { Bar } from 'react-chartjs-2'
import { barChartOptions } from '../../config/chartDefaults'

/**
 * Simple bar chart example to verify Chart.js integration
 * This component can be removed once real chart components are implemented
 */
export function SimpleBarChart() {
  const data = {
    labels: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust'],
    datasets: [
      {
        label: 'Repositories',
        data: [12, 19, 8, 5, 3],
        backgroundColor: [
          '#f1e05a', // JavaScript yellow
          '#3178c6', // TypeScript blue
          '#3572A5', // Python blue
          '#00ADD8', // Go cyan
          '#dea584', // Rust orange
        ],
      },
    ],
  }

  return (
    <div className="h-96 w-full">
      <Bar data={data} options={barChartOptions} />
    </div>
  )
}
