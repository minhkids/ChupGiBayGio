import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const output = process.env.TMPDIR || 'test-results';
await mkdir(output, { recursive: true });
try {
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('button', { name: /^Kế hoạch chụp/ }).first().click();
  const input = page.getByLabel('Tải ảnh mẫu lên');
  await input.setInputFiles({ name: 'reference.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64') });
  await page.getByLabel('Ghi chú ảnh 1').fill('Mẫu đứng cạnh xe hoa');
  await page.reload();
  await page.getByRole('button', { name: /^Kế hoạch chụp/ }).first().click();
  assert.equal(await page.getByLabel('Ghi chú ảnh 1').inputValue(), 'Mẫu đứng cạnh xe hoa');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xuất Thẻ Lịch Trình (Ảnh)' }).click();
  const download = await downloadPromise;
  const file = `${output}/visual-brief.png`;
  await download.saveAs(file);
  const png = await readFile(file);
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1440);
  assert.ok(png.readUInt32BE(20) >= 1920);
  await page.screenshot({ path: `${output}/visual-moodboard-desktop.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.getByLabel('Ghi chú ảnh 1').isVisible());
  await page.screenshot({ path: `${output}/visual-moodboard-mobile.png` });
  await page.getByLabel('Xóa ảnh mẫu 1').click();
  assert.equal(await page.getByLabel('Ghi chú ảnh 1').count(), 0);
  console.log(JSON.stringify({ upload: 'passed', persistence: 'passed', note: 'passed', remove: 'passed', png: file, width: png.readUInt32BE(16), height: png.readUInt32BE(20), bytes: png.length }));
} finally {
  await browser.close();
}
