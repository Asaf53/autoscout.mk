// Vercel Node.js function. No third-party runtime dependencies.
const interests = {purchase: 'Purchase', lease: 'Lease', other: 'Other inquiry'};
const clean = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit + 1) : '';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed.'});
  }
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) return res.status(415).json({error: 'JSON required.'});
  if (Number(req.headers['content-length']) > 16000) return res.status(413).json({error: 'Inquiry too large.'});
  // Reject ordinary cross-site browser submissions; not a substitute for bot protection.
  if (req.headers['sec-fetch-site'] === 'cross-site') return res.status(403).json({error: 'Cross-site submissions are not allowed.'});
  let body;
  try {body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;} catch {return res.status(400).json({error: 'Invalid inquiry.'});}
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({error: 'Invalid inquiry.'});
  if (body.website) return res.status(400).json({error: 'Invalid inquiry.'});
  const name = clean(body.name, 100), email = clean(body.email, 254), offer = clean(body.offer, 100), message = clean(body.message, 3000), interest = clean(body.interest, 20);
  if (!name || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !Object.hasOwn(interests, interest) || !message || message.length > 3000 || offer.length > 100) return res.status(400).json({error: 'Please check the required fields and try again.'});
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) return res.status(503).json({error: 'The inquiry service is not configured yet. Please try again later.'});
  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: {Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json'},
      body: JSON.stringify({from: CONTACT_FROM_EMAIL, to: [CONTACT_TO_EMAIL], reply_to: email, subject: 'autoscout.mk — ' + interests[interest] + ' inquiry', text: ['New domain inquiry', 'Name: ' + name, 'Email: ' + email, 'Interest: ' + interests[interest], 'Budget: ' + (offer || 'Not specified'), '', message].join('\n')}),
      signal: AbortSignal.timeout(10000)
    });
    if (!result.ok) {console.error('Inquiry provider failed:', result.status); return res.status(502).json({error: 'Unable to deliver your inquiry. Please try again later.'});}
    return res.status(200).json({ok: true});
  } catch {return res.status(502).json({error: 'Unable to deliver your inquiry. Please try again later.'});}
}
