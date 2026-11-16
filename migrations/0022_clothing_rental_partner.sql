-- Public signup for clothing rental shops (áo dài, Việt phục, váy, đồ Noel…).
-- Existing admin rows stay published via the column default. Do not run this against a database from the app change; apply it with the project migration command before deploying the worker.
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
