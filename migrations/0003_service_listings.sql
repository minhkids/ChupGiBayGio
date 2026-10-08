-- Admin-managed content for the Shoot Services Hub
CREATE TABLE IF NOT EXISTS service_listings (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('rental', 'outfit', 'photographer', 'filmLab', 'filmColor')),
  name TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_listings_category_active
  ON service_listings(category, is_active, created_at DESC);
