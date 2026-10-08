# Shoot Services admin setup

The admin-managed directory reads from Cloudflare D1. Spots are stored in `spots`; outfits and rental shops in `outfits` / `rental_shops`; photographers and packages in `photographers` / `photographer_packages`; film stocks and labs in `film_rolls` / `film_labs`. The legacy `service_listings` table remains readable for compatibility. New records added through the admin are stored in the normalized tables.

## Production setup

1. Apply the D1 migrations (including the CMS schema and outfit-to-spot link):
   `npm run cf:d1:migrate`
2. Set the admin password and a separate random signing secret on the production Worker. Wrangler prompts for each value; enter them there, not in source control:
   `npx wrangler secret put ADMIN_PASSWORD --env production --config wrangler-worker.toml`
   `npx wrangler secret put ADMIN_SESSION_SECRET --env production --config wrangler-worker.toml`
3. Set `VITE_API_URL` in the Cloudflare Pages build environment to the deployed Worker API origin (no trailing slash), then rebuild/deploy Pages. If Pages already proxies `/api/*` to this Worker on the same origin, leave it unset.
4. Open `/admin` (or a category URL such as `/admin/spots`, `/admin/outfits`, `/admin/photographers`, `/admin/films`). Sign in and manage D1 records; the same listings are then read by the public services and film-lab views.

The admin session is a signed bearer token held in session storage and expires after eight hours. All admin list/write endpoints require it. Public service listings are read-only.

## Bulk Excel import

Each category in `/admin` has a “Nhập nhiều dòng từ Excel” panel. Download the header template, open it in Excel, fill one record per row, save as `.xlsx`, select it, review valid/error rows, then confirm import. Supports up to 1,000 rows and 10 MB per file. Comma-separated text is used for list fields; outfit hotspots and photographer packages must be JSON arrays. Valid rows can be imported even when other rows have validation errors; failed writes remain available for retry.

## Local development

Set `VITE_API_URL` to the local Worker origin when running the Worker separately, and provide local `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` through Wrangler's local secret configuration. Apply migrations to the local D1 database before adding records.
