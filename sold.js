import Chart from 'https://cdn.jsdelivr.net/npm/chart.js/auto';

const statusEl = document.getElementById('sold-status');
const tableBody = document.querySelector('#sold-table tbody');
const table = document.getElementById('sold-table');
const ctx = document.getElementById('price-chart');

let chart;

function renderData(data) {
  tableBody.innerHTML = '';

  const labels = [];
  const prices = [];

  data.forEach(item => {
    const tr = document.createElement('tr');

    const titleTd = document.createElement('td');
    titleTd.textContent = item.title || '';

    const dateTd = document.createElement('td');
    const date = item.date ? new Date(item.date) : null;
    dateTd.textContent = date && !isNaN(date) ? date.toLocaleDateString() : '';

    const priceTd = document.createElement('td');
    const priceVal = item.price?.value ?? 0;
    const currency = item.price?.currency || 'USD';
    priceTd.textContent = priceVal.toLocaleString(undefined, {
      style: 'currency',
      currency
    });

    tr.append(titleTd, dateTd, priceTd);
    tableBody.appendChild(tr);

    labels.push(dateTd.textContent);
    prices.push(priceVal);
  });

  if (!chart) {
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Sold Price',
          data: prices,
          borderColor: '#f28c2f',
          backgroundColor: 'rgba(242, 140, 47, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#fff' } },
          y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#fff' } }
        }
      }
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = prices;
    chart.update();
  }
}

async function loadSold() {
  statusEl.textContent = 'Loading...';
  table.style.display = 'none';
  ctx.style.display = 'none';

  try {
    const res = await fetch('sold-items.json');
    if (!res.ok) throw new Error('Request failed');
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      statusEl.textContent = 'No sold items found.';
      return;
    }

    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    statusEl.textContent = '';
    table.style.display = '';
    ctx.style.display = '';
    renderData(data);
  } catch (err) {
    statusEl.textContent = 'Failed to load sold items.';
  }
}

loadSold();

