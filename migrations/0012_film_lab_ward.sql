-- Store only the shop's ward/commune; no street-level address is needed.
ALTER TABLE film_labs ADD COLUMN ward TEXT NOT NULL DEFAULT '';
