-- Cloudflare D1 Migration: 0002_post_outfits.sql
-- Table: post_outfits (Visual Outfit Tap-to-Shop)
-- Links directly to inspiration_posts / social_posts

CREATE TABLE IF NOT EXISTS post_outfits (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  spot_id TEXT,
  image_url TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'AO_DAI', 'DRESS', 'JACKET', 'PROP', 'SET', 'ACCESSORY'
  color TEXT,
  style TEXT,
  x_percent REAL NOT NULL, -- 0.0 to 100.0 (X coordinate % on image)
  y_percent REAL NOT NULL, -- 0.0 to 100.0 (Y coordinate % on image)
  search_query TEXT NOT NULL,
  price_estimate TEXT,
  shopee_url TEXT NOT NULL,
  tiktok_url TEXT NOT NULL,
  similar_items TEXT, -- JSON array of SimilarProduct [{ id, name, priceEstimate, shopeeUrl, tiktokUrl }]
  ai_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES inspiration_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE SET NULL
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_post_outfits_post ON post_outfits(post_id);
CREATE INDEX IF NOT EXISTS idx_post_outfits_spot ON post_outfits(spot_id);
CREATE INDEX IF NOT EXISTS idx_post_outfits_category ON post_outfits(category);
