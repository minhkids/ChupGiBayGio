-- Public partner onboarding fields, preserved separately from existing admin CMS data.
ALTER TABLE film_labs ADD COLUMN district TEXT NOT NULL DEFAULT '';
ALTER TABLE film_labs ADD COLUMN fanpage_url TEXT NOT NULL DEFAULT '';
ALTER TABLE film_labs ADD COLUMN image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE film_labs ADD COLUMN status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending_review'));
ALTER TABLE photographers ADD COLUMN preferred_spots TEXT NOT NULL DEFAULT '[]';
ALTER TABLE photographers ADD COLUMN facebook_url TEXT NOT NULL DEFAULT '';
ALTER TABLE photographers ADD COLUMN status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending_review'));
ALTER TABLE photographer_packages ADD COLUMN delivered_photos_text TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_film_labs_status ON film_labs(status);
CREATE INDEX IF NOT EXISTS idx_photographers_status ON photographers(status);
