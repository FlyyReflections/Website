// Flyy Reflections — AI → Upload → Print-on-Demand orchestrator
// Safe-by-default: if optional env vars are missing, it still returns a generated image error cleanly.
//
// Env (set in Vercel → Project → Settings → Environment Variables):
//   AI_API_URL, AI_API_KEY                     // your image API endpoint + key
//   CLOUDINARY_CLOUD, CLOUDINARY_UNSIGNED_PRESET  // easiest upload path (unsigned preset)
//   (optional POD) PRINT_PROVIDER=printify|printful
//     Printify: PRINTIFY_API_KEY, PRINTIFY_SHOP_ID
//     Printful: PRINTFUL_API_KEY
//
// Call: POST /api/auto  body: { prompt, address?, productId?, variantId?, meta? }

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

async function generateImage(prompt) {
  const url = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  if (!url || !key) throw new Error('AI config missing (AI_API_URL, AI_API_KEY)');

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      // Generic schema — adjust to your provider as needed
      prompt,
      // You can add size/quality/options here when you pick a provider:
      // size: "1024x1280", style: "illustration", upscale: true
    })
  });
  if (!r.ok) throw new Error(`AI generation failed (${r.status})`);
  const data = await r.json();
  // Support several common shapes (url or base64)
  return data.url || data.image_url || data.image?.url || data.image_base64 || data.base64;
}

async function uploadToCloudinary(image) {
  const cloud = process.env.CLOUDINARY_CLOUD;
  const preset = process.env.CLOUDINARY_UNSIGNED_PRESET;
  if (!cloud || !preset) throw new Error('Cloudinary config missing (CLOUDINARY_CLOUD, CLOUDINARY_UNSIGNED_PRESET)');

  // If image is already a URL, let Cloudinary fetch it
  if (typeof image === 'string' && image.startsWith('http')) {
    const form = new URLSearchParams();
    form.append('file', image);
    form.append('upload_preset', preset);

    const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: 'POST',
      body: form
    });
    if (!r.ok) throw new Error(`Cloudinary upload (url) failed (${r.status})`);
    const out = await r.json();
    return out.secure_url;
  }

  // Assume base64 payload
  const form = new FormData();
  form.append('file', `data:image/png;base64,${image}`);
  form.append('upload_preset', preset);

  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: form
  });
  if (!r.ok) throw new Error(`Cloudinary upload (base64) failed (${r.status})`);
  const out = await r.json();
  return out.secure_url;
}

async function createPODOrder(imageUrl, meta) {
  const provider = (process.env.PRINT_PROVIDER || '').toLowerCase();
  if (!provider) return null; // not configured — skip

  if (provider === 'printify') {
    const key = process.env.PRINTIFY_API_KEY;
    const shop = process.env.PRINTIFY_SHOP_ID;
    if (!key || !shop) throw new Error('Printify config missing (PRINTIFY_API_KEY, PRINTIFY_SHOP_ID)');

    const r = await fetch(`https://api.printify.com/v1/shops/${shop}/orders.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        external_id: `flyy_${Date.now()}`,
        line_items: [
          {
            product_id: meta.productId,        // your template
            variant_id: meta.variantId,        // e.g., canvas size
            print_areas: [
              { variant_ids: [meta.variantId], placeholders: [{ position: 'front', images: [{ url: imageUrl }] }] }
            ],
            quantity: 1
          }
        ],
        shipping_method: 1,
        address_to: meta.address // { first_name,last_name,email,phone,country,region,address1,city,zip }
      })
    });
    if (!r.ok) throw new Error(`Printify order failed (${r.status})`);
    return await r.json();
  }

  if (provider === 'printful') {
    const key = process.env.PRINTFUL_API_KEY;
    if (!key) throw new Error('Printful config missing (PRINTFUL_API_KEY)');
    const r = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        recipient: meta.address,
        items: [{ sync_variant_id: meta.variantId, files: [{ url: imageUrl }] }]
      })
    });
    if (!r.ok) throw new Error(`Printful order failed (${r.status})`);
    return await r.json();
  }

  throw new Error('Unknown PRINT_PROVIDER');
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

    const { prompt, address, productId, variantId, meta = {} } = req.body || {};
    if (!prompt) return res.status(400).json({ ok: false, error: 'Missing prompt' });

    // 1) Generate art in your Flyy style (prompt comes from webhook or client)
    const generated = await generateImage(prompt);

    // 2) Store to Cloudinary → get a permanent HTTPS URL
    const imageUrl = await uploadToCloudinary(generated);

    // 3) Optional: place a POD order
    let order = null;
    if (address && (productId || variantId)) {
      order = await createPODOrder(imageUrl, { address, productId, variantId, ...meta });
    }

    return res.status(200).json({ ok: true, imageUrl, order });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || 'Auto pipeline failed' });
  }
}
