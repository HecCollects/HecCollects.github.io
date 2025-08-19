import Chart from 'https://cdn.jsdelivr.net/npm/chart.js/auto';

const soldHistory = [
  { date: '2024-01', price: 110 },
  { date: '2024-02', price: 115 },
  { date: '2024-03', price: 107 },
  { date: '2024-04', price: 120 },
  { date: '2024-05', price: 125 },
  { date: '2024-06', price: 119 }
];

const ctx = document.getElementById('price-chart');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: soldHistory.map(p => p.date),
    datasets: [{
      label: 'Sold Price',
      data: soldHistory.map(p => p.price),
      borderColor: '#f28c2f',
      backgroundColor: 'rgba(242, 140, 47, 0.2)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 0
    }]
  },
  options: {
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#fff' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#fff' }
      }
    }
  }
});
