const statusEl = document.getElementById('sold-status');
const tableBody = document.querySelector('#sold-table tbody');

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

      const locationTd = document.createElement('td');
      locationTd.textContent = item.location || '';

      tr.append(itemTd, priceTd, dateTd, locationTd);
      return tr;
    });

    rows.forEach(row => tableBody.appendChild(row));
    statusEl.textContent = '';
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Failed to load sold items.';
  }
}

document.addEventListener('DOMContentLoaded', loadSoldItems);
