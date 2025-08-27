const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'sold-items.json');

const SEARCH_TERM = process.env.SOLD_SEARCH_TERM || 'collectible';
const LIMIT = parseInt(process.env.SOLD_LIMIT || '10', 10);

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

async function fetchEbaySold() {
  const appId = process.env.EBAY_APP_ID;
  if (!appId) {
    console.warn('EBAY_APP_ID not set; skipping eBay sold fetch');
    return [];
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const now = new Date();

  const params = new URLSearchParams({
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.13.0',
    'SECURITY-APPNAME': appId,
    'RESPONSE-DATA-FORMAT': 'JSON',
    'REST-PAYLOAD': 'true',
    keywords: SEARCH_TERM,
    'paginationInput.entriesPerPage': String(LIMIT),
    'itemFilter(0).name': 'SoldItemsOnly',
    'itemFilter(0).value': 'true',
    'itemFilter(1).name': 'EndTimeFrom',
    'itemFilter(1).value': cutoff.toISOString(),
    'itemFilter(2).name': 'EndTimeTo',
    'itemFilter(2).value': now.toISOString()
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
      url: addUtm(item.viewItemURL?.[0] || ''),
      image: item.galleryURL?.[0] || '',
      platform: 'ebay',
      condition:
        item.condition?.[0]?.conditionDisplayName?.[0] ||
        item.conditionId?.[0] ||
        '',
      quantitySold: Number(item.sellingStatus?.[0]?.quantitySold?.[0] || 0),
      sellerCount: item.sellerInfo?.[0]?.sellerUserName ? 1 : null
    }));
  } catch (err) {
    console.warn('eBay sold fetch error', err);
    return [];
  }
}

async function fetchTcgPlayerSold() {
  const publicKey = process.env.TCG_PUBLIC_KEY;
  const privateKey = process.env.TCG_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn('TCG_PUBLIC_KEY or TCG_PRIVATE_KEY not set; skipping TCGplayer sold fetch');
    return [];
  }

  try {
    const tokenRes = await fetch('https://api.tcgplayer.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: publicKey,
        client_secret: privateKey
      })
    });
    if (!tokenRes.ok) {
      console.warn('TCGplayer token request failed', tokenRes.status);
      return [];
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const params = new URLSearchParams({
      limit: String(LIMIT),
      startDate: cutoff.toISOString()
    });

    const res = await fetch(`https://api.tcgplayer.com/storesales/orders?${params}`, {
      headers: {
        Authorization: `bearer ${accessToken}`
      }
    });
    if (!res.ok) {
      console.warn('TCGplayer sold request failed', res.status);
      return [];
    }
    const json = await res.json();
    const orders = json?.results || [];
    return orders.slice(0, LIMIT).map(order => ({
      title: order.productName || order.product?.name || '',
      price: {
        value: Number(order.totalPrice?.amount || order.price?.amount || 0),
        currency: order.totalPrice?.currencyCode || order.price?.currencyCode || ''
      },
      date: order.orderDate || order.createdOn || '',
      location: order.address?.region || '',
      url: '',
      image: '',
      platform: 'tcgplayer',
      condition:
        order.condition ||
        order.product?.conditionName ||
        order.productConditionId ||
        '',
      quantitySold: Number(
        order.quantity ||
        order.quantitySold ||
        order.orderItems?.[0]?.quantity ||
        0
      ),
      sellerCount: Number(order.sellerCount || (order.storeSellerId ? 1 : 0))
    }));
  } catch (err) {
    console.warn('TCGplayer sold fetch error', err);
    return [];
  }
}

async function main() {
  const [ebay, tcgplayer] = await Promise.all([
    fetchEbaySold(),
    fetchTcgPlayerSold()
  ]);
  const sold = [...ebay, ...tcgplayer];
  await fs.writeFile(OUTPUT, JSON.stringify(sold, null, 2));
  console.log(`Wrote ${OUTPUT}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
