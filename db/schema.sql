PRAGMA foreign_keys = ON;

-- Compatible with migrations/0001_initial_schema.sql; admin fields added below.
CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL DEFAULT 'hanoi',
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  lat REAL NOT NULL DEFAULT 0,
  lng REAL NOT NULL DEFAULT 0,
  best_time_of_day TEXT NOT NULL DEFAULT 'afternoon',
  best_time_description TEXT NOT NULL DEFAULT '',
  lighting_notes TEXT,
  sun_orientation TEXT,
  cost_type TEXT NOT NULL DEFAULT 'FREE',
  ticket_price_range TEXT,
  camera_fee_policy TEXT,
  recommended_lenses TEXT NOT NULL DEFAULT '[]',
  recommended_outfits TEXT NOT NULL DEFAULT '[]',
  color_palette TEXT NOT NULL DEFAULT '[]',
  crowd_level_by_hour TEXT NOT NULL DEFAULT '{}',
  cover_image_url TEXT NOT NULL DEFAULT '',
  gallery_urls TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  photography_tips TEXT NOT NULL DEFAULT '[]',
  pose_tip TEXT,
  seasonal_trend TEXT NOT NULL DEFAULT '{}',
  inspiration_posts TEXT NOT NULL DEFAULT '[]',
  recent_reports TEXT NOT NULL DEFAULT '[]',
  saves_count INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  district TEXT,
  best_months TEXT NOT NULL DEFAULT '[]',
  golden_hour TEXT,
  entry_fee TEXT,
  parking_fee TEXT,
  source_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_spots_region ON spots(region_id);
CREATE INDEX IF NOT EXISTS idx_spots_slug ON spots(slug);
CREATE INDEX IF NOT EXISTS idx_spots_active ON spots(is_active);

CREATE TABLE IF NOT EXISTS outfits (
  id TEXT PRIMARY KEY,
  spot_id TEXT,
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
CREATE INDEX IF NOT EXISTS idx_outfits_spot ON outfits(spot_id);

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

CREATE TABLE IF NOT EXISTS trend_articles (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('hotTrend', 'upcomingSpot')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  region_id TEXT NOT NULL DEFAULT 'all',
  source_url TEXT NOT NULL DEFAULT '',
  is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_trend_articles_feed
  ON trend_articles(is_published, section, created_at DESC);
