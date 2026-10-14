CREATE TABLE IF NOT EXISTS place_categories (
  id TEXT PRIMARY KEY CHECK (length(id) BETWEEN 1 AND 40),
  label TEXT NOT NULL UNIQUE CHECK (length(label) BETWEEN 1 AND 80),
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS update_place_categories_timestamp
AFTER UPDATE ON place_categories
BEGIN
  UPDATE place_categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

INSERT OR IGNORE INTO place_categories (id, label, sort_order) VALUES
  ('CAFE', 'Quán cà phê', 1),
  ('VINTAGE', 'Vintage', 2),
  ('SHOPPING_MALL', 'Trung tâm thương mại', 3),
  ('RED_RIVER', 'Gần sông Hồng', 4),
  ('SUNSET', 'Chụp hoàng hôn', 5);
