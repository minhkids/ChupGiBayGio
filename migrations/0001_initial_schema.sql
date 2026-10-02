-- Cloudflare D1 Migration: 0001_initial_schema.sql
-- Run: npm run cf:d1:migrate

-- Spots table
CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  best_time_of_day TEXT NOT NULL,
  best_time_description TEXT NOT NULL,
  lighting_notes TEXT,
  sun_orientation TEXT,
  cost_type TEXT NOT NULL,
  ticket_price_range TEXT,
  camera_fee_policy TEXT,
  recommended_lenses TEXT, -- JSON array
  recommended_outfits TEXT, -- JSON array
  color_palette TEXT, -- JSON array
  crowd_level_by_hour TEXT, -- JSON object
  cover_image_url TEXT NOT NULL,
  gallery_urls TEXT, -- JSON array
  description TEXT NOT NULL,
  photography_tips TEXT, -- JSON array
  pose_tip TEXT,
  seasonal_trend TEXT, -- JSON object
  inspiration_posts TEXT, -- JSON array
  recent_reports TEXT, -- JSON array
  saves_count INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for spots
CREATE INDEX IF NOT EXISTS idx_spots_region ON spots(region_id);
CREATE INDEX IF NOT EXISTS idx_spots_slug ON spots(slug);
CREATE INDEX IF NOT EXISTS idx_spots_active ON spots(is_active);
CREATE INDEX IF NOT EXISTS idx_spots_featured ON spots(is_featured);
CREATE INDEX IF NOT EXISTS idx_spots_coords ON spots(lat, lng);

-- Inspiration Posts table
CREATE TABLE IF NOT EXISTS inspiration_posts (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_handle TEXT,
  author_avatar TEXT,
  thumbnail_url TEXT,
  gallery_urls TEXT, -- JSON array
  post_url TEXT,
  group_name TEXT,
  group_url TEXT,
  post_date TEXT,
  caption TEXT,
  full_content TEXT,
  palette_hex TEXT, -- JSON array
  pose_tip TEXT,
  camera_settings TEXT,
  likes_count TEXT,
  comments_count TEXT,
  shares_count TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
);

-- Community Reports table
CREATE TABLE IF NOT EXISTS community_reports (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  reported_at TEXT NOT NULL,
  bloom_percentage INTEGER,
  crowd_level TEXT,
  notes TEXT,
  weather TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
);

-- Users table (for auth if needed)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT NOT NULL, -- 'github', 'google', 'email'
  provider_id TEXT NOT NULL,
  role TEXT DEFAULT 'user', -- 'user', 'admin', 'moderator'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Saved spots (bookmarks)
CREATE TABLE IF NOT EXISTS saved_spots (
  user_id TEXT NOT NULL,
  spot_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, spot_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
);

-- Submitted spots (crowdsourcing)
CREATE TABLE IF NOT EXISTS submitted_spots (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  description TEXT,
  photos TEXT, -- JSON array of R2 keys
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- R2 Assets metadata
CREATE TABLE IF NOT EXISTS assets (
  key TEXT PRIMARY KEY,
  bucket TEXT NOT NULL,
  spot_id TEXT,
  user_id TEXT,
  content_type TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_spots_timestamp
AFTER UPDATE ON spots
BEGIN
  UPDATE spots SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Views for common queries
CREATE VIEW IF NOT EXISTS spots_with_trend AS
SELECT
  s.*,
  json_extract(s.seasonal_trend, '$.status') as trend_status,
  json_extract(s.seasonal_trend, '$.trendScore') as trend_score,
  json_extract(s.seasonal_trend, '$.bloomPercentage') as bloom_percentage
FROM spots s
WHERE s.is_active = 1;

-- Full-text search virtual table (if using FTS5)
-- CREATE VIRTUAL TABLE IF NOT EXISTS spots_fts USING fts5(
--   name, address, description, slug,
--   content='spots', content_rowid='rowid'
-- );
-- CREATE TRIGGER IF NOT EXISTS spots_ai AFTER INSERT ON spots BEGIN
--   INSERT INTO spots_fts(rowid, name, address, description, slug)
--   VALUES (new.rowid, new.name, new.address, new.description, new.slug);
-- END;