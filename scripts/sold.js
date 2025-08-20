const statusEl = document.getElementById('sold-status');
const tableBody = document.querySelector('#sold-table tbody');
const avgPriceEl = document.getElementById('avg-price');
const monthlySalesEl = document.getElementById('monthly-sales');
const dateFilterEl = document.getElementById('date-filter');
const chartCtx = document.getElementById('sales-chart').getContext('2d');

let allItems = [];
let chart;

function parsePrice(priceStr) {
  return Number(priceStr?.replace(/[^0-9.-]+/g, ''));
}

function formatPlatform(platform) {
  switch ((platform || '').toLowerCase()) {
    case 'ebay':
      return 'eBay';
    case 'tcgplayer':
      return 'TCGplayer';
    default:
      return platform || '';
  }
}

function filterItems(items) {
  const value = dateFilterEl.value;
  if (value === 'all') return items;
  const days = parseInt(value, 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return items.filter(item => {
    const date = item.date ? new Date(item.date) : null;
    return date && !isNaN(date) && date >= cutoff;
  });
}

function renderTable(items) {
  tableBody.innerHTML = '';
  const rows = items.map(item => {
    const tr = document.createElement('tr');

    const itemTd = document.createElement('td');
    const link = document.createElement('a');
    link.href = item.link;
    link.target = '_blank';
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title || '';
      img.loading = 'lazy';
      img.width = 40;
      img.height = 40;
      link.appendChild(img);
    }
    const titleSpan = document.createElement('span');
    titleSpan.textContent = item.title || '';
    link.appendChild(titleSpan);
    itemTd.appendChild(link);

    const priceTd = document.createElement('td');
    priceTd.textContent = item.price || '';

    const dateTd = document.createElement('td');
    const date = item.date ? new Date(item.date) : null;
    dateTd.textContent = date && !isNaN(date) ? date.toLocaleDateString() : '';

    const platformTd = document.createElement('td');
    platformTd.textContent = formatPlatform(item.platform);

    const locationTd = document.createElement('td');
    locationTd.textContent = item.location || '';

    tr.append(itemTd, priceTd, dateTd, platformTd, locationTd);
    return tr;
  });

  rows.forEach(row => tableBody.appendChild(row));
}

function updateSummary(items) {
  if (!items.length) {
    avgPriceEl.textContent = 'Average price: N/A';
    monthlySalesEl.innerHTML = '';
    return;
  }
  const prices = items.map(item => parsePrice(item.price)).filter(n => !isNaN(n));
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  avgPriceEl.textContent = `Average price: $${avg.toFixed(2)}`;

  const monthlyTotals = {};
  items.forEach(item => {
    const date = item.date ? new Date(item.date) : null;
    if (!date || isNaN(date)) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyTotals[key] = (monthlyTotals[key] || 0) + parsePrice(item.price);
  });
  monthlySalesEl.innerHTML = '';
  Object.keys(monthlyTotals).sort().forEach(key => {
    const li = document.createElement('li');
    li.textContent = `${key}: $${monthlyTotals[key].toFixed(2)}`;
    monthlySalesEl.appendChild(li);
  });
}

function updateChart(items) {
  const sorted = items
    .filter(item => item.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sorted.map(item => new Date(item.date).toLocaleDateString());
  const data = sorted.map(item => parsePrice(item.price));

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  } else {
    chart = new Chart(chartCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Sale Price',
            data,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }
}

function render() {
  const filtered = filterItems(allItems);
  renderTable(filtered);
  updateSummary(filtered);
  updateChart(filtered);
}

async function loadSoldItems() {
  statusEl.textContent = 'Loading...';
  try {
    const res = await fetch('sold-items.json');
    if (!res.ok) throw new Error('Network response was not ok');
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      statusEl.textContent = 'No sold items found.';
      return;
    }

    allItems = items.map(item => ({
      title: item.title || '',
      image: item.image || '',
      link: item.link || item.url || '',
      price:
        item.price && typeof item.price === 'object'
          ? `${item.price.currency || ''} ${item.price.value}`.trim()
          : item.price || '',
      date: item.date || '',
      location: item.location || '',
      platform: item.platform || ''
    }));
    statusEl.textContent = '';
    render();
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Failed to load sold items.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  dateFilterEl.value = '90';
  loadSoldItems();
  dateFilterEl.addEventListener('change', render);
});
