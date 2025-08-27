const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'items.json');

const SEARCH_TERM = process.env.SEARCH_TERM || 'collectible';
const LIMIT = parseInt(process.env.ITEM_LIMIT || '3', 10);

function addUtm(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'site');
    u.searchParams.set('utm_medium', 'referral');
    return u.toString();
  } catch {
    return url;
  }
}

async function fetchEbay() {
  const appId = process.env.EBAY_APP_ID;
  if (!appId) {
    console.warn('EBAY_APP_ID not set; skipping eBay fetch');
    return [];
  }
  const url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SECURITY-APPNAME=${appId}&RESPONSE-DATA-FORMAT=JSON&keywords=${encodeURIComponent(SEARCH_TERM)}&paginationInput.entriesPerPage=${LIMIT}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn('eBay request failed', res.status);
    return [];
  }
  const json = await res.json();
  const items = json?.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item || [];
  return items.slice(0, LIMIT).map(item => ({
    image: item.galleryURL?.[0],
    link: addUtm(item.viewItemURL?.[0]),
    alt: item.title?.[0],
    badge: item.condition?.[0]?.conditionDisplayName?.[0] || '',
    stock: Number(item.sellingStatus?.[0]?.quantity || 1)
  }));
}

async function fetchOfferUp() {
  const url = `https://api.offerup.com/api/webapi/browse/search/?search=${encodeURIComponent(SEARCH_TERM)}&limit=${LIMIT}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('OfferUp request failed', res.status);
      return [];
    }
    const json = await res.json();
    const items = json?.data?.items || json?.response?.sections?.[0]?.items || [];
    return items.slice(0, LIMIT).map(it => ({
      image: it?.images?.[0]?.images?.[0]?.url || it?.image?.url || it?.picture?.url,
      link: addUtm(it?.web_url || `https://offerup.com/item/detail/${it?.id}`),
      alt: it?.title || '',
      badge: it?.badges?.[0]?.name || '',
      stock: 1
    }));
  } catch (err) {
    console.warn('OfferUp fetch error', err);
    return [];
  }
}

async function main() {
  const [ebay, offerup] = await Promise.all([fetchEbay(), fetchOfferUp()]);
  const data = { ebay, offerup };
  await fs.writeFile(OUTPUT, JSON.stringify(data, null, 2));
  console.log(`Wrote ${OUTPUT}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
