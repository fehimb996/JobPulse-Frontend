import { useEffect, useState, useRef } from 'react';
import * as Chart from 'chart.js';
import { fetchTopCompanies } from '@/api/api';

Chart.Chart.register(
  Chart.ArcElement,
  Chart.Tooltip,
  Chart.Legend,
  Chart.PieController,
  Chart.Title
);

const countryOrder = ['US', 'DE', 'GB', 'NL', 'BE', 'AT', 'CH'];

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042',
  '#8dd1e1', '#a4de6c', '#d0ed57', '#d88884',
  '#d0bfff', '#ffb3ba'
];

const countryNames = {
  US: 'USA',
  DE: 'Germany',
  GB: 'United Kingdom',
  NL: 'Netherlands',
  BE: 'Belgium',
  AT: 'Austria',
  CH: 'Switzerland'
};

const getFlagEmoji = (code) =>
  code
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');

export default function TopCompanies() {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // whenever country changes, fetch
  useEffect(() => {
    fetchTopCompanies(selectedCountry)
      .then(fetched => setData(fetched))
      .catch(console.error);
  }, [selectedCountry]);

  // redraw chart on data update
  useEffect(() => {
    if (!data.length) return;

    const companies = data.filter(d => d.country === selectedCountry);
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current?.destroy();

    chartInstance.current = new Chart.Chart(ctx, {
      type: 'pie',
      data: {
        labels: companies.map(c => c.company),
        datasets: [{
          data: companies.map(c => c.jobCount),
          backgroundColor: COLORS.slice(0, companies.length),
          borderColor: '#ffffff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ${ctx.parsed} jobs`
            }
          }
        }
      }
    });
  }, [data, selectedCountry]);

  return (
    <div className="container centered-column">
      <h2>Top 10 Companies by Job Count for the Last Week</h2>

      <div style={{ margin: '1.5rem 0' }}>
        <label htmlFor="country-select" style={{ marginRight: '0.5rem' }}>
          Select Country:
        </label>
        <select
          id="country-select"
          value={selectedCountry}
          onChange={e => setSelectedCountry(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        >
          {countryOrder.map(code => (
            <option key={code} value={code}>
              {getFlagEmoji(code)} {countryNames[code]}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          background: '#1e1e1e',
          borderRadius: '8px',
          padding: '2.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          maxWidth: '1000px',
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          gap: '2rem',
        }}
      >
        {/* Pie Chart */}
        <div style={{ width: 400, height: 400 }}>
          <canvas ref={chartRef} width={400} height={400} />
        </div>

        {/* Company List */}
        <div style={{ width: '100%', maxWidth: 400 }}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {data
              .filter(c => c.country === selectedCountry)
              .map((c, idx) => (
                <li
                  key={idx}
                  style={{
                    color: COLORS[idx % COLORS.length],
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 500
                  }}
                >
                  <span>{c.company}</span>
                  <span>{c.jobCount}</span>
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    </div>
  );
}
