# Chụp Gì Bây Giờ - Auto Deploy Guide

## 🚀 One-Push Deploy to Cloudflare

**Stack**: React (Pages) + Hono Workers + D1 + R2 + KV
**Cost**: $0/month (Free tier limits)

---

## 📋 Prerequisites

1. **Cloudflare Account** - [Sign up](https://dash.cloudflare.com/sign-up)
2. **GitHub Repository** - Push this repo to GitHub
3. **Node.js 20+** - Local development

---

## ⚡ Quick Start (5 minutes)

### 1. Install & Login
```bash
npm install
npm run cf:login
```

### 2. Create Cloudflare Resources
```bash
# Create D1 database
npm run cf:d1:create
# → Copy the database_id to wrangler.toml

# Create R2 bucket
npm run cf:r2:create

# Create KV namespace
npm run cf:kv:create
# → Copy the namespace_id to wrangler.toml
```

### 3. Run Migrations
```bash
# Development
npm run cf:d1:migrate:dev

# Production
npm run cf:d1:migrate
```

### 4. Configure Secrets
```bash
# In Cloudflare Dashboard → Workers → Settings → Variables
# Or via CLI:
wrangler secret put DATABASE_URL --env production
wrangler secret put R2_ACCESS_KEY_ID --env production
wrangler secret put R2_SECRET_ACCESS_KEY --env production
```

### 5. Push to GitHub
```bash
git add .
git commit -m "feat: auto deploy setup"
git push origin main
```

**Done!** GitHub Actions will:
- ✅ Lint + TypeCheck
- ✅ Build frontend → Deploy to Cloudflare Pages
- ✅ Build worker → Deploy to Cloudflare Workers
- ✅ Preview URLs for PRs, Production for main

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `wrangler.toml` | Worker + D1 + R2 + KV config |
| `package.json` | Build scripts + dependencies |
| `migrations/0001_initial_schema.sql` | D1 schema |
| `public/_headers` | Security headers |
| `public/_redirects` | SPA fallback + redirects |

---

## 🌐 URLs After Deploy

| Environment | Frontend | API |
|-------------|----------|-----|
| Production | `https://chupgibaygio.pages.dev` | `https://api.chupgibaygio.com` |
| Preview (PR) | `https://<branch>.chupgibaygio.pages.dev` | `https://api-staging.chupgibaygio.com` |
| Local Dev | `http://localhost:5173` | `http://localhost:8787` |

---

## 🛠 Local Development

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Worker (with local D1)
npx wrangler dev --env dev --local
```

---

## 📦 Free Tier Limits

| Resource | Limit |
|----------|-------|
| Pages requests | 500k/month |
| Workers requests | 100k/day |
| Workers CPU | 10ms/request |
| D1 storage | 5 GB |
| D1 reads | 5M/month |
| D1 writes | 100k/month |
| R2 storage | 10 GB |
| R2 Class A ops | 1M/month |
| KV reads | 100k/day |
| KV writes | 1k/day |

---

## 🔐 Required GitHub Secrets

Go to **Repo → Settings → Secrets → Actions**:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Pages + Workers + D1 + R2 permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `VITE_API_BASE_URL` | Production API URL (e.g. `https://api.chupgibaygio.com`) |

**Create API Token**: Cloudflare Dashboard → My Profile → API Tokens → Create Token
- Permissions: Account → Cloudflare Pages (Edit), Workers (Edit), D1 (Edit), R2 (Edit), KV (Edit)
- Account Resources: Include → Your Account

---

## 📝 Custom Domain Setup

1. **Cloudflare Pages Dashboard** → Your project → Custom Domains
2. Add `chupgibaygio.com` and `www.chupgibaygio.com`
3. DNS records auto-configured (if using Cloudflare DNS)
4. SSL/TLS: Full (Strict)

**Workers Custom Domain**: Workers → Your Worker → Triggers → Custom Domains → `api.chupgibaygio.com`

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `wrangler: command not found` | `npm install -g wrangler` or `npx wrangler` |
| D1 migration fails | Check `wrangler.toml` database_id matches created DB |
| Build fails on Pages | Check `VITE_API_BASE_URL` secret is set |
| CORS errors | Verify Worker CORS origins include your Pages URL |
| R2 upload fails | Check R2 bucket name + CORS config in bucket settings |

---

## 📚 References

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Docs](https://developers.cloudflare.com/d1/)
- [R2 Docs](https://developers.cloudflare.com/r2/)
- [Hono Framework](https://hono.dev/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)