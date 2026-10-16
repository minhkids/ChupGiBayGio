-- Independent retail catalog; existing lab columns are retained for backward-compatible migrations.
CREATE TABLE film_shops (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slogan TEXT NOT NULL DEFAULT '' CHECK (length(slogan) <= 50),
  ward TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  lat REAL,
  lng REAL,
  opening_hours TEXT NOT NULL DEFAULT '',
  hotline TEXT NOT NULL DEFAULT '',
  fast_2h INTEGER NOT NULL DEFAULT 0,
  express_delivery_2h INTEGER NOT NULL DEFAULT 0 CHECK (express_delivery_2h IN (0, 1)),
  in_stock_films TEXT NOT NULL DEFAULT '[]',
  district TEXT NOT NULL DEFAULT '',
  fanpage_url TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  product_image_url TEXT NOT NULL DEFAULT '',
  min_roll_price INTEGER NOT NULL DEFAULT 0,
  max_roll_price INTEGER NOT NULL DEFAULT 0,
  cheapest_roll_name TEXT NOT NULL DEFAULT '',
  locations TEXT NOT NULL DEFAULT '[]',
  services TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending_review')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE film_labs ADD COLUMN services TEXT NOT NULL DEFAULT '[]';

-- One-time classification of legacy mixed rows only. Runtime uses explicit tables, never prices.
-- Copy every field, preserving IDs, images, branch data, publication state and timestamps.
INSERT INTO film_shops (
  id, name, slogan, ward, address, lat, lng, opening_hours, hotline, fast_2h,
  express_delivery_2h, in_stock_films, district, fanpage_url, image_url,
  product_image_url, min_roll_price, max_roll_price, cheapest_roll_name, locations,
  services, status, created_at, updated_at
)
SELECT
  id, name, slogan, ward, address, lat, lng, opening_hours, hotline, fast_2h,
  express_delivery_2h, in_stock_films, district, fanpage_url, image_url,
  product_image_url, min_roll_price, max_roll_price, cheapest_roll_name, locations,
  services, status, created_at, updated_at
FROM film_labs WHERE min_roll_price > 0 OR max_roll_price > 0;

DELETE FROM film_labs
WHERE (min_roll_price > 0 OR max_roll_price > 0)
  AND id IN (SELECT id FROM film_shops);
