export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok:false, error:'POST only' });
  }

  let payload = {};
  try { payload = req.body ?? {}; } catch {}

  // OPTIONAL: auto-run for kit orders (non-blocking)
  try {
    if (payload?.type === 'kit_order' && payload?.payload?.theme) {
      const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://flyyreflections.vercel.app';
      await fetch(`${base}/api/auto`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          prompt: `Flyy Reflections style stencil/portrait. Theme: ${payload.payload.theme}. Symbols: cracked mirror, butterfly wing left, angel wing right, chrome teardrops, hot pink neon, baby blue rim.`,
          // If you want to auto-order, add address & product mapping here.
          // address: {...},
          // productId: 'YOUR_PRODUCT_ID',
          // variantId: 1234
        })
      });
    }
  } catch {}

  // Optional: forward to Zapier/Make
  let forwarded = null;
  if (process.env.FORWARD_URL) {
    try {
      const r = await fetch(process.env.FORWARD_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      forwarded = r.status;
    } catch { forwarded = 'error'; }
  }

  return res.status(200).json({ ok:true, received:payload, forwarded });
}
