const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'reviews.json');
const LIMIT = parseInt(process.env.REVIEW_LIMIT || '5', 10);

async function fetchEbayReviews() {
  const token = process.env.EBAY_OAUTH_TOKEN;
  const ids = (process.env.EBAY_ITEM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!token || !ids.length) {
    console.warn('EBAY_OAUTH_TOKEN or EBAY_ITEM_IDS not set; skipping eBay reviews');
    return [];
  }
  const results = [];
  for (const id of ids) {
    try {
      const res = await fetch(`https://api.ebay.com/buy/browse/v1/item/${id}/reviews?limit=${LIMIT}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        console.warn('eBay reviews request failed', res.status);
        continue;
      }
      const json = await res.json();
      const reviews = json?.reviews || [];
      for (const r of reviews) {
        results.push({
          source: 'eBay',
          text: r.review || r.comment || '',
          rating: Number(r.rating || r.ratingValue || 0)
        });
        if (results.length >= LIMIT) break;
      }
      if (results.length >= LIMIT) break;
    } catch (err) {
      console.warn('eBay review fetch error', err);
    }
  }
  return results;
}

async function fetchOfferUpReviews() {
  const seller = process.env.OFFERUP_SELLER;
  if (!seller) {
    console.warn('OFFERUP_SELLER not set; skipping OfferUp reviews');
    return [];
  }
  try {
    const url = `https://offerup.com/api/shops/v1/profiles/${seller}/reviews?limit=${LIMIT}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('OfferUp reviews request failed', res.status);
      return [];
    }
    const json = await res.json();
    const reviews = json?.reviews || json?.data?.reviews || [];
    return reviews.slice(0, LIMIT).map(r => ({
      source: 'OfferUp',
      text: r.comment || r.text || '',
      rating: Number(r.rating || r.score || 0)
    }));
  } catch (err) {
    console.warn('OfferUp review fetch error', err);
    return [];
  }
}

async function main() {
  const [ebay, offerup] = await Promise.all([fetchEbayReviews(), fetchOfferUpReviews()]);
  const data = [...ebay, ...offerup];
  await fs.writeFile(OUTPUT, JSON.stringify(data, null, 2));
  console.log(`Wrote ${OUTPUT}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
