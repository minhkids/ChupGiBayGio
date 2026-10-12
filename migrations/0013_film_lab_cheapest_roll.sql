-- Name the cheapest film roll sold by each shop for clear price comparison.
ALTER TABLE film_labs ADD COLUMN cheapest_roll_name TEXT NOT NULL DEFAULT '';
