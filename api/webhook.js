// Flyy Reflections — webhook (POST only)
// Purpose: receive form submissions (kits/events), optionally forward to Zapier/Make,
// optionally trigger /api/auto to generate art. Safe defaults, no secrets in client.

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

// tiny helper
const pick = (obj = {}, keys = []) =>
  keys.reduce((acc, k) => (obj[k] !== undefined ? (acc[k] = obj[k], acc) : acc), {});

export default async function handler(req, res) {
  // Basic CORS (harmless even if same-origin)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'POST only' });
  }

  const receivedAt = new Date().toISOString();
  const ua = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

  const payload = req.body ?? {};
  const type = String(payload?.type || '').toLowerCase();

  // Normalize known shapes (ignore unknown fields to keep data clean)
  let data = {};
  if (type === 'kit_order') {
    data = pick(payload.payload, [
      'name','email','phone','address','theme','extras','date'
    ]);
  } else if (type === 'event_request') {
    data = pick(payload.payload, [
      'name','email','phone','company','eventDate','time','guests','venue','colors','notes','rush'
    ]);
  } else if (type) {
    // allow simple contact or other future types without failing
    data = payload.payload || {};
  }

  const envelope = {
    id: `flyy_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    type: type || 'unknown',
    data,
    meta: { receivedAt, ua, ip }
  };

  // 1) Optional forward to Zapier/Make (if FORWARD_URL set)
  let forwarded = null;
  if (process.env.FORWARD_URL) {
    try {
      await fetch(process.env.FORWARD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envelope)
      });
      forwarded = 'ok';
    } catch {
      forwarded = 'error';
    }
  }

  // 2) Optional auto-generate art for kit orders (non-blocking)
  try {
    if (type === 'kit_order' && data?.theme) {
      const base =
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'https://flyyreflections.vercel.app';

      const flyyPrompt =
        `Flyy Reflections style portrait/stencil for beginner-friendly paint-by-numbers. ` +
        `Theme: ${data.theme}. Signature cues: cracked mirror crest, butterfly wing on left, angel wing on right, ` +
        `chrome teardrops, hot-pink neon aura (#FF2EBF), baby-blue rim light (#8FD3FF). ` +
        `Clean outlines, high-contrast cells, print-ready, crisp edges for vinyl/cutting.`;

      await fetch(`${base}/api/auto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: flyyPrompt
          // To auto-place POD orders later, you can include:
          // address: { first_name:'', last_name:'', email:'', phone:'', country:'US', region:'TX', address1:'', city:'', zip:'' },
          // productId: 'YOUR_PRINTIFY_PRODUCT_ID',
          // variantId: 1234
        })
      });
    }
  } catch { /* ignore errors so form still returns 200 */ }

  return res.status(200).json({ ok: true, received: envelope, forwarded });
}
