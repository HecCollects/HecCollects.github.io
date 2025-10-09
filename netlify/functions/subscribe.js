const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

const jsonResponse = (statusCode, data = {}) => ({
  statusCode,
  headers: DEFAULT_HEADERS,
  body: JSON.stringify(data)
});

const parseEventBody = (event) => {
  try {
    if (!event.body) return {};
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse request body', err);
    throw new Error('Invalid JSON body');
  }
};

const verifyRecaptcha = async (token) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return { success: true, skipped: true };
  }
  if (!token) {
    return { success: false, error: 'Missing captcha token' };
  }
  try {
    const params = new URLSearchParams({
      secret,
      response: token
    });
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    if (!res.ok) {
      console.error('reCAPTCHA verification failed with status', res.status);
      return { success: false, error: 'Captcha verification failed' };
    }
    const payload = await res.json();
    if (!payload.success) {
      console.warn('reCAPTCHA rejected submission', payload['error-codes']);
      return { success: false, error: 'Captcha verification failed' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error verifying reCAPTCHA', error);
    return { success: false, error: 'Captcha verification failed' };
  }
};

const submitToMailchimp = async ({ email, status, source, interests }) => {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !audienceId || !serverPrefix) {
    console.error('Mailchimp environment variables missing');
    throw new Error('Service unavailable');
  }

  const endpoint = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}`
  };

  const tags = new Set();
  if (source) tags.add(source);
  if (Array.isArray(interests)) {
    interests.filter(Boolean).forEach(tag => tags.add(tag));
  }

  const body = {
    email_address: email,
    status: status || 'subscribed',
    tags: Array.from(tags)
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  let responseBody = null;
  try {
    responseBody = await res.json();
  } catch (err) {
    console.error('Failed to parse Mailchimp response', err);
  }

  if (res.ok) {
    return { success: true };
  }

  const mailchimpError = responseBody?.title || responseBody?.detail;
  if (res.status === 400 && mailchimpError === 'Member Exists') {
    console.info('Mailchimp reports member already exists');
    return { success: true, alreadySubscribed: true };
  }

  console.error('Mailchimp request failed', res.status, responseBody);
  const errorMessage = mailchimpError || 'Subscription failed';
  return { success: false, error: errorMessage };
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: DEFAULT_HEADERS,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  let body;
  try {
    body = parseEventBody(event);
  } catch (err) {
    return jsonResponse(400, { error: err.message });
  }

  const email = (body.email_address || '').trim().toLowerCase();
  const honeypot = body.honeypot || body.hp || '';
  const captchaToken = body['g-recaptcha-response'];

  if (honeypot) {
    console.warn('Honeypot triggered for newsletter submission');
    return jsonResponse(400, { error: 'Invalid submission' });
  }

  if (!email) {
    return jsonResponse(400, { error: 'Email address is required' });
  }

  const captcha = await verifyRecaptcha(captchaToken);
  if (!captcha.success) {
    return jsonResponse(400, { error: captcha.error || 'Captcha verification failed' });
  }

  try {
    const result = await submitToMailchimp({
      email,
      status: body.status,
      source: body.source,
      interests: body.interests
    });

    if (result.success) {
      return jsonResponse(200, {
        success: true,
        message: result.alreadySubscribed ? 'You are already subscribed.' : 'Subscription successful.'
      });
    }

    return jsonResponse(502, { error: result.error || 'Subscription failed' });
  } catch (error) {
    console.error('Unexpected error handling subscription', error);
    return jsonResponse(500, { error: 'Subscription service unavailable' });
  }
};
