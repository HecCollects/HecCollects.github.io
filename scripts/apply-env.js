const fs = require('fs');

const envPath = 'env.js';

const replacements = {
  '%GA_ID%': process.env.GA_ID || '',
  '%RECAPTCHA_SITE_KEY%': process.env.RECAPTCHA_SITE_KEY || '',
  '%PHONE_NUMBER%': process.env.PHONE_NUMBER || '',
};

let content = fs.readFileSync(envPath, 'utf8');
for (const [token, value] of Object.entries(replacements)) {
  content = content.replace(new RegExp(token, 'g'), value);
}

fs.writeFileSync(envPath, content);
