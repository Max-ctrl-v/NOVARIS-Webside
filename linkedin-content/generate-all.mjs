import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Find Chrome
const chromePaths = ['C:/Users/nateh/.cache/puppeteer/chrome', `C:/Users/${process.env.USERNAME}/.cache/puppeteer/chrome`];
let executablePath;
for (const p of chromePaths) {
  try {
    const entries = fs.readdirSync(p);
    for (const entry of entries) {
      const candidate = path.join(p, entry, 'chrome-win64', 'chrome.exe');
      if (fs.existsSync(candidate)) { executablePath = candidate; break; }
    }
    if (executablePath) break;
  } catch {}
}

const BASE = 'http://localhost:3000/linkedin-content/post-templates';

// ═══ BIG NUMBER POSTS ═══
const bigNumbers = [
  { file: 'w01-35pct', n: '35%', s: 'Ihrer F&E-Kosten zurück', d: 'Direkt als Steuergutschrift. Ohne Rückzahlung. Jedes Jahr.' },
  { file: 'w05-0euro', n: '€0', s: 'So viel lassen 85% der Unternehmen liegen', d: 'Ihr Wettbewerber holt sich Geld zurück. Sie nicht.', c: 'red' },
  { file: 'w06-rechner', n: '113k €', s: 'Bei nur 5 Entwicklern', d: '5 Entwickler × 65.000 € × 35 % = Ihre Forschungszulage. Jedes Jahr.', c: 'green', size: 'small' },
  { file: 'w08-100pct', n: '100%', s: 'Erfolgsquote', d: 'Kein einziger Antrag abgelehnt. Bei keinem einzigen Kunden. Jemals.', c: 'green' },
  { file: 'w16-zahlen', n: '4,2M €', s: 'Maximale Förderung pro Jahr', d: 'Bemessungsgrundlage: 12 Mio. € × 35 % KMU-Fördersatz', size: 'small' },
  { file: 'w21-4mio', n: '4.200.000 €', s: 'Das ist kein Tippfehler', d: 'Maximale Forschungszulage pro Jahr für KMU. Jedes Jahr aufs Neue.', size: 'xsmall' },
  { file: 'w25-40euro', n: '40€/h', s: 'Pauschale für Eigenleistungen', d: 'Auch Einzelunternehmer können eigene F&E-Stunden geltend machen.', c: 'gold', size: 'small' },
  { file: 'w30-60pct', n: '60%', s: 'Auftragsforschung förderfähig', d: 'Unis, Fraunhofer, externe Partner — 60 % der Kosten anrechenbar.' },
  { file: 'w33-kmu-bonus', n: '35%', s: 'statt 25 % — der KMU-Bonus', d: 'Seit 2024 erhalten kleine und mittlere Unternehmen 10 % mehr.', c: 'green' },
  { file: 'w04-2020', n: '2020', s: 'Rückwirkend beantragbar', d: 'Aber das Fenster schließt sich. Jeder Tag zählt.', c: 'gold' },
  { file: 'w32-startup', n: '€0 Steuern?', s: 'Trotzdem Geld zurück!', d: 'Die Forschungszulage ist eine Gutschrift — auch bei Verlust wird ausgezahlt.', size: 'small' },
  { file: 'w39-europa', n: '#1', s: 'Deutschland in Europa', d: 'Eine der großzügigsten steuerlichen F&E-Förderungen weltweit.', c: 'gold' },
  { file: 'w42-12mio', n: '12 Mio. €', s: 'Bemessungsgrundlage pro Jahr', d: 'Die Obergrenze für förderfähige F&E-Aufwendungen seit 2024.', size: 'small' },
  { file: 'w46-neuerungen', n: '2026', s: 'Was hat sich geändert?', d: '35 % KMU-Satz · 12 Mio. Bemessungsgrundlage · Sachkosten teilweise förderfähig' },
  { file: 'w49-countdown', n: '4', s: 'Wochen bis Jahresende', d: 'Jetzt starten = BSFZ-Bescheinigung noch 2026 möglich.', c: 'red' },
  { file: 'w52-2027', n: '2027', s: 'Ihr Jahr für die Forschungszulage', d: 'Starten Sie mit einem finanziellen Vorsprung ins neue Jahr.', c: 'green' },
  { file: 'w15-stats', n: '30.000+', s: 'Anträge seit 2020 bewilligt', d: 'Durchschnittliche Förderung: ca. 180.000 € pro Antrag.', size: 'small' },
  { file: 'w27-null', n: '0', s: 'Gründe, NICHT zu beantragen', d: 'Kein Risiko. Kein Aufwand. Kein Haken. Null Gründe.', c: 'red' },
];

