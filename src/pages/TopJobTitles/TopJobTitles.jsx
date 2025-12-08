import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { fetchTopJobTitles } from '@/api/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TopJobTitles() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchTopJobTitles()
      .then(setData)
      .catch(console.error);
  }, []);

  const top30 = data.slice(0, 30);

  const chartData = {
    labels: top30.map(job => job.title),
    datasets: [
      {
        label: 'Job Count',
        data: top30.map(job => job.count),
        backgroundColor: '#4caf50',
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw.toLocaleString()} jobs`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: val => typeof val === 'number' ? val.toLocaleString() : val,
        },
      },
      y: {
        ticks: {
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="container centered-column" style={{ width: '100%' }}>
      <h2>Top 30 Job Titles for the Last Week</h2>
      <div style={{ width: '100%', maxWidth: '1000px', height: '900px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
