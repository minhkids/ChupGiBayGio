import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8');

describe('independent lab and film shop storage', () => {
  it('allows the same business in both tables and isolates edits and deletion', () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(read('../../db/schema.sql'));
      db.exec("INSERT INTO film_labs (id, name, hotline) VALUES ('lab', 'Cinephile', '0889969127')");
      db.exec("INSERT INTO film_shops (id, name, hotline, min_roll_price) VALUES ('shop', 'Cinephile', '0889969127', 224000)");
      db.exec("UPDATE film_labs SET name = 'Cinephile Lab' WHERE id = 'lab'");
      expect(db.prepare("SELECT name, min_roll_price FROM film_shops WHERE id = 'shop'").get()).toMatchObject({ name: 'Cinephile', min_roll_price: 224000 });
      db.exec("DELETE FROM film_labs WHERE id = 'lab'");
      expect(db.prepare('SELECT count(*) AS count FROM film_shops').get()).toMatchObject({ count: 1 });
    } finally { db.close(); }
  });

  it('moves legacy retail records without altering any value or unpriced lab', () => {
    const db = new DatabaseSync(':memory:');
    try {
      const dir = new URL('../../migrations/', import.meta.url);
      for (const file of readdirSync(dir).filter(name => /^00(?:0[1-9]|1[0-6])_/.test(name)).sort()) {
        db.exec(readFileSync(new URL(file, dir), 'utf8'));
      }
      db.exec(`INSERT INTO film_labs (id, name, hotline, min_roll_price, max_roll_price, cheapest_roll_name, in_stock_films, address, lat, lng, image_url, locations, status)
        VALUES ('retail', 'Cinephile - Líu Lo', '0889969127', 224000, 524000, 'Kodak Gold 24e', '["Kodak Gold 24e"]', 'Vạn Bảo', NULL, NULL, '/cover.jpg', '[{"ward":"Liễu Giai","district":"Ba Đình"}]', 'published'),
               ('pending-shop', 'Pending', '', 0, 100000, '', '[]', '', 21.03, 105.8, '', '[]', 'pending_review'),
               ('lab-only', 'Lab without retail', '', 0, 0, '', '[]', '', NULL, NULL, '', '[]', 'published');`);
      const before = db.prepare('SELECT * FROM film_labs ORDER BY id').all();
      db.exec(read('../../migrations/0020_separate_film_shops.sql'));
      const labs = db.prepare('SELECT * FROM film_labs').all();
      const shops = db.prepare('SELECT * FROM film_shops ORDER BY id').all();
      expect(labs).toHaveLength(1);
      expect(shops).toHaveLength(2);
      expect(labs[0]).toMatchObject(before.find(row => row.id === 'lab-only')!);
      for (const shop of shops) expect(shop).toMatchObject(before.find(row => row.id === shop.id)!);
      expect(db.prepare('SELECT services FROM film_labs').get()).toMatchObject({ services: '[]' });
    } finally { db.close(); }
  });
});
