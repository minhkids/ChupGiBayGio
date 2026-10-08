-- Public studio/meeting address is optional; do not expose a photographer's private home by default.
ALTER TABLE photographers ADD COLUMN address TEXT NOT NULL DEFAULT '';
ALTER TABLE photographers ADD COLUMN district TEXT NOT NULL DEFAULT '';
