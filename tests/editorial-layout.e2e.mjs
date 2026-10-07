import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
try {
  await page.goto('http://127.0.0.1:5173');
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
  await expect(page.getByPlaceholder('Tìm điểm, loài hoa, quán cafe...')).toBeVisible();
  await page.getByPlaceholder('Tìm điểm, loài hoa, quán cafe...').fill('không-có-địa-điểm-này');
  await expect(page.getByText('Không có điểm phù hợp. Thử đổi tháng hoặc bỏ bớt bộ lọc.')).toBeVisible();
  await page.getByPlaceholder('Tìm điểm, loài hoa, quán cafe...').fill('');
  const marker = page.locator('.editorial-map-pin').first();
  await expect(marker).toBeVisible();
  await marker.click();
  await expect(page.getByRole('tab', { name: 'Bối cảnh & Góc chụp' })).toBeVisible();
  await page.getByRole('tab', { name: 'Mặc gì & Nơi mua' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /^Kế hoạch chụp/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Bóc đồ từ ảnh', exact: true }).click();
  await page.getByLabel('Tải ảnh trang phục').setInputFiles({ name: 'look.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64') });
  await expect(page.getByRole('status')).toHaveText('Đã thêm ảnh vào kế hoạch chụp.');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
  await page.locator('.editorial-map-pin').first().click({ force: true });
  await expect(page.getByRole('tabpanel')).toBeVisible();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: `${process.env.TMPDIR}/editorial-mobile.png` });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tabpanel')).toBeHidden();
  console.log('PASS: navigation, search, empty state, marker → dossier, tabs, planner, upload entry, mobile overflow');
} finally {
  await browser.close();
}
