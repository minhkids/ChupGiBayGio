// Decides whether production may run migrations/0022_clothing_rental_partner.sql.
// The SQL file only adds columns; re-running ALTER TABLE fails once they exist.

export const REQUIRED_COLUMNS = [
  'contact_name',
  'instagram_url',
  'threads_url',
  'facebook_url',
  'district',
  'ward',
  'styles',
  'description',
  'image_url',
  'sample_photos',
  'price_min',
  'price_max',
  'status',
];

export function parseWranglerJson(text) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) throw new Error('Wrangler returned no output for PRAGMA table_info(rental_shops).');
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.search(/[\[{]/);
    if (start < 0) throw new Error('Wrangler returned no JSON for PRAGMA table_info(rental_shops).');
    return JSON.parse(trimmed.slice(start));
  }
}

function columnRows(payload) {
  if (Array.isArray(payload)) {
    return payload.flatMap((entry) => Array.isArray(entry?.results) ? entry.results : []);
  }
  if (payload && Array.isArray(payload.result)) return columnRows(payload.result);
  if (payload && Array.isArray(payload.results)) return payload.results;
  throw new Error('Unrecognized PRAGMA table_info(rental_shops) response.');
}

export function migrationDecision(payload) {
  const rows = columnRows(payload);
  if (!rows.length) {
    return { action: 'fail', message: 'PRAGMA table_info(rental_shops) returned no columns. Refusing to change production.' };
  }
  const names = new Set(rows.map((row) => String(row?.name ?? '')));
  const present = REQUIRED_COLUMNS.filter((column) => names.has(column));
  if (present.length === REQUIRED_COLUMNS.length) return { action: 'skip' };
  if (present.length === 0) return { action: 'apply' };
  const missing = REQUIRED_COLUMNS.filter((column) => !names.has(column));
  return {
    action: 'fail',
    message: `rental_shops is only partly migrated. Present: ${present.join(', ')}. Missing: ${missing.join(', ')}.`,
  };
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === new URL(`file://${entry}`).href || import.meta.url.endsWith(entry);
}

if (isDirectRun()) {
  const fs = await import('node:fs');
  try {
    const decision = migrationDecision(parseWranglerJson(fs.readFileSync(0, 'utf8')));
    if (decision.action === 'fail') {
      console.error(decision.message);
      process.exit(1);
    }
    process.stdout.write(`${decision.action}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Could not read the rental_shops schema.');
    process.exit(1);
  }
}
