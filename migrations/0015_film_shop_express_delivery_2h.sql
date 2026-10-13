ALTER TABLE film_labs
  ADD COLUMN express_delivery_2h INTEGER NOT NULL DEFAULT 0
  CHECK (express_delivery_2h IN (0, 1));
