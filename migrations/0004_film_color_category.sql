-- Extend the admin-managed directory with film color profiles.
DROP INDEX IF EXISTS idx_service_listings_category_active;

CREATE TABLE service_listings_updated (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('rental', 'outfit', 'photographer', 'filmLab', 'filmColor')),
  name TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO service_listings_updated (id, category, name, data, is_active, created_at, updated_at)
SELECT id, category, name, data, is_active, created_at, updated_at FROM service_listings;

DROP TABLE service_listings;
ALTER TABLE service_listings_updated RENAME TO service_listings;

CREATE INDEX idx_service_listings_category_active
  ON service_listings(category, is_active, created_at DESC);