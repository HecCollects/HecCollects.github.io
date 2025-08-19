const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'sold-items.json');

const SEARCH_TERM = process.env.SOLD_SEARCH_TERM || 'collectible';
const LIMIT = parseInt(process.env.SOLD_LIMIT || '10', 10);

async function fetchEbaySold() {
  const appId = process.env.EBAY_APP_ID;
  if (!appId) {
    console.warn('EBAY_APP_ID not set; skipping eBay sold fetch');
    return [];
  }

  const params = new URLSearchParams({
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.13.0',
    'SECURITY-APPNAME': appId,
    'RESPONSE-DATA-FORMAT': 'JSON',
    'REST-PAYLOAD': 'true',
    keywords: SEARCH_TERM,
    'paginationInput.entriesPerPage': String(LIMIT),
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true'
  });

  const url = `https://svcs.ebay.com/services/search/FindingService/v1?${params}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('eBay sold request failed', res.status);
      return [];
    }
    const json = await res.json();
    const items = json?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];
    return items.slice(0, LIMIT).map(item => ({
      title: item.title?.[0] || '',
      price: {
        value: Number(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || 0),
        currency: item.sellingStatus?.[0]?.currentPrice?.[0]?.['@currencyId'] || ''
      },
      date: item.listingInfo?.[0]?.endTime?.[0] || '',
      location: item.location?.[0] || '',
      url: item.viewItemURL?.[0] || '',
      image: item.galleryURL?.[0] || ''
    }));
  } catch (err) {
    console.warn('eBay sold fetch error', err);
    return [];
  }
}

async function main() {
  const sold = await fetchEbaySold();
  await fs.writeFile(OUTPUT, JSON.stringify(sold, null, 2));
  console.log(`Wrote ${OUTPUT}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
