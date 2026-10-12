-- Optional shop tagline, bounded for compact listing cards.
ALTER TABLE film_labs ADD COLUMN slogan TEXT NOT NULL DEFAULT '' CHECK (length(slogan) <= 50);
