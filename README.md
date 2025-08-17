# FLYY REFLECTIONS — Digital Art Studio

Luxury paint & sip experiences • Memorial art that heals • AI-assisted, zero-inventory workflows  
Drops at **11:11** • Cracked mirror truth • Butterfly wing left • Angel wing right • Chrome teardrops

Live site: **https://flyyreflections.vercel.app**  
Contact: **info@flyyreflections.com** • IG **@flyyreflections** • TikTok **@flyyreflections** • Pinterest **/flyyreflections**

---

## ✨ What this repo contains

- A fast, static site (HTML/CSS/JS) deployed on **Vercel**
- Two lead-capture forms:
  - **Kits** (digital paint-by-numbers, shipped direct)
  - **Events** (private paint & sip bookings)
- A serverless function `api/webhook` that safely receives form submissions
- An **optional** AI → Cloud upload → Print-on-Demand pipeline at `api/auto`
- Clean, minimal, luxe design system aligned to the brand’s core motifs

---

## 🗂 Folder structure

---

## 🚀 Quick start (no CLI needed)

1. **Add/Update files** on GitHub → _Commit directly to `main`_  
2. Vercel auto-deploys → open your URL  
3. Health check: visit `/api/webhook` → should return `{"ok":false,"error":"POST only"}`  
4. Submit a test on the Kits/Events forms → confirm in **Vercel → Deployments → Functions Logs**

> If you don’t see styles on the live site, ensure `assets/css/styles.css` and `assets/js/app.js` exist at those exact paths and that `index.html` links them.

---

## ⚙️ Vercel project settings (static site)

- **Framework preset:** Other / None  
- **Build Command:** _empty_  
- **Output Directory:** _empty_ (root)  
- **Root Directory:** repo root (where `index.html` lives)

---

## 🔐 Environment variables (add in Vercel → Project → Settings → Env Vars)

These are optional unless you’re using automations:

- `FORWARD_URL` → Zapier/Make webhook to relay form submissions
- `AI_API_URL`, `AI_API_KEY` → your image generator endpoint + key
- `CLOUDINARY_CLOUD` (+ `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` if using signed uploads)
- `PRINT_PROVIDER` → `printify` or `printful`
- `PRINTIFY_API_KEY`, `PRINTIFY_SHOP_ID` **or** `PRINTFUL_API_KEY` (+ store id if needed)

After adding vars, **Redeploy** to apply.

---

## 🧾 Forms & Webhook

Frontend points to:
```js
// assets/js/app.js
const WEBHOOK = 'https://flyyreflections.vercel.app/api/webhook';
---

## 🚀 Quick start (no CLI needed)

1. **Add/Update files** on GitHub → _Commit directly to `main`_  
2. Vercel auto-deploys → open your URL  
3. Health check: visit `/api/webhook` → should return `{"ok":false,"error":"POST only"}`  
4. Submit a test on the Kits/Events forms → confirm in **Vercel → Deployments → Functions Logs**

> If you don’t see styles on the live site, ensure `assets/css/styles.css` and `assets/js/app.js` exist at those exact paths and that `index.html` links them.

---

## ⚙️ Vercel project settings (static site)

- **Framework preset:** Other / None  
- **Build Command:** _empty_  
- **Output Directory:** _empty_ (root)  
- **Root Directory:** repo root (where `index.html` lives)

---

## 🔐 Environment variables (add in Vercel → Project → Settings → Env Vars)

These are optional unless you’re using automations:

- `FORWARD_URL` → Zapier/Make webhook to relay form submissions
- `AI_API_URL`, `AI_API_KEY` → your image generator endpoint + key
- `CLOUDINARY_CLOUD` (+ `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` if using signed uploads)
- `PRINT_PROVIDER` → `printify` or `printful`
- `PRINTIFY_API_KEY`, `PRINTIFY_SHOP_ID` **or** `PRINTFUL_API_KEY` (+ store id if needed)

After adding vars, **Redeploy** to apply.

---

## 🧾 Forms & Webhook

Frontend points to:
```js
// assets/js/app.js
const WEBHOOK = 'https://flyyreflections.vercel.app/api/webhook';


Notes
	•	Image storage uses Cloudinary (or switch to S3)
	•	POD supports Printify or Printful — map your product/variant ids before live orders
	•	Add payment flows via Stripe Payment Links or Checkout

⸻

🎨 Design language (brand DNA)
	•	Motifs: cracked mirror, butterfly wing (left), angel wing (right), chrome teardrops, hot-pink neon aura, baby-blue rim light
	•	Palette: neon pink #FF2EBF, baby blue #8FD3FF, chrome #CFD6DE, ink #0B0B0C, white #FFFFFF
	•	Typography: editorial display + clean sans (e.g., Playfair Display + Manrope)
	•	Vibe: elegant, cinematic, grief-to-glam, respectful, beginner-friendly but never basic

⸻

🧭 Content sections
	•	Hero — promise, social proof, 11:11 energy
	•	Kits — offerings + order form
	•	Events — packages + booking form
	•	About — brand story, signature cues, socials
	•	Contact — email + social links

⸻

🧪 Testing checklist
	•	Site renders with styles and buttons
	•	/api/webhook returns 405 on GET (POST only)
	•	Submit Kit and Event forms → see payloads in Vercel Functions Logs
	•	If using AI/POD:
	•	POST /api/auto with a sample prompt returns a valid imageUrl
	•	Configure product/variant ids before enabling auto-orders

⸻

🔒 Security & privacy
	•	Forms post to a serverless function; no secrets live in the browser
	•	Secrets reside in Vercel Environment Variables
	•	Avoid storing PII in logs; rely on secure providers (Stripe, Printify/Printful, Cloudinary)

⸻

🛠 Local edits (optional)

Clone with GitHub Desktop, edit, and push to main. Vercel redeploys automatically.
Or use GitHub’s Create/Upload file to edit directly from your browser.

⸻

📄 License

© Flyy Reflections. All rights reserved.
Client designs, artwork, and brand elements are proprietary to Flyy Reflections.

// api/webhook.js (POST only)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'POST only' });

  const payload = req.body ?? {};

  // Optional: auto-generate art for kit orders
  try {
    if (payload?.type === 'kit_order' && payload?.payload?.theme) {
      const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://flyyreflections.vercel.app';
      await fetch(`${base}/api/auto`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          prompt: `Flyy Reflections style stencil/portrait. Theme: ${payload.payload.theme}. Symbols: cracked mirror, butterfly wing left, angel wing right, chrome teardrops, hot pink neon, baby blue rim.`
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

  return res.status(200).json({ ok:true, received: payload, forwarded });
}

POST /api/auto

{
  "prompt": "Your rich prompt aligned to the brand",
  "address": {
    "first_name": "—", "last_name": "—", "email": "—",
    "phone": "—", "country": "US", "region": "TX",
    "address1": "—", "city": "—", "zip": "—"
  },
  "productId": "printify-template-or-null",
  "variantId": 1234,
  "meta": {}
}

{ "ok": true, "imageUrl": "https://...", "order": { "...": "..." } }
