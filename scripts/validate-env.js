const fs = require('fs');

const content = fs.readFileSync('env.js', 'utf8');
const tokens = ['%GA_ID%', '%RECAPTCHA_SITE_KEY%', '%PHONE_NUMBER%', '%SUBSCRIBE_ENDPOINT%'];
const missing = tokens.filter(t => content.includes(t));

if (missing.length) {
  console.error('Placeholder tokens not replaced:', missing.join(', '));
  process.exit(1);
}

