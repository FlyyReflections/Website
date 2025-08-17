# Contributing to Flyy Reflections

Welcome, creatives. Keep it elegant, organized, and on-brand.

## Branch & Deploy Flow
- **Production:** `main` (Vercel deploys from here)
- **Small edits (copy, text, links):** commit directly to `main`
- **Bigger changes:** create a branch → open a Pull Request (PR)
  - Branch names: `feature/<short-name>` or `fix/<short-name>`
  - Example: `feature/ai-auto-orders`, `fix/nav-link-styles`
- Vercel auto-builds a **Preview URL** for each PR. Review it, then **Merge**.

## Commit Messages (keep it tight)
Use a simple convention:
- `feat:` new feature
- `fix:` bug fix
- `style:` visuals/CSS only
- `docs:` README/guide updates
- `chore:` housekeeping

Examples:
- `feat: add Platinum event package`
- `fix: webhook route path`
- `style: polish hero typography`

## File & Folder Conventions


- Keep **HTML semantic**, headings ordered, links descriptive.
- Put **images** under `assets/img/` and compress them.
- Keep any **custom JS** minimal and in `assets/js/app.js`.

## Brand Guardrails (don’t drift)
- Motifs: **cracked mirror**, **butterfly wing (left)**, **angel wing (right)**, **chrome teardrops**, **hot-pink neon**, **baby-blue rim**, **drops at 11:11**
- Palette: pink `#FF2EBF` · blue `#8FD3FF` · chrome `#CFD6DE` · ink `#0B0B0C` · white `#FFFFFF`
- Voice: respectful, cinematic, grief-to-glam; beginner-friendly but never basic.

## Secrets & Env Vars (security)
- **Never** commit API keys or tokens.
- Use Vercel → Project → Settings → **Environment Variables**:
  - `FORWARD_URL` (Zapier/Make optional)
  - `AI_API_URL`, `AI_API_KEY`
  - `CLOUDINARY_CLOUD` (+ key/secret if signed uploads)
  - `PRINT_PROVIDER` = `printify` or `printful`
  - `PRINTIFY_API_KEY`, `PRINTIFY_SHOP_ID` **or** `PRINTFUL_API_KEY`
- After changes, **Redeploy** to apply env vars.

## PR Checklist (before you hit Merge)
- [ ] Page loads styled (CSS linked right)
- [ ] Forms post and `/api/webhook` returns `POST only` on GET
- [ ] No secrets in code or logs
- [ ] Mobile looks clean (iPhone width)
- [ ] Matches brand guardrails

## Accessibility & Performance
- Provide alt text where images are used.
- Use proper contrast; avoid tiny text.
- Compress large images; keep pages snappy.

Thanks for keeping it Flyy. ✨
