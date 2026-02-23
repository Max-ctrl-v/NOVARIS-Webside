import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.setCacheEnabled(false);
  await page.goto('http://localhost:3000?v=' + Date.now(), { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => {
    const s = document.createElement('style');
    s.textContent = '* { animation-duration: 0.001s !important; animation-delay: 0s !important; }';
    document.head.appendChild(s);
  });
  await new Promise(r => setTimeout(r, 300));

  // Nav crop (2x scale so 400px wide = 800px in image)
  await page.screenshot({
    path: path.join(__dirname, 'temporary screenshots', 'nav-crop.png'),
    clip: { x: 0, y: 0, width: 500, height: 80 }
  });
  console.log('✅ Nav crop done');
  await browser.close();
})();