// ═══ MYTH BUSTER POSTS ═══
const mythBusterTemplate = `${BASE}/myth-buster.html`;
const myths = [
  { file: 'w02-mythos-forschung', myth: 'Wir machen keine Forschung', truth: '8 von 10 Unternehmen haben förderfähige F&E-Projekte.', desc: 'Produktentwicklung, Prototypenbau, Optimierung — das alles kann Forschung im Sinne des FZulG sein.' },
  { file: 'w14-mythos-aufwand', myth: 'Die Forschungszulage lohnt sich nicht', truth: '2 Stunden Aufwand → 5- bis 6-stellige Steuergutschrift.', desc: 'Wir machen die Arbeit. Sie unterschreiben. Erfolgsbasiert.' },
  { file: 'w28-gobd', myth: 'Excel reicht als Zeiterfassung', truth: 'Das Finanzamt akzeptiert keine änderbaren Dateien.', desc: 'GoBD-konforme Dokumentation ist Pflicht. Wir richten sie ein.' },
  { file: 'w34-steuerberater', myth: 'Mein Steuerberater hätte das gesagt', truth: 'Die meisten Steuerberater haben kein F&E-Know-how.', desc: 'Der BSFZ-Antrag erfordert technisches Wissen — nicht steuerliches.' },
  { file: 'w43-pruefung', myth: 'Das Finanzamt macht Ärger', truth: 'Bei sauberer Dokumentation: Null Risiko.', desc: 'Die BSFZ bescheinigt — das Finanzamt hinterfragt nicht.' },
];

// ═══ BEFORE/AFTER POSTS ═══
const beforeAfterTemplate = `${BASE}/before-after.html`;
const stories = [
  { file: 'w03-maschinenbau-380k', badge: 'Erfolgsgeschichte', title: 'Maschinenbau-KMU holt', amount: '€ 380.000', titleEnd: 'zurück.',
    b1v: '€ 0', b1l: 'Forschungszulage beantragt', b2v: '0', b2l: 'Projekte dokumentiert', b3v: 'Keine', b3l: 'GoBD-konforme Zeiterfassung',
    a1v: '€ 380k', a1l: 'Steuergutschrift erhalten', a2v: '4', a2l: 'Projekte förderfähig', a3v: '3 Jahre', a3l: 'Rückwirkend beantragt',
    footer: '45 Mitarbeiter · 8 Ingenieure · Zeitaufwand: <10h' },
  { file: 'w22-horror-205k', badge: 'Zu spät gekommen', title: 'Unternehmen verliert', amount: '€ 205.000', titleEnd: 'für immer.',
    b1v: '2020', b1l: 'Bescheid bestandskräftig', b2v: '2021', b2l: 'Bescheid bestandskräftig', b3v: '€ 205k', b3l: 'Unwiderruflich verloren',
    a1v: '2022-26', a1l: 'Noch beantragbar', a2v: '€ 480k', a2l: 'Potenzial gerettet', a3v: 'Jetzt', a3l: 'Handeln Sie sofort',
    footer: 'Warten kostet Geld. Jeden Tag.', isRed: true },
  { file: 'w33-it-520k', badge: 'Erfolgsgeschichte', title: 'IT-Unternehmen sichert sich', amount: '€ 520.000', titleEnd: 'Steuergutschrift.',
    b1v: '€ 0', b1l: 'Je beantragt', b2v: '80', b2l: 'Mitarbeiter, 15 Entwickler', b3v: '0', b3l: 'Projekte dokumentiert',
    a1v: '€ 520k', a1l: 'Zurückerhalten', a2v: '6', a2l: 'F&E-Projekte identifiziert', a3v: '4 Jahre', a3l: 'Rückwirkend geholt',
    footer: '80 Mitarbeiter · 15 Entwickler · 2 Workshops à 90 Min' },
  { file: 'w40-bau-145k', badge: 'Erfolgsgeschichte', title: 'Bauunternehmen holt', amount: '€ 145.000', titleEnd: 'für BIM-Entwicklung.',
    b1v: '€ 0', b1l: 'Forschungszulage', b2v: '"Kein"', b2l: 'Forschungsunternehmen', b3v: '0', b3l: 'Ahnung, dass es geht',
    a1v: '€ 145k', a1l: 'Steuergutschrift', a2v: '3', a2l: 'BIM + Modulbau + Recycling', a3v: '2 Jahre', a3l: 'Rückwirkend beantragt',
    footer: 'Baubranche · BIM-Entwicklung · "Wir forschen doch nicht"' },
  { file: 'w46-medtech-210k', badge: 'Erfolgsgeschichte', title: 'MedTech-Startup holt', amount: '€ 210.000', titleEnd: 'im ersten Jahr.',
    b1v: '€ 0', b1l: 'Gewinn (Startup!)', b2v: '12', b2l: 'Mitarbeiter, 7 in F&E', b3v: 'Kein', b3l: 'Steuervorteil bisher',
    a1v: '€ 210k', a1l: 'Trotz Verlust ausgezahlt', a2v: '2', a2l: 'Projekte förderfähig', a3v: '100%', a3l: 'Als Gutschrift erhalten',
    footer: '12 Mitarbeiter · Diagnosegerät-Entwicklung · Kein Gewinn nötig' },
];

