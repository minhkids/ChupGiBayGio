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
