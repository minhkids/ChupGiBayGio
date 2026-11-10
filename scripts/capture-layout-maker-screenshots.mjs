/**
 * Generates filled layout exports for the PR (requires: npm run build && npm run vite:preview).
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = '/opt/cursor/artifacts/layout-maker';

const SAMPLES = [
  'post_4_0.jpg',
  'post_4_1.jpg',
  'post_4_2.jpg',
  'post_5_0.jpg',
  'post_5_1.jpg',
  'post_6_0.jpg',
  'post_7_0.jpg',
  'post_8_0.jpg',
];

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173';

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const layouts = [
    { theme: 'Mùa đông Hà Nội', layout: 'Collage Mùa Đông', slots: 6, file: 'collage-winter.jpg' },
    { theme: 'Mùa đông Hà Nội', layout: 'Photobooth 4 ảnh', slots: 4, file: 'strip-winter.jpg' },
    { theme: 'Vintage', layout: 'Bưu thiếp Phố cổ', slots: 2, file: 'postcard-vintage.jpg' },
  ];

  for (const spec of layouts) {
    await page.goto(`${baseUrl}/tao-anh`);
    await page.getByRole('button', { name: spec.theme }).click();
    await page.getByRole('button', { name: spec.layout }).click();

    for (let i = 0; i < spec.slots; i++) {
      const sample = path.join(root, 'public/facebook_media', SAMPLES[i % SAMPLES.length]);
      await page.getByRole('button', { name: /^Ô/ }).nth(i).click();
      await page.locator('input[type="file"]').setInputFiles(sample);
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: path.join(outDir, spec.file.replace('.jpg', '-ui.png')), fullPage: true });

    const exportResult = await page.evaluate(async () => {
      const canvas = document.querySelector('canvas[aria-hidden]');
      if (!canvas) return null;
      return canvas.toDataURL('image/jpeg', 0.9);
    });

    // Trigger export to render export canvas
    await page.getByRole('button', { name: /Tải ảnh/ }).click();
    await page.waitForTimeout(800);

    const dataUrl = await page.evaluate(() => {
      const canvases = [...document.querySelectorAll('canvas')];
      const hidden = canvases.find((c) => c.classList.contains('hidden'));
      return hidden?.toDataURL('image/jpeg', 0.92) ?? null;
    });

    if (dataUrl) {
      const b64 = dataUrl.split(',')[1];
      fs.writeFileSync(path.join(outDir, spec.file), Buffer.from(b64, 'base64'));
    }
    void exportResult;
  }

  await browser.close();
  console.log('Wrote screenshots to', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