// ═══ BRANCHEN POSTS ═══
const branchenPosts = [
  { file: 'w07-software', n: '</>', s: 'Software & IT', d: 'Jede Zeile Code kann Geld wert sein. KI, Plattformen, Algorithmen — alles F&E.', c: 'green', size: 'small' },
  { file: 'w09-maschinenbau', n: '⚙', s: 'Maschinenbau', d: 'Prototypen, Automatisierung, Fertigungsverfahren — Maschinenbau IST Forschung.', size: 'small' },
  { file: 'w12-automotive', n: '⚡🚗', s: 'Automotive', d: 'E-Mobilität, Sensorik, Leichtbau — Zulieferer profitieren genauso wie OEMs.', size: 'small' },
  { file: 'w15-pharma', n: '💊', s: 'Pharma & Biotech', d: 'Höchste F&E-Quoten = höchstes Förderpotenzial. Bis zu 787.500 € pro Jahr.', size: 'small' },
  { file: 'w18-energie', n: '⚡', s: 'Energie & CleanTech', d: 'Batterie, Wasserstoff, Smart Grid — die Energiewende wird gefördert.', c: 'green', size: 'small' },
  { file: 'w20-bau', n: '🏗', s: 'Bauindustrie', d: 'BIM, modulares Bauen, 3D-Druck, Recycling-Beton — alles förderfähig.', size: 'small' },
  { file: 'w23-medtech', n: '🏥', s: 'Medizintechnik', d: 'Implantate, Diagnostik, SaMD — wo jedes Projekt Forschung ist.', size: 'small' },
  { file: 'w29-ki', n: 'KI', s: 'Machine Learning & AI', d: 'Eigene Modelle, NLP, Computer Vision — nicht API-Aufrufe.', c: 'green', size: 'small' },
  { file: 'w31-aerospace', n: '✈', s: 'Luft- & Raumfahrt', d: 'Werkstoffe, Triebwerke, Sensorik, Drohnen — Hightech = Hochförderung.', size: 'small' },
  { file: 'w35-agrar', n: '🌱', s: 'Agrar & FoodTech', d: 'Präzisionslandwirtschaft, Biotech, nachhaltige Verpackung — innovativer als gedacht.', c: 'green', size: 'small' },
];

