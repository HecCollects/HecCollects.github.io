const statusEl = document.getElementById('sold-status');
const tableBody = document.querySelector('#sold-table tbody');
const avgPriceEl = document.getElementById('avg-price');
const monthlySalesEl = document.getElementById('monthly-sales');
const dateFilterEl = document.getElementById('date-filter');
const platformFilterEl = document.getElementById('platform-filter');
const chartCanvas = document.getElementById('sales-chart');
const pricePointsEl = document.getElementById('price-points');
const conditionComparisonEl = document.getElementById('condition-comparison');
const searchEl = document.getElementById('sold-search');
const tableHeaders = document.querySelectorAll('#sold-table thead th');
const snapshotEl = document.getElementById('three-month-snapshot');
const tableEl = document.getElementById('sold-table');
const skeletonChart = document.querySelector('.skeleton-chart');
const skeletonTable = document.querySelector('.skeleton-table');
const suggestionsEl = document.getElementById('sold-suggestions');
let chartCtx;
let rangeButtons;
if (chartCanvas) {
  chartCanvas.height = 300;
  chartCtx = chartCanvas.getContext('2d');
  rangeButtons = document.querySelectorAll('.range-buttons button');
  rangeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const range = btn.id.replace('range-', '');
      filterByRange(range);
    });
  });
}

let sortKey = null;
let sortAsc = true;

const sortFields = ['title', 'price', 'date', 'platform', 'location'];

function debounce(fn, delay) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), delay);
  };
}

tableHeaders.forEach((th, idx) => {
  th.style.cursor = 'pointer';
  th.setAttribute('aria-sort', 'none');
  th.addEventListener('click', () => {
    const key = sortFields[idx];
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
    render();
  });
});

const debouncedRender = debounce(render, 250);
if (searchEl) {
  searchEl.addEventListener('input', debouncedRender);
}

let allItems = [];
let chart;
let currentRange = '3m';

function parsePrice(price) {
  if (price && typeof price === 'object') {
    return Number(price.value);
  }
  return Number(String(price || '').replace(/[^0-9.-]+/g, ''));
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

function populatePlatformFilter(items) {
  const prev = platformFilterEl.value;
  const platforms = Array.from(
    new Set(items.map(i => (i.platform || '').toLowerCase()).filter(Boolean))
  ).sort();
  platformFilterEl.innerHTML = '<option value="">All Platforms</option>';
  platforms.forEach(p => {
    const option = document.createElement('option');
    option.value = p;
    option.textContent = formatPlatform(p);
    platformFilterEl.appendChild(option);
  });
  if (platforms.includes(prev)) {
    platformFilterEl.value = prev;
  }
}

function populateSearchSuggestions(items) {
  const titles = Array.from(new Set(items.map(i => i.title).filter(Boolean)));
  suggestionsEl.innerHTML = '';
  titles.forEach(title => {
    const option = document.createElement('option');
    option.value = title;
    suggestionsEl.appendChild(option);
  });
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

function applyFilters(items) {
  let filtered = filterItems(items);
  const query = searchEl.value.trim().toLowerCase();
  const platform = platformFilterEl.value;
  if (query) {
    filtered = filtered.filter(item => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.platform.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    });
  }
  if (platform) {
    filtered = filtered.filter(
      item => (item.platform || '').toLowerCase() === platform
    );
  }
  if (sortKey) {
    filtered.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === 'price') {
        aVal = parsePrice(aVal);
        bVal = parsePrice(bVal);
      } else if (sortKey === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }
  return filtered;
}

function updateSortIndicators() {
  tableHeaders.forEach((th, idx) => {
    const key = sortFields[idx];
    const state = key === sortKey ? (sortAsc ? 'ascending' : 'descending') : 'none';
    th.setAttribute('aria-sort', state);
  });
}

function filterByRange(range) {
  currentRange = range;
  render();
}

function renderTable(items) {
  tableBody.innerHTML = '';
  const rows = items.map(item => {
    const tr = document.createElement('tr');

    const itemTd = document.createElement('td');
    const content = item.link ? document.createElement('a') : document.createElement('span');
    if (item.link) {
      content.href = item.link;
      content.target = '_blank';
      content.rel = 'noopener noreferrer';
    }
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title || '';
      img.loading = 'lazy';
      img.width = 40;
      img.height = 40;
      content.appendChild(img);
    }
    const titleSpan = document.createElement('span');
    titleSpan.textContent = item.title || '';
    content.appendChild(titleSpan);
    itemTd.appendChild(content);

    const priceTd = document.createElement('td');
    priceTd.textContent = item.price || '';

    const dateTd = document.createElement('td');
    const date = item.date ? new Date(item.date) : null;
    dateTd.textContent =
      date && !isNaN(date)
        ? date.toLocaleDateString('en-US', { timeZone: 'UTC' })
        : '';

    const platformTd = document.createElement('td');
    platformTd.textContent = formatPlatform(item.platform);

    const locationTd = document.createElement('td');
    locationTd.textContent = item.location || '';

    tr.append(itemTd, priceTd, dateTd, platformTd, locationTd);
    return tr;
  });

  rows.forEach(row => tableBody.appendChild(row));
}

