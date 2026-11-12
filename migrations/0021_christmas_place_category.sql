-- Map style chip "Giáng Sinh". The id matches the existing CHRISTMAS concept tag.
INSERT OR IGNORE INTO place_categories (id, label, sort_order)
SELECT 'CHRISTMAS', 'Giáng Sinh', COALESCE(MAX(sort_order), 0) + 1 FROM place_categories;

-- Spots already marked with concept tag CHRISTMAS should show under this chip.
UPDATE spots
SET seasonal_trend = json_set(
  seasonal_trend,
  '$.placeCategories',
  json_insert(
    CASE
      WHEN json_type(seasonal_trend, '$.placeCategories') = 'array'
      THEN json_extract(seasonal_trend, '$.placeCategories')
      ELSE json('[]')
    END,
    '$[#]',
    'CHRISTMAS'
  )
)
WHERE json_valid(seasonal_trend)
  AND EXISTS (
    SELECT 1
    FROM json_each(json_extract(seasonal_trend, '$.conceptTags'))
    WHERE value = 'CHRISTMAS'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM json_each(
      CASE
        WHEN json_type(seasonal_trend, '$.placeCategories') = 'array'
        THEN json_extract(seasonal_trend, '$.placeCategories')
        ELSE json('[]')
      END
    )
    WHERE value = 'CHRISTMAS'
  );