// ═══ SPECIAL POSTS ═══
const specialPosts = [
  { file: 'w10-checkliste', n: '✓✓✓', s: '5 Fragen — Sind Sie berechtigt?', d: '3× Ja = Geld liegen gelassen. 5× Ja = Sofort anrufen.', c: 'green', size: 'small' },
  { file: 'w11-vergleich', n: 'VS', s: 'Forschungszulage vs. ZIM', d: 'Plot Twist: Sie müssen sich nicht entscheiden. Beides geht.', c: 'gold', size: 'small' },
  { file: 'w13-prozess', n: '1→2→3', s: 'BSFZ → Finanzamt → Geld', d: 'Der komplette Prozess in 3 Schritten. Ihr Aufwand: 2 Stunden.', size: 'xsmall' },
  { file: 'w17-partner', n: '🤝', s: 'Steuerberater-Partnermodell', d: 'Wir machen den technischen Part. Sie behalten den Mandanten.', c: 'gold', size: 'small' },
  { file: 'w19-bsfz', n: '5', s: 'Kriterien der BSFZ', d: 'Neuheit · Systematik · Unsicherheit · Übertragbarkeit · Kreativität', c: 'gold' },
  { file: 'w24-branchen', n: '9', s: 'Branchen. Millionen Euro.', d: 'Von Software bis Bau — die Forschungszulage kennt keine Branchengrenzen.', c: 'green' },
  { file: 'w26-halbzeit', n: '½', s: 'Halbzeit 2026', d: 'Haben Sie dieses Jahr schon Geld vom Staat zurückgeholt?', c: 'gold' },
  { file: 'w36-zeiterfassung', n: '⏱', s: 'Der teuerste Fehler', d: 'Keine Zeiterfassung = keine Forschungszulage. So einfach ist das.', c: 'red', size: 'small' },
  { file: 'w37-rechtsformen', n: 'ALLE', s: 'Rechtsformen berechtigt', d: 'GmbH, AG, KG, UG, Einzelunternehmen, Freiberufler — JEDE Rechtsform.', size: 'small' },
  { file: 'w44-kombination', n: 'FZulG+ZIM', s: 'Doppelt profitieren', d: 'Verschiedene Kosten, verschiedene Projekte = maximaler Ertrag.', c: 'gold', size: 'xsmall' },
  { file: 'w47-wachstum', n: 'NEU', s: 'Wachstumschancengesetz', d: '35 % KMU · 12 Mio. Basis · Sachkosten · Eigenleistungen — alles neu.', c: 'green', size: 'small' },
  { file: 'w48-rechner2', n: '30 Sek', s: 'Förderung berechnen', d: 'Unser kostenloser Rechner zeigt Ihnen sofort, was Ihnen zusteht.', size: 'small' },
  { file: 'w50-recap', n: '2026', s: 'Unser Jahr in Zahlen', d: '100 % Erfolgsquote · Branchen: 9+ · Zufriedenheit: maximal', c: 'green' },
  { file: 'w51-top5', n: 'TOP 5', s: 'Beste Posts des Jahres', d: 'Unsere meistgelesenen Beiträge 2026 — haben Sie alle gesehen?', c: 'gold', size: 'small' },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'], ...(executablePath ? { executablePath } : {}) });

  // ═══ Generate Big Number posts ═══
  for (const item of [...bigNumbers, ...branchenPosts, ...specialPosts]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
    await page.goto(`${BASE}/generator.html`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate((data) => {
      const num = document.getElementById('number');
      const sub = document.getElementById('sub');
      const desc = document.getElementById('desc');
      const line = document.getElementById('accentLine');
      const glow = document.getElementById('glowCenter');
      num.textContent = data.n;
      sub.textContent = data.s;
      desc.textContent = data.d;
      const divider = document.getElementById('numDivider');
      if (data.c === 'green') {
        num.classList.add('green'); line.classList.add('green-line');
        if (divider) divider.classList.add('green-div');
        glow.style.background = 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0.03) 40%, transparent 65%)';
      }
      if (data.c === 'red') {
        num.classList.add('red'); line.classList.add('red-line');
        if (divider) divider.classList.add('red-div');
        glow.style.background = 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.03) 40%, transparent 65%)';
      }
      if (data.c === 'gold') {
        num.classList.add('gold'); line.classList.add('gold-line');
        if (divider) divider.classList.add('gold-div');
        glow.style.background = 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.03) 40%, transparent 65%)';
      }
      if (data.size === 'small') num.classList.add('small');
      if (data.size === 'xsmall') num.classList.add('xsmall');
    }, item);
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, `${item.file}.png`), clip: { x: 0, y: 0, width: 1080, height: 1080 } });
    await page.close();
    console.log(`✅ ${item.file}`);
  }

  // ═══ Generate Myth Buster posts ═══
  for (const item of myths) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
    await page.goto(`${BASE}/myth-buster.html`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate((data) => {
      document.querySelector('.myth').innerHTML = `"<span class='strike'>${data.myth}</span>"`;
      document.querySelector('.truth').innerHTML = data.truth;
      document.querySelector('.desc').textContent = data.desc;
    }, item);
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, `${item.file}.png`), clip: { x: 0, y: 0, width: 1080, height: 1080 } });
    await page.close();
    console.log(`✅ ${item.file}`);
  }

  // ═══ Generate Before/After posts ═══
  for (const item of stories) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
    await page.goto(`${BASE}/before-after.html`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate((data) => {
      // Preserve badge SVG icon, only update text
      const badgeEl = document.querySelector('.badge');
      const badgeSvg = badgeEl.querySelector('svg');
      badgeEl.textContent = '';
      if (badgeSvg) badgeEl.appendChild(badgeSvg);
      badgeEl.appendChild(document.createTextNode(' ' + data.badge));
      const titleEl = document.querySelector('.title');
      const amountClass = data.isRed ? 'red-amount' : 'green';
      titleEl.innerHTML = `${data.title}<br/><span class="${amountClass}">${data.amount}</span> ${data.titleEnd}`;
      const stats = document.querySelectorAll('.col-stat');
      const vals = [data.b1v, data.b2v, data.b3v, data.a1v, data.a2v, data.a3v];
      const labels = [data.b1l, data.b2l, data.b3l, data.a1l, data.a2l, data.a3l];
      stats.forEach((s, i) => {
        s.querySelector('.col-stat-value').textContent = vals[i];
        s.querySelector('.col-stat-label').textContent = labels[i];
      });
      document.querySelector('.company').textContent = data.footer;
    }, item);
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, `${item.file}.png`), clip: { x: 0, y: 0, width: 1080, height: 1080 } });
    await page.close();
    console.log(`✅ ${item.file}`);
  }

  await browser.close();
  console.log(`\n🎉 All ${bigNumbers.length + branchenPosts.length + specialPosts.length + myths.length + stories.length} images generated in linkedin-content/images/`);
})();
