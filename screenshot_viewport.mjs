import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const chromePaths = [
  `C:/Users/${process.env.USERNAME}/.cache/puppeteer/chrome`,
  'C:/Users/nateh/.cache/puppeteer/chrome',
];
let executablePath;
for (const p of chromePaths) {
  try {
    const entries = fs.readdirSync(p);
    for (const e of entries) {
      const c = path.join(p, e, 'chrome-win64', 'chrome.exe');
      if (fs.existsSync(c)) { executablePath = c; break; }
    }
    if (executablePath) break;
  } catch {}
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new', args: ['--no-sandbox'],
    ...(executablePath ? { executablePath } : {}),
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await page.setCacheEnabled(false);
  await page.goto('http://localhost:3000?v=' + Date.now(), { waitUntil: 'networkidle0', timeout: 30000 });
  // Force all CSS animations to complete instantly
  await page.evaluate(() => {
    const s = document.createElement('style');
    s.textContent = '* { animation-duration: 0.001s !important; animation-delay: 0s !important; }';
    document.head.appendChild(s);
  });
  await new Promise(r => setTimeout(r, 300));

  // Hero viewport
  await page.screenshot({
    path: path.join(outDir, 'screenshot-pass2-hero.png'),
    clip: { x: 0, y: 0, width: 1440, height: 880 }
  });
  console.log('✅ Hero');

  // Full page
  await page.screenshot({
    path: path.join(outDir, 'screenshot-pass2-fullpage.png'),
    fullPage: true
  });
  console.log('✅ Full page');

  // Mobile
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000?v=' + Date.now(), { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(outDir, 'screenshot-pass2-mobile.png'),
    fullPage: true
  });
  console.log('✅ Mobile');

  await browser.close();
})();
