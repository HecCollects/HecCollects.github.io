const statusEl = document.getElementById('sold-status');
const tableBody = document.querySelector('#sold-table tbody');
const priceHeader = document.getElementById('price-header');
const dateHeader = document.getElementById('date-header');
const headers = { price: priceHeader, date: dateHeader };

let soldItems = [];
const sortState = { price: -1, date: -1 };

function render(items) {
  tableBody.innerHTML = '';
  items.forEach(item => {
    const tr = document.createElement('tr');

    const itemTd = document.createElement('td');
    itemTd.textContent = item.title || '';

    const priceTd = document.createElement('td');
    const priceVal = item.price?.value ?? 0;
    const currency = item.price?.currency || 'USD';
    priceTd.textContent = priceVal.toLocaleString(undefined, {
      style: 'currency',
      currency
    });

    const dateTd = document.createElement('td');
    const date = item.date ? new Date(item.date) : null;
    dateTd.textContent = date && !isNaN(date) ? date.toLocaleDateString() : '';

    const locationTd = document.createElement('td');
    locationTd.textContent = item.location || '';

    tr.append(itemTd, priceTd, dateTd, locationTd);
    tableBody.appendChild(tr);
  });
}

function sortBy(key) {
  sortState[key] *= -1;
  const dir = sortState[key];
  if (key === 'price') {
    soldItems.sort((a, b) => ((a.price?.value ?? 0) - (b.price?.value ?? 0)) * dir);
  } else if (key === 'date') {
    soldItems.sort((a, b) => (new Date(a.date) - new Date(b.date)) * dir);
  }
  Object.values(headers).forEach(h => h.removeAttribute('aria-sort'));
  headers[key].setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');
  render(soldItems);
}

async function loadSold() {
  statusEl.textContent = 'Loading...';
  try {
    const res = await fetch('sold-items.json');
    if (!res.ok) throw new Error('Request failed');
    const data = await res.json();
    soldItems = Array.isArray(data) ? data : [];
    if (soldItems.length === 0) {
      statusEl.textContent = 'No sold items found.';
      return;
    }
    statusEl.textContent = '';
    soldItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    render(soldItems);
    dateHeader.setAttribute('aria-sort', 'descending');
  } catch (err) {
    statusEl.textContent = 'Failed to load sold items.';
  }
}

priceHeader.addEventListener('click', () => sortBy('price'));
dateHeader.addEventListener('click', () => sortBy('date'));

loadSold();

