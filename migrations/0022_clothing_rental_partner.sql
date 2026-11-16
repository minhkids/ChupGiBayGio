-- Additive columns for clothing rental signup. Existing rows are not rewritten:
-- every new column has a default, and status defaults to 'published'.
-- Do not apply this with `wrangler d1 migrations apply`. Production runs this file
-- alone, and only when PRAGMA table_info(rental_shops) shows these columns are absent.
ALTER TABLE rental_shops ADD COLUMN contact_name TEXT NOT NULL DEFAULT '';
ALTER TABLE rental_shops ADD COLUMN instagram_url TEXT NOT NULL DEFAULT '';
ALTER TABLE rental_shops ADD COLUMN threads_url TEXT NOT NULL DEFAULT '';
ALTER TABLE rental_shops ADD COLUMN facebook_url TEXT NOT NULL DEFAULT '';
ALTER TABLE rental_shops ADD COLUMN district TEXT NOT NULL DEFAULT '';
ALTER TABLE rental_shops ADD COLUMN ward TEXT NOT NULL DEFAULT '';
ALTER TABLE rental_shops ADD COLUMN styles TEXT NOT NULL DEFAULT '[]';
ALTER TABLE rental_shops ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE rental_shops ADD COLUMN image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE rental_shops ADD COLUMN sample_photos TEXT NOT NULL DEFAULT '[]';
ALTER TABLE rental_shops ADD COLUMN price_min INTEGER NOT NULL DEFAULT 0;
ALTER TABLE rental_shops ADD COLUMN price_max INTEGER NOT NULL DEFAULT 0;
ALTER TABLE rental_shops ADD COLUMN status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending_review'));
CREATE INDEX IF NOT EXISTS idx_rental_shops_status ON rental_shops(status);
