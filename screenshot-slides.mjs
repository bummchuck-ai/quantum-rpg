import { chromium } from 'playwright-core';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = '/home/user/Desktop/quantum-rpg-slides';
const SLIDE_NAMES = ['01-WAS', '02-WER', '03-WANN', '04-WO', '05-WARUM', '06-WIE'];

async function run() {
  const browser = await chromium.launch({
    executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1920 });

  const filePath = path.join(__dirname, 'public', 'slides.html');
  await page.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Wait for scripts to execute
  await page.waitForFunction(() => window.__SLIDES_READY === true, { timeout: 10000 });
  // Extra wait for fonts
  await page.waitForTimeout(2000);

  for (let i = 0; i < 6; i++) {
    const slideId = `slide-${i + 1}`;
    const el = page.locator(`#${slideId}`);
    await el.screenshot({
      path: path.join(OUTPUT_DIR, `${SLIDE_NAMES[i]}.png`),
      type: 'png',
    });
    console.log(`✓ ${SLIDE_NAMES[i]}.png`);
  }

  await browser.close();
  console.log(`\nAll 6 slides saved to: ${OUTPUT_DIR}`);
}

run().catch(e => { console.error(e); process.exit(1); });
