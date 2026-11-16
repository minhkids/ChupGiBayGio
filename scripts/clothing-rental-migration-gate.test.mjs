import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { REQUIRED_COLUMNS, migrationDecision, parseWranglerJson } from './clothing-rental-migration-gate.mjs';

const baseColumns = ['id', 'name', 'address', 'hotline', 'fanpage_url', 'daily_price', 'created_at', 'updated_at'];
const pragma = (names) => [{ success: true, results: names.map((name, cid) => ({ cid, name, type: 'TEXT' })) }];

describe('clothing rental production migration gate', () => {
  it('matches the additive columns declared in 0022', () => {
    const sql = readFileSync(new URL('../migrations/0022_clothing_rental_partner.sql', import.meta.url), 'utf8');
    const added = [...sql.matchAll(/ADD COLUMN (\w+)/g)].map((match) => match[1]);
    expect(added).toEqual(REQUIRED_COLUMNS);
    expect(sql).toMatch(/status TEXT NOT NULL DEFAULT 'published'/);
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS idx_rental_shops_status/);
    expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE|INSERT)\b/i);
  });

  it('applies only when none of the new columns exist', () => {
    expect(migrationDecision(pragma(baseColumns)).action).toBe('apply');
  });

  it('skips when every new column is already present', () => {
    expect(migrationDecision(pragma([...baseColumns, ...REQUIRED_COLUMNS])).action).toBe('skip');
  });

  it('fails closed when the schema is partial or the table is missing', () => {
    expect(migrationDecision(pragma([...baseColumns, 'contact_name'])).action).toBe('fail');
    expect(migrationDecision([{ success: true, results: [] }]).action).toBe('fail');
  });

  it('reads a wrangler JSON envelope, including log lines before the payload', () => {
    const payload = { result: pragma([...baseColumns, ...REQUIRED_COLUMNS]) };
    expect(migrationDecision(parseWranglerJson(`remote ready\n${JSON.stringify(payload)}`)).action).toBe('skip');
  });
});