function updateConditionComparison(items) {
  conditionComparisonEl.innerHTML = '';
  const groups = {};
  items.forEach(item => {
    if (!item.condition) return;
    const price = parsePrice(item.price);
    if (isNaN(price)) return;
    if (!groups[item.condition]) groups[item.condition] = [];
    groups[item.condition].push(price);
  });
  const conditions = new Set(Object.keys(groups));
  conditions.add('Near Mint');
  Array.from(conditions)
    .sort()
    .forEach(cond => {
      const prices = groups[cond] || [];
      const avg = prices.length
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : null;
      const card = document.createElement('div');
      card.className = 'condition-card';
      const h3 = document.createElement('h3');
      h3.textContent = cond;
      const val = document.createElement('p');
      val.textContent = avg != null ? `$${avg.toFixed(2)}` : 'N/A';
      card.append(h3, val);
      conditionComparisonEl.appendChild(card);
    });
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
    const monthKey = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      1
    );
    monthlyTotals[monthKey] =
      (monthlyTotals[monthKey] || 0) + parsePrice(item.price);
  });
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
  monthlySalesEl.innerHTML = '';
  Object.keys(monthlyTotals)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach(key => {
      const li = document.createElement('li');
      li.textContent = `${formatter.format(new Date(Number(key)))}: $${
        monthlyTotals[key].toFixed(2)
      }`;
      monthlySalesEl.appendChild(li);
    });
}

function updateChart(items) {
  if (!chartCtx) return;
  const sorted = items
    .filter(item => item.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sorted.map(item =>
    new Date(item.date).toLocaleDateString('en-US', { timeZone: 'UTC' })
  );
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
      },
      height: 300
    });
  }
}

