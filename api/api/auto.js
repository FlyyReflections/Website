export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

async function generateImage(prompt) {
  const url = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  if (!url || !key) throw new Error('AI config missing');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ prompt })
  });
  if (!r.ok) throw new Error('AI generation failed');
  const data = await r.json();
  return data.image_base64 || data.url; // adapt to your provider
}

async function uploadToCloudinary(image) {
  const cloud = process.env.CLOUDINARY_CLOUD;
  if (!cloud) throw new Error('Cloudinary cloud missing');

  // If already a URL
  if (typeof image === 'string' && image.startsWith('http')) {
    const form = new URLSearchParams();
    form.append('file', image);
    form.append('upload_preset', 'unsigned'); // or use signed method
    const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method:'POST', body: form });
    if (!r.ok) throw new Error('Cloudinary upload failed (url)');
    const out = await r.json();
    return out.secure_url;
  }

  // Assume base64
  const form = new FormData();
  form.append('file', `data:image/png;base64,${image}`);
  form.append('upload_preset', 'unsigned');
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method:'POST', body: form });
  if (!r.ok) throw new Error('Cloudinary upload failed (base64)');
  const out = await r.json();
  return out.secure_url;
}

async function createPODOrder(imageUrl, meta) {
  const provider = (process.env.PRINT_PROVIDER || '').toLowerCase();
  if (!provider) return null; // skip if not configured

  if (provider === 'printify') {
    const key = process.env.PRINTIFY_API_KEY;
    const shop = process.env.PRINTIFY_SHOP_ID;
    if (!key || !shop) throw new Error('Printify config missing');
    const r = await fetch(`https://api.printify.com/v1/shops/${shop}/orders.json`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        external_id: `flyy_${Date.now()}`,
        line_items: [
          {
            product_id: meta.productId,
            variant_id: meta.variantId,
            print_areas: [{ variant_ids:[meta.variantId], placeholders:[{ position:'front', images:[{ url:imageUrl }] }] }],
            quantity: 1
          }
        ],
        shipping_method: 1,
        address_to: meta.address
      })
    });
    if (!r.ok) throw new Error('Printify order failed');
    return await r.json();
  }

  if (provider === 'printful') {
    const key = process.env.PRINTFUL_API_KEY;
    if (!key) throw new Error('Printful config missing');
    const r = await fetch('https://api.printful.com/orders', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        recipient: meta.address,
        items: [{ sync_variant_id: meta.variantId, files:[{ url:imageUrl }] }]
      })
    });
    if (!r.ok) throw new Error('Printful order failed');
    return await r.json();
  }

  return null;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'POST only' });
    const { prompt, address, productId, variantId, meta = {} } = req.body || {};
    if (!prompt) return res.status(400).json({ ok:false, error:'Missing prompt' });

    const generated = await generateImage(prompt);
    const imageUrl = await uploadToCloudinary(generated);

    let order = null;
    if (address && (productId || variantId)) {
      order = await createPODOrder(imageUrl, { address, productId, variantId, ...meta });
    }

    return res.status(200).json({ ok:true, imageUrl, order });
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message || 'Auto pipeline failed' });
  }
}
