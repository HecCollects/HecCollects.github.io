const fs = require('fs/promises');

async function loadJSON(path) {
  const data = await fs.readFile(path, 'utf8');
  return JSON.parse(data);
}

function buildNewArrivals(itemsData) {
  const items = Object.values(itemsData).flat().slice(0, 5);
  let html = '<h1>New Arrivals</h1><ul>';
  for (const item of items) {
    const label = item.alt || item.title || 'View item';
    html += `<li><a href="${item.link}">${label}</a></li>`;
  }
  html += '</ul>';
  return { subject: 'New Arrivals', html };
}

function buildRecentSales(soldData) {
  const items = soldData.slice(0, 5);
  let html = '<h1>Recent Sales</h1><ul>';
  for (const item of items) {
    const price = item.price?.value ? ` - $${item.price.value}` : '';
    html += `<li><a href="${item.url}">${item.title}</a>${price}</li>`;
  }
  html += '</ul>';
  return { subject: 'Recent Sales', html };
}

async function sendNewsletter(type = 'new') {
  let payload;
  if (type === 'sales') {
    const sold = await loadJSON('sold-items.json');
    payload = buildRecentSales(sold);
  } else {
    const items = await loadJSON('items.json');
    payload = buildNewArrivals(items);
  }

  const endpoint = process.env.MAILCHIMP_CAMPAIGN_URL;
  const apiKey = process.env.MAILCHIMP_API_KEY;

  if (!endpoint || !apiKey) {
    console.error('Missing Mailchimp configuration; printing email instead.');
    console.log('Subject:', payload.subject);
    console.log(payload.html);
    return;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  console.log('Newsletter sent');
}

const type = process.argv[2] === 'sales' ? 'sales' : 'new';
sendNewsletter(type).catch(err => {
  console.error('Failed to send newsletter', err);
  process.exit(1);
});
