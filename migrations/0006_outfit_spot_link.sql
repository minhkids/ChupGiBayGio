ALTER TABLE outfits ADD COLUMN spot_id TEXT;
CREATE INDEX IF NOT EXISTS idx_outfits_spot ON outfits(spot_id);
