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

async function sendNewsletter() {
  const items = await loadJSON('items.json');
  const payload = buildNewArrivals(items);

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

sendNewsletter().catch(err => {
  console.error('Failed to send newsletter', err);
  process.exit(1);
});
