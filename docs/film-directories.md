# Lab and film shop catalogs

Lab development/scan services and retail film shops are independent entities in the same D1 database:

- `film_labs`: public `/api/labs`, admin `/api/admin/labs` and `/api/admin/cms/labs/:id`, public category `filmLab`.
- `film_shops`: public `/api/film-shops`, admin `/api/admin/film-shops` and `/api/admin/cms/filmShops/:id`, public category `filmShop`.
- `/api/services` returns both explicit categories. Prices do not determine membership. The same business/phone can have one record in each catalog; editing/deleting either record does not modify the other.
- The legacy public URL `/api/partner/register-lab` and `/join/film-lab` remain shop-onboarding aliases for compatibility. New registrations go to `film_shops`. Existing R2 image URLs and shop IDs remain unchanged.
- `useNearestLabs` consumers must select the appropriate catalog; the Lab map overlay must not replace the shop directory.

## Migration

`0020_separate_film_shops.sql` creates `film_shops`, adds services storage, copies existing retail rows with all fields/IDs/timestamps intact, then removes only those copied retail rows from the old mixed table. Existing nonretail labs stay unchanged. Retail prices in old `film_labs` columns are retained for migration compatibility, not runtime classification.

Back up `film_labs` before migration. Apply against a local DB and verify first. For production, apply only the approved migration, not unrelated pending migrations:

    npx wrangler d1 execute chupgibaygio-db --remote --env production --config wrangler-worker.toml --file migrations/0020_separate_film_shops.sql

When applying the file directly, record its name in `d1_migrations` after successful schema/data verification so future migration runs do not reapply it. Do not re-run this non-idempotent schema migration. Inspect `sqlite_master`, `PRAGMA table_info(film_labs)`, `PRAGMA table_info(film_shops)` and migration history first. Deploy the matching API and frontend together; cached old clients should reload.

Verify every migrated row against the snapshot, confirm all previous lab rows survive, and test both APIs/admin CRUD independently. Add a second business capability only after owner confirmation; do not infer lab services from a shop's retail stock list or erase retail prices to place a business in Lab.

## Cinephile / Líu Lo

The existing shop ID `8496a65a-1a4a-40c9-85c8-aba195bbfaeb` and its retail price/stock/cover/branch data must be preserved. The owner requested a separate Lab listing for `Cinephile Filmlab - Điểm Líu Lo`, phone `0889969127`, hours `09:00 - 19:30`, address `Số 3A ngõ 25 Vạn Bảo, Ba Đình, Hà Nội`. Create that Lab entry with a separate ID without modifying the retail listing. Keep coordinates null until an exact storefront position is verified. Public address privacy remains ward/district only.
