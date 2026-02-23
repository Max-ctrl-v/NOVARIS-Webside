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
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await page.setCacheEnabled(false);
  await page.goto('http://localhost:3000?v=' + Date.now(), { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => {
    const s = document.createElement('style');
    s.textContent = '* { animation-duration:0.001s !important; animation-delay:0s !important; transition-delay:0s !important; }';
    document.head.appendChild(s);
    // Force step visibility
    document.querySelectorAll('.step-wrap').forEach(el => el.classList.add('step-visible'));
    const line = document.getElementById('step-line');
    if (line) line.style.width = '100%';
  });
  await new Promise(r => setTimeout(r, 500));

  // Trust bar crop
  const tbBox = await page.evaluate(() => {
    const el = document.querySelector('[data-section="trust"]') || document.querySelectorAll('section')[1];
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height };
  });
  await page.screenshot({ path: path.join(__dirname, 'temporary screenshots', 'trustbar-crop.png'),
    clip: { x: 0, y: tbBox.y, width: 1440, height: tbBox.h } });
  console.log('✅ Trust bar');

  // Process section crop
  const pBox = await page.evaluate(() => {
    const el = document.getElementById('prozess');
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height };
  });
  await page.screenshot({ path: path.join(__dirname, 'temporary screenshots', 'process-crop.png'),
    clip: { x: 0, y: pBox.y, width: 1440, height: pBox.h } });
  console.log('✅ Process section');

  // FAQ section crop
  const faqBox = await page.evaluate(() => {
    const el = document.getElementById('faq');
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height };
  });
  await page.screenshot({ path: path.join(__dirname, 'temporary screenshots', 'faq-crop.png'),
    clip: { x: 0, y: faqBox.y, width: 1440, height: faqBox.h } });
  console.log('✅ FAQ section');

  await browser.close();
})();