function updatePricePoints(items, listings = [], quantity = null, sellers = null) {
  if (!pricePointsEl) return;

  pricePointsEl.innerHTML = '';
  if (!items.length) return;

  const sorted = items
    .filter(it => it.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const prices = sorted.map(it => parsePrice(it.price)).filter(n => !isNaN(n));

  const lastTen = prices.slice(0, 10);
  const market = lastTen.length
    ? lastTen.reduce((a, b) => a + b, 0) / lastTen.length
    : null;
  const recent = prices.length ? prices[0] : null;

  let listingPrices = Array.isArray(listings)
    ? listings
        .map(l =>
          parsePrice(l.price || l.currentPrice || l.listingPrice)
        )
        .filter(n => !isNaN(n))
    : [];
  let listedMedian = null;
  if (listingPrices.length) {
    listingPrices.sort((a, b) => a - b);
    const mid = Math.floor(listingPrices.length / 2);
    listedMedian =
      listingPrices.length % 2
        ? listingPrices[mid]
        : (listingPrices[mid - 1] + listingPrices[mid]) / 2;
  }

  let qty = quantity;
  if (qty == null && Array.isArray(listings)) {
    qty = listings.reduce(
      (sum, l) =>
        sum +
        Number(
          l.quantity ??
            l.quantityAvailable ??
            l.currentQuantity ??
            l.quantitySold ??
            0
        ),
      0
    );
  }

  let sellerCount = sellers;
  if (sellerCount == null && Array.isArray(listings)) {
    const set = new Set();
    listings.forEach(l => {
      if (l.sellerId) set.add(l.sellerId);
      else if (l.seller) set.add(l.seller);
      else if (l.sellerName) set.add(l.sellerName);
    });
    sellerCount = set.size || listings.length;
  }

  const points = [
    { label: 'Market Price', value: market ? `$${market.toFixed(2)}` : 'N/A' },
    { label: 'Most Recent Sale', value: recent ? `$${recent.toFixed(2)}` : 'N/A' },
    {
      label: 'Listed Median',
      value: listedMedian ? `$${listedMedian.toFixed(2)}` : 'N/A'
    },
    {
      label: 'Quantity Available',
      value: qty != null && !isNaN(qty) ? String(qty) : 'N/A'
    },
    {
      label: 'Seller Count',
      value: sellerCount != null && !isNaN(sellerCount)
        ? String(sellerCount)
        : 'N/A'
    }
  ];

  points.forEach(p => {
    const card = document.createElement('div');
    card.className = 'price-card';
    const h3 = document.createElement('h3');
    h3.textContent = p.label;
    const val = document.createElement('p');
    val.textContent = p.value;
    card.append(h3, val);
    pricePointsEl.appendChild(card);
  });
}

function updateSnapshot(items) {
  if (!snapshotEl) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const recent = items.filter(item => {
    const date = item.date ? new Date(item.date) : null;
    return date && !isNaN(date) && date >= cutoff;
  });

  const prices = recent
    .map(item => parsePrice(item.price))
    .filter(n => !isNaN(n));

  const low = prices.length ? Math.min(...prices) : null;
  const high = prices.length ? Math.max(...prices) : null;
  const total = recent.length;

  snapshotEl.innerHTML = '';
  const metrics = [
    { label: 'Low Price', value: low != null ? `$${low.toFixed(2)}` : 'N/A' },
    {
      label: 'High Sale Price',
      value: high != null ? `$${high.toFixed(2)}` : 'N/A'
    },
    { label: 'Total Sold', value: String(total) }
  ];

  metrics.forEach(m => {
    const card = document.createElement('div');
    card.className = 'snapshot-card';
    const h3 = document.createElement('h3');
    h3.textContent = m.label;
    const p = document.createElement('p');
    p.textContent = m.value;
    card.append(h3, p);
    snapshotEl.appendChild(card);
  });
}

function render() {
  populatePlatformFilter(allItems);
  let filtered = applyFilters(allItems.slice());
  const daysMap = { '1m': 30, '3m': 90, '6m': 180, '1y': 365 };
  const days = daysMap[currentRange] || 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  filtered = filtered.filter(item => {
    const date = item.date ? new Date(item.date) : null;
    return date && !isNaN(date) && date >= cutoff;
  });
  renderTable(filtered);
  updateSummary(filtered);
  updateConditionComparison(filtered);
  updateChart(filtered);
  updateSortIndicators();
  if (rangeButtons) {
    rangeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.id === `range-${currentRange}`);
    });
  }
}

async function loadSoldItems() {
  statusEl.textContent = 'Loading...';
  try {
    const res = await fetch('sold-items.json');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();

    let items = [];
    let listings = [];
    let qty = null;
    let sellerCount = null;

    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      items = Array.isArray(data.items) ? data.items : Array.isArray(data.sold) ? data.sold : [];
      listings = Array.isArray(data.listings) ? data.listings : [];
      qty = data.currentQuantity ?? data.quantity ?? null;
      sellerCount = data.sellerCount ?? null;
    }

    if (!items.length) {
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
      platform: item.platform || '',
      condition: item.condition || ''
    }));
    populateSearchSuggestions(allItems);
    statusEl.textContent = '';
    skeletonChart?.classList.add('hidden');
    skeletonTable?.classList.add('hidden');
    chartCanvas?.classList.remove('hidden');
    tableEl.classList.remove('hidden');
    filterByRange('3m');
    updatePricePoints(allItems, listings, qty, sellerCount);
    updateSnapshot(allItems);
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Failed to load sold items.';
    skeletonChart?.classList.add('hidden');
    skeletonTable?.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  dateFilterEl.value = '90';
  loadSoldItems();
  dateFilterEl.addEventListener('change', render);
  platformFilterEl.addEventListener('change', render);
});
