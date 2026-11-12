import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

const schema = readFileSync(new URL('../../db/schema.sql', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../../migrations/0021_christmas_place_category.sql', import.meta.url), 'utf8');

describe('Giáng Sinh place category migration', () => {
  it('adds CHRISTMAS and assigns spots that already use that concept tag, once', () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(schema);
      db.prepare('DELETE FROM place_categories WHERE id = ?').run('CHRISTMAS');
      const insert = db.prepare(`INSERT INTO spots (id, region_id, name, slug, address, lat, lng, best_time_of_day, best_time_description, cost_type, cover_image_url, description, seasonal_trend)
        VALUES (?, 'hanoi', ?, ?, 'Hà Nội', 21, 105, 'evening', '', 'FREE', '/pending.svg', '', ?)`);
      insert.run('cafe', 'Si Mê Cafe & Tea', 'si-me', JSON.stringify({ conceptTags: ['CHRISTMAS', 'VINTAGE'], placeCategories: ['CAFE'], trendTitle: 'Noel' }));
      insert.run('tag-only', 'Mood kafe', 'mood', JSON.stringify({ conceptTags: ['CHRISTMAS'], status: 'ACTIVE' }));
      insert.run('already', 'Là Sol', 'la-sol', JSON.stringify({ conceptTags: ['CHRISTMAS'], placeCategories: ['CAFE', 'CHRISTMAS'] }));
      insert.run('vintage', 'Phố cổ', 'pho-co', JSON.stringify({ conceptTags: ['VINTAGE'], placeCategories: ['VINTAGE'] }));
      insert.run('invalid', 'Bad', 'bad', 'not-json');

      db.exec(migration);
      db.exec(migration);

      expect(db.prepare('SELECT id, label, sort_order FROM place_categories WHERE id = ?').get('CHRISTMAS')).toMatchObject({ id: 'CHRISTMAS', label: 'Giáng Sinh', sort_order: 6 });
      expect(db.prepare('SELECT COUNT(*) AS count FROM place_categories WHERE id = ?').get('CHRISTMAS')).toMatchObject({ count: 1 });
      const trend = (id: string) => JSON.parse(String((db.prepare('SELECT seasonal_trend FROM spots WHERE id = ?').get(id) as { seasonal_trend: string }).seasonal_trend));
      expect(trend('cafe')).toMatchObject({ conceptTags: ['CHRISTMAS', 'VINTAGE'], placeCategories: ['CAFE', 'CHRISTMAS'], trendTitle: 'Noel' });
      expect(trend('tag-only')).toMatchObject({ conceptTags: ['CHRISTMAS'], status: 'ACTIVE', placeCategories: ['CHRISTMAS'] });
      expect(trend('already').placeCategories).toEqual(['CAFE', 'CHRISTMAS']);
      expect(trend('vintage').placeCategories).toEqual(['VINTAGE']);
      expect((db.prepare('SELECT seasonal_trend FROM spots WHERE id = ?').get('invalid') as { seasonal_trend: string }).seasonal_trend).toBe('not-json');
    } finally {
      db.close();
    }
  });
});
