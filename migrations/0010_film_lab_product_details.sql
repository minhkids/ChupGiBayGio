-- Film shop product detail and comparable per-roll price range.
ALTER TABLE film_labs ADD COLUMN product_image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE film_labs ADD COLUMN min_roll_price INTEGER NOT NULL DEFAULT 0;
ALTER TABLE film_labs ADD COLUMN max_roll_price INTEGER NOT NULL DEFAULT 0;
