-- Admin CMS entities; spots are extended in place to preserve existing spot data.
ALTER TABLE spots ADD COLUMN district TEXT;
ALTER TABLE spots ADD COLUMN best_months TEXT NOT NULL DEFAULT '[]';
ALTER TABLE spots ADD COLUMN golden_hour TEXT;
ALTER TABLE spots ADD COLUMN entry_fee TEXT;
ALTER TABLE spots ADD COLUMN parking_fee TEXT;
ALTER TABLE spots ADD COLUMN source_url TEXT;

CREATE TABLE IF NOT EXISTS outfits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  material TEXT NOT NULL DEFAULT '',
  estimated_price TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  hotspots TEXT NOT NULL DEFAULT '[]',
  shopee_url TEXT NOT NULL DEFAULT '',
  tiktok_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS rental_shops (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  hotline TEXT NOT NULL DEFAULT '',
  fanpage_url TEXT NOT NULL DEFAULT '',
  daily_price TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS photographers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  gear_body TEXT NOT NULL DEFAULT '',
  gear_lens TEXT NOT NULL DEFAULT '',
  styles TEXT NOT NULL DEFAULT '[]',
  portfolio_photos TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS photographer_packages (
  id TEXT PRIMARY KEY,
  photographer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  duration TEXT NOT NULL DEFAULT '',
  delivered_photos INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_photographer_packages_owner ON photographer_packages(photographer_id);
CREATE TABLE IF NOT EXISTS film_rolls (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  iso INTEGER NOT NULL DEFAULT 0,
  tone TEXT NOT NULL DEFAULT '',
  suitable_seasons TEXT NOT NULL DEFAULT '[]',
  package_image_url TEXT NOT NULL DEFAULT '',
  sample_image_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS film_labs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  lat REAL,
  lng REAL,
  opening_hours TEXT NOT NULL DEFAULT '',
  hotline TEXT NOT NULL DEFAULT '',
  fast_2h INTEGER NOT NULL DEFAULT 0,
  in_stock_films TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
