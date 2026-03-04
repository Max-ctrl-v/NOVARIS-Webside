/**
 * generate-pdfs.mjs — Generates all NOVARIS PDF materials using Puppeteer
 * Usage: node generate-pdfs.mjs
 *
 * Outputs:
 *   downloads/branchen/*.pdf  (9 industry flyers)
 *   downloads/fzulg-leitfaden.pdf (2-page whitepaper)
 *   downloads/fzulg-whitepaper.pdf (extended whitepaper based on PPT)
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Chrome detection (from screenshot.mjs) ──
const chromePaths = [
  'C:/Users/nateh/.cache/puppeteer/chrome',
  `C:/Users/${process.env.USERNAME}/.cache/puppeteer/chrome`,
  process.env.PUPPETEER_EXECUTABLE_PATH,
].filter(Boolean);

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

const launchOpts = {
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  ...(executablePath ? { executablePath } : {}),
};

// ── Ensure output dirs ──
const dlDir = path.join(__dirname, 'downloads');
const brDir = path.join(dlDir, 'branchen');
fs.mkdirSync(brDir, { recursive: true });

// ── Logo as base64 for embedding ──
const logoPath = path.join(__dirname, 'brand_assets', 'Logo V3-transparent.png');
const logoBase64 = fs.existsSync(logoPath)
  ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
  : '';

// ── Brand constants ──
const C = {
  navy: '#0F2747',
  deep: '#123E6B',
  accent: '#1E6DB5',
  light: '#4FA3E3',
  white: '#FFFFFF',
  bg: '#f5f7fa',
  text: '#2a3a52',
  muted: '#5a6e8c',
};

// ── Shared CSS ──
const baseCss = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; color:${C.text}; line-height:1.6; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  h1,h2,h3,h4 { font-family:'Montserrat',sans-serif; letter-spacing:-0.02em; line-height:1.2; }
`;

// ══════════════════════════════════════════════
//  BRANCHEN FLYER DATA
// ══════════════════════════════════════════════
const branchen = [
  { slug:'software-it', title:'Software & IT', cards:[
    {t:'KI- & ML-Systeme', d:'Entwicklung proprietärer Algorithmen, neuronaler Netze, NLP-Modelle oder Computer-Vision-Systeme, die über den Stand der Technik hinausgehen.'},
    {t:'Individualsoftware & Architekturen', d:'Entwicklung branchenspezifischer Softwarelösungen, neuartiger Systemarchitekturen oder proprietärer Datenbanken, für die keine marktfertigen Lösungen existieren.'},
    {t:'Embedded Systems & IoT', d:'Firmware-Entwicklung, Echtzeitsysteme und proprietäre Kommunikationsprotokolle für eingebettete Hardware – von Mikrocontrollern bis zu FPGAs.'},
  ]},
  { slug:'maschinenbau', title:'Maschinenbau', cards:[
    {t:'Neue Maschinenkonzepte & Prototypen', d:'Entwicklung neuartiger Maschinenkinematiken, innovativer Antriebskonzepte oder Prototypen, die über den aktuellen Stand der Technik hinausgehen.'},
    {t:'Prozessautomatisierung & Robotik', d:'Entwicklung automatisierter Fertigungszellen, kollaborativer Robotersysteme oder intelligenter Produktionssteuerung.'},
    {t:'Werkstofftechnik & Fertigungsverfahren', d:'Erforschung neuer Werkstoffe, additiver Fertigungsverfahren oder innovativer Oberflächentechnologien für industrielle Anwendungen.'},
  ]},
  { slug:'pharma', title:'Pharma & Life Sciences', cards:[
    {t:'Wirkstoffentwicklung & Drug Discovery', d:'Entwicklung und Optimierung neuer Wirkstoffkandidaten, neuartiger Synthesewege oder innovativer Formulierungskonzepte.'},
    {t:'Bioprozess-Entwicklung & Scale-Up', d:'Entwicklung und Optimierung biotechnologischer Herstellungsprozesse, von der Fermentation über Aufreinigung bis zur Maßstabsvergrößerung.'},
    {t:'Analytische Methoden & QC', d:'Entwicklung neuer Analysemethoden, Charakterisierungsverfahren oder In-process-Kontrollen, die über den Stand der Technik hinausgehen.'},
  ]},
  { slug:'automotive', title:'Automotive & Mobilität', cards:[
    {t:'Elektrifizierung & E-Antriebe', d:'Entwicklung neuer Elektromotoren, Batteriemanagement-Systeme, Leistungselektronik oder Ladetechnologien.'},
    {t:'Autonomes Fahren & ADAS', d:'Entwicklung von Fahrerassistenzsystemen, Sensorfusion-Algorithmen oder vollautonomen Steuerungssystemen.'},
    {t:'Leichtbau & neue Materialien', d:'Erforschung neuer Leichtbaustrukturen, Faserverbundwerkstoffe oder innovativer Fügetechnologien zur Gewichtsreduktion.'},
  ]},
  { slug:'medizintechnik', title:'Medizintechnik', cards:[
    {t:'Aktive Medizinprodukte', d:'Entwicklung neuartiger aktiver Implantate, Therapiegeräte oder diagnostischer Hardware, die neue Wirkmechanismen nutzen.'},
    {t:'SaMD & KI-Diagnostik', d:'Entwicklung von Software as a Medical Device und KI-gestützten Diagnosesystemen.'},
    {t:'In-vitro-Diagnostika & Biosensoren', d:'Entwicklung neuer Nachweismethoden, Biosensor-Plattformen oder Point-of-Care-Tests.'},
  ]},
  { slug:'energie', title:'Energie & Cleantech', cards:[
    {t:'Erneuerbare Energiesysteme', d:'Entwicklung neuer Photovoltaik-Zellkonzepte, Windturbinen-Aerodynamik, Wärmepumpen-Kreisläufe oder Geothermie-Technologien.'},
    {t:'Energiespeichertechnologien', d:'Entwicklung neuer Batteriezellchemien, Festkörperbatterien, Redox-Flow-Systeme oder Wasserstoffspeicher.'},
    {t:'Smart Grid & Netzsteuerung', d:'Entwicklung neuer Algorithmen für prädiktives Lastmanagement, digitale Netzsteuerung oder Aggregatoren-Plattformen.'},
  ]},
  { slug:'luft-raumfahrt', title:'Luft- & Raumfahrt', cards:[
    {t:'Antriebssysteme & Triebwerke', d:'Entwicklung neuer Triebwerkskonzepte, Hybridantriebe oder elektrischer Antriebssysteme für Luft- und Raumfahrtanwendungen.'},
    {t:'Leichtbau & Strukturmechanik', d:'Entwicklung neuartiger Leichtbaustrukturen, Faserverbundkonzepte oder additiv gefertigter Strukturbauteile.'},
    {t:'Avionik & Flugsystemsteuerung', d:'Entwicklung neuartiger Avionik-Systeme, Flugsteuerungsalgorithmen oder Navigationslösungen.'},
  ]},
  { slug:'agrar-foodtech', title:'Agrar & Foodtech', cards:[
    {t:'Precision Farming & Agrartechnik', d:'Entwicklung neuer Sensorsysteme, KI-basierter Entscheidungsunterstützung oder autonomer Landmaschinen.'},
    {t:'Lebensmitteltechnologie & Novel Food', d:'Entwicklung neuer Verarbeitungsverfahren, alternativer Proteinquellen oder innovativer Konservierungstechnologien.'},
    {t:'Indoor Farming & Vertical Agriculture', d:'Entwicklung optimierter Wachstumssysteme, intelligenter Beleuchtungssteuerung oder neuer Substratkonzepte.'},
  ]},
  { slug:'bauindustrie', title:'Bauindustrie', cards:[
    {t:'BIM-Software & Digitale Planung', d:'Entwicklung neuer BIM-Workflows, proprietärer Plug-ins, KI-gestützter Kollisionserkennung oder automatisierter Mengenermittlung.'},
    {t:'Nachhaltige Baustoffe & Materialien', d:'Entwicklung neuer Baustoffformulierungen, CO₂-armer Bindemittel, bio-basierter Dämmstoffe oder Recycling-Baustoffe.'},
    {t:'Baurobotik & automatisierte Verfahren', d:'Entwicklung autonomer Bausysteme, additiver Fertigungsverfahren (3D-Druck) oder robotergestützter Montagesysteme.'},
  ]},
];

// ── HTML: Industry Flyer (1 page A4) ──
function flyerHtml(b) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseCss}
    .page { width:210mm; min-height:297mm; padding:0; position:relative; background:${C.white}; overflow:hidden; }
    .header { background:linear-gradient(135deg,${C.navy},${C.deep}); padding:28px 40px; display:flex; align-items:center; justify-content:space-between; }
    .header img { height:38px; }
    .header-tag { color:${C.light}; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; }
    .hero { background:linear-gradient(135deg,${C.deep},${C.accent}); padding:36px 40px; color:${C.white}; }
    .hero h1 { font-size:26px; font-weight:800; margin-bottom:6px; }
    .hero p { font-size:13px; color:rgba(255,255,255,0.78); line-height:1.55; }
    .content { padding:30px 40px; }
    .section-label { font-size:10px; font-weight:700; color:${C.accent}; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:14px; }
    .card { background:${C.bg}; border-radius:10px; padding:18px 20px; margin-bottom:12px; border-left:3px solid ${C.accent}; }
    .card h3 { font-size:13px; font-weight:700; color:${C.navy}; margin-bottom:4px; }
    .card p { font-size:11.5px; color:${C.muted}; line-height:1.55; }
    .facts { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-top:24px; }
    .fact { text-align:center; background:${C.bg}; border-radius:10px; padding:16px 10px; }
    .fact-num { font-family:'Montserrat',sans-serif; font-size:22px; font-weight:800; color:${C.accent}; }
    .fact-label { font-size:10px; color:${C.muted}; margin-top:2px; }
    .usps { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin-top:20px; }
    .usp { text-align:center; padding:12px 6px; background:linear-gradient(135deg,${C.navy},${C.deep}); border-radius:8px; color:${C.white}; }
    .usp-icon { font-size:20px; margin-bottom:4px; }
    .usp-text { font-size:9.5px; font-weight:600; line-height:1.3; }
    .footer { position:absolute; bottom:0; left:0; right:0; background:${C.navy}; padding:16px 40px; display:flex; justify-content:space-between; align-items:center; }
    .footer-text { color:rgba(255,255,255,0.6); font-size:10px; }
    .footer-cta { color:${C.light}; font-size:11px; font-weight:700; }
  </style></head><body>
  <div class="page">
    <div class="header">
      ${logoBase64 ? `<img src="${logoBase64}" alt="NOVARIS">` : '<div style="color:#fff;font-family:Montserrat;font-weight:800;font-size:18px">NOVARIS CONSULTING</div>'}
      <div class="header-tag">Branchen-Factsheet</div>
    </div>
    <div class="hero">
      <h1>Forschungszulage für ${b.title}</h1>
      <p>Erfahren Sie, welche F&E-Projekte in Ihrer Branche förderfähig sind und wie Sie bis zu 25–35 % Ihrer Personalkosten zurückerhalten.</p>
    </div>
    <div class="content">
      <div class="section-label">Förderfähige Projektbereiche</div>
      ${b.cards.map(c => `<div class="card"><h3>${c.t}</h3><p>${c.d}</p></div>`).join('')}
      <div class="facts">
        <div class="fact"><div class="fact-num">25–35 %</div><div class="fact-label">Steuererstattung auf F&E-Personalkosten</div></div>
        <div class="fact"><div class="fact-num">€ 3,5 Mio.</div><div class="fact-label">max. Förderung pro Wirtschaftsjahr</div></div>
        <div class="fact"><div class="fact-num">ab 2020</div><div class="fact-label">rückwirkend beantragbar</div></div>
      </div>
      <div class="usps">
        <div class="usp"><div class="usp-icon">✓</div><div class="usp-text">0 € Vorab-<br>kosten</div></div>
        <div class="usp"><div class="usp-icon">📄</div><div class="usp-text">GoBD-konforme<br>Dokumentation</div></div>
        <div class="usp"><div class="usp-icon">🏆</div><div class="usp-text">100 %<br>Bewilligungsquote</div></div>
        <div class="usp"><div class="usp-icon">💰</div><div class="usp-text">Bis zu 40 %<br>günstiger</div></div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-text">© 2026 NOVARIS Consulting</div>
      <div class="footer-cta">novaris-consulting.com · Kostenlose Erstanalyse</div>
    </div>
  </div>
  </body></html>`;
}

// ══════════════════════════════════════════════
//  SHORT WHITEPAPER (2 pages)
// ══════════════════════════════════════════════
function leitfadenHtml() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseCss}
    .page { width:210mm; height:297mm; padding:0; position:relative; overflow:hidden; page-break-after:always; }
    .page:last-child { page-break-after:auto; }
    /* Page 1 */
    .cover-header { background:linear-gradient(135deg,${C.navy},${C.deep}); padding:32px 44px; display:flex; align-items:center; justify-content:space-between; }
    .cover-header img { height:36px; }
    .cover-hero { background:linear-gradient(160deg,${C.deep},${C.accent}); padding:50px 44px; color:white; }
    .cover-hero h1 { font-size:30px; font-weight:900; margin-bottom:8px; }
    .cover-hero p { font-size:14px; color:rgba(255,255,255,0.75); max-width:420px; }
    .body1 { padding:32px 44px; }
    .body1 h2 { font-size:18px; font-weight:800; color:${C.navy}; margin-bottom:14px; }
    .body1 p { font-size:12px; color:${C.muted}; line-height:1.7; margin-bottom:12px; }
    .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin:20px 0; }
    .g3-card { background:${C.bg}; border-radius:10px; padding:18px 14px; text-align:center; }
    .g3-num { font-family:'Montserrat',sans-serif; font-size:24px; font-weight:800; color:${C.accent}; }
    .g3-label { font-size:10.5px; color:${C.muted}; margin-top:4px; line-height:1.4; }
    .checklist { list-style:none; padding:0; }
    .checklist li { font-size:12px; color:${C.text}; padding:6px 0; padding-left:22px; position:relative; line-height:1.5; }
    .checklist li::before { content:'✓'; position:absolute; left:0; color:${C.accent}; font-weight:700; }
    /* Page 2 */
    .p2-header { background:linear-gradient(135deg,${C.navy},${C.deep}); padding:28px 44px; color:white; }
    .p2-header h2 { font-size:22px; font-weight:800; }
    .p2-header p { font-size:12px; color:rgba(255,255,255,0.65); margin-top:4px; }
    .p2-body { padding:28px 44px; }
    .usp-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:24px; }
    .usp-card { background:${C.bg}; border-radius:10px; padding:18px; border-left:3px solid ${C.accent}; }
    .usp-card h4 { font-size:13px; font-weight:700; color:${C.navy}; margin-bottom:4px; }
    .usp-card p { font-size:11px; color:${C.muted}; line-height:1.55; }
    .process { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin:20px 0; }
    .step { text-align:center; }
    .step-num { width:32px; height:32px; border-radius:50%; background:${C.accent}; color:white; font-family:'Montserrat'; font-weight:800; font-size:14px; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; }
    .step-title { font-size:10.5px; font-weight:600; color:${C.navy}; }
    .step-desc { font-size:9.5px; color:${C.muted}; margin-top:2px; line-height:1.4; }
    .cta-box { background:linear-gradient(135deg,${C.navy},${C.deep}); border-radius:12px; padding:28px; text-align:center; color:white; margin-top:20px; }
    .cta-box h3 { font-size:18px; font-weight:800; margin-bottom:6px; }
    .cta-box p { font-size:12px; color:rgba(255,255,255,0.65); }
    .cta-box .cta-link { display:inline-block; margin-top:12px; background:${C.accent}; color:white; padding:10px 28px; border-radius:8px; font-weight:700; font-size:13px; text-decoration:none; }
    .footer { position:absolute; bottom:0; left:0; right:0; background:${C.navy}; padding:14px 44px; display:flex; justify-content:space-between; }
    .footer span { color:rgba(255,255,255,0.5); font-size:9.5px; }
  </style></head><body>

  <!-- PAGE 1 -->
  <div class="page">
    <div class="cover-header">
      ${logoBase64 ? `<img src="${logoBase64}" alt="NOVARIS">` : '<div style="color:#fff;font-family:Montserrat;font-weight:800;font-size:16px">NOVARIS CONSULTING</div>'}
      <div style="color:${C.light};font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">Leitfaden</div>
    </div>
    <div class="cover-hero">
      <h1>Das Forschungszulagengesetz (FZulG)</h1>
      <p>Ihr kompakter Leitfaden zur steuerlichen Forschungsförderung in Deutschland.</p>
    </div>
    <div class="body1">
      <h2>Was ist das FZulG?</h2>
      <p>Das Forschungszulagengesetz (FZulG) ist eine steuerliche Förderung, die Unternehmen jeder Größe und Branche zusteht – wenn sie Forschung und Entwicklung betreiben. Der Staat erstattet 25 % (KMU: 35 %) der förderfähigen F&E-Personalkosten direkt als Steuerbonus oder als Barauszahlung bei Verlust.</p>

      <div class="grid3">
        <div class="g3-card"><div class="g3-num">25–35 %</div><div class="g3-label">der F&E-Personalkosten<br>als Steuererstattung</div></div>
        <div class="g3-card"><div class="g3-num">€ 3,5 Mio.</div><div class="g3-label">maximale Förderung<br>pro Wirtschaftsjahr</div></div>
        <div class="g3-card"><div class="g3-num">ab 2020</div><div class="g3-label">rückwirkend<br>beantragbar</div></div>
      </div>

      <h2>Wer ist berechtigt?</h2>
      <ul class="checklist">
        <li>Unbeschränkte oder beschränkte Steuerpflicht in Deutschland</li>
        <li>Unabhängig von Größe, Mitarbeiteranzahl und Umsatz</li>
        <li>Alle Branchen: Software, Maschinenbau, Pharma, Automotive, Bau u.v.m.</li>
        <li>Rückwirkend für alle offenen Steuerjahre ab 01.01.2020</li>
      </ul>

      <h2 style="margin-top:20px">Was ist förderfähig?</h2>
      <ul class="checklist">
        <li>Personalkosten von Mitarbeitern in F&E-Projekten (intern: 25–35 %)</li>
        <li>Externe Auftragsforschung im EWR (zu 60 % anrechenbar, 15 % Förderung)</li>
        <li>Eigenleistungen von Einzelunternehmern und Gesellschaftern</li>
        <li>Projekte müssen systematisch, neuartig und mit technischer Unsicherheit sein</li>
      </ul>
    </div>
    <div class="footer"><span>© 2026 NOVARIS Consulting</span><span>Seite 1 / 2</span></div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div class="p2-header">
      <h2>NOVARIS — Ihr Partner für die Forschungszulage</h2>
      <p>Vier Gründe, warum führende Unternehmen auf NOVARIS setzen.</p>
    </div>
    <div class="p2-body">
      <div class="usp-grid">
        <div class="usp-card"><h4>Erfolgsbasierte Vergütung</h4><p>Sie zahlen erst bei erfolgreicher Bewilligung. Keine Vorabkosten, keine versteckten Gebühren.</p></div>
        <div class="usp-card"><h4>GoBD-konforme Dokumentation</h4><p>Unsere Software erstellt Ihre F&E-Dokumentation automatisch – prüfungssicher und vollständig digital.</p></div>
        <div class="usp-card"><h4>100 % Bewilligungsquote</h4><p>Kein anderer FZulG-Dienstleister erreicht eine hundertprozentige Bewilligungsquote.</p></div>
        <div class="usp-card"><h4>Bis zu 40 % günstiger</h4><p>Unser Honorar liegt deutlich unter dem Branchendurchschnitt – ohne Kompromisse bei der Qualität.</p></div>
      </div>

      <h2 style="font-size:16px;color:${C.navy};margin-bottom:14px">Unser Prozess in 4 Schritten</h2>
      <div class="process">
        <div class="step"><div class="step-num">1</div><div class="step-title">Erstanalyse</div><div class="step-desc">Kostenlose Prüfung Ihres Förderpotenzials</div></div>
        <div class="step"><div class="step-num">2</div><div class="step-title">Dokumentation</div><div class="step-desc">GoBD-konforme Erfassung Ihrer F&E-Projekte</div></div>
        <div class="step"><div class="step-num">3</div><div class="step-title">Antragstellung</div><div class="step-desc">BSFZ-Bescheinigung & Finanzamtantrag</div></div>
        <div class="step"><div class="step-num">4</div><div class="step-title">Auszahlung</div><div class="step-desc">Steuererstattung oder Barauszahlung</div></div>
      </div>

      <div class="cta-box">
        <h3>Prüfen Sie Ihr Förderpotenzial – kostenlos</h3>
        <p>Unverbindliche Erstanalyse in weniger als 48 Stunden.</p>
        <div class="cta-link">novaris-consulting.com</div>
      </div>
    </div>
    <div class="footer"><span>© 2026 NOVARIS Consulting</span><span>Seite 2 / 2</span></div>
  </div>
  </body></html>`;
}

// ══════════════════════════════════════════════
//  EXTENDED WHITEPAPER (9 pages, matches PPT)
// ══════════════════════════════════════════════
function whitepaperHtml() {
  const pageStyle = `width:210mm; height:297mm; position:relative; overflow:hidden; page-break-after:always;`;
  const slideHeader = (title) => `<div style="background:linear-gradient(135deg,${C.navy} 0%,${C.deep} 60%,${C.accent} 100%);padding:28px 48px"><h2 style="font-size:22px;font-weight:800;color:white;letter-spacing:-0.01em">${title}</h2></div>`;
  const footer = (pg) => `<div style="position:absolute;bottom:0;left:0;right:0;background:${C.navy};padding:12px 48px;display:flex;justify-content:space-between"><span style="color:rgba(255,255,255,0.45);font-size:9px">© 2026 NOVARIS Consulting — Vertraulich</span><span style="color:rgba(255,255,255,0.45);font-size:9px">Seite ${pg} / 9</span></div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseCss}
    .circle-stat { width:160px;height:160px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center; }
    .numbered { display:flex;align-items:flex-start;gap:16px;padding:20px 24px;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06); }
    .num-circle { width:36px;height:36px;border-radius:50%;background:${C.deep};color:white;font-family:'Montserrat';font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .benefit-card { text-align:center;padding:24px 16px; }
    .benefit-icon { font-size:36px;margin-bottom:10px; }
  </style></head><body>

  <!-- P1: COVER -->
  <div style="${pageStyle} background:linear-gradient(160deg,${C.navy} 0%,${C.deep} 50%,${C.accent} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
    ${logoBase64 ? `<img src="${logoBase64}" style="height:52px;margin-bottom:40px" alt="NOVARIS">` : ''}
    <h1 style="font-size:34px;font-weight:300;color:white;line-height:1.35;max-width:520px">Erfolgreich &amp; ohne Risiko bis zu <strong style="font-weight:800">3 Mio. €</strong><br>Forschungsförderung pro Jahr</h1>
    <div style="width:60px;height:2px;background:${C.light};margin:28px 0;opacity:0.5"></div>
    <p style="color:rgba(255,255,255,0.55);font-size:13px">NOVARIS Consulting · Steuerliche Forschungsförderung</p>
    ${footer(1)}
  </div>

  <!-- P2: BEGRIFFSERKLÄRUNG -->
  <div style="${pageStyle} background:${C.bg}">
    ${slideHeader('BEGRIFFSERKLÄRUNG')}
    <div style="padding:50px 48px;text-align:center">
      <h3 style="font-size:26px;color:${C.deep};font-weight:700;margin-bottom:40px"><span style="font-weight:800;color:${C.accent}">S</span>teuerliche <span style="font-weight:800;color:${C.accent}">F</span>orschungs <span style="font-weight:800;color:${C.accent}">F</span>örderung</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;max-width:600px;margin:0 auto">
        <div style="text-align:center">
          <div style="width:90px;height:90px;border-radius:50%;background:white;box-shadow:0 4px 16px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px">🏛️</div>
          <p style="font-size:13px;color:${C.text};line-height:1.5">Steuergutschrift für F&E-Aufwendungen in Deutschland (intern und extern)</p>
        </div>
        <div style="text-align:center">
          <div style="width:90px;height:90px;border-radius:50%;background:white;box-shadow:0 4px 16px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px">👤</div>
          <p style="font-size:13px;color:${C.text};line-height:1.5">25–35 % der Personalkosten vom Finanzamt rückerstatten lassen</p>
        </div>
        <div style="text-align:center">
          <div style="width:90px;height:90px;border-radius:50%;background:white;box-shadow:0 4px 16px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px">💶</div>
          <p style="font-size:13px;color:${C.text};line-height:1.5">Bis zu 3.500.000 € Förderung pro Jahr</p>
        </div>
      </div>
    </div>
    ${footer(2)}
  </div>

  <!-- P3: WAS WIRD BEMESSEN? -->
  <div style="${pageStyle} background:${C.bg}">
    ${slideHeader('WAS WIRD BEMESSEN?')}
    <div style="padding:50px 48px;display:flex;gap:40px;align-items:center;justify-content:center">
      <div style="text-align:center">
        <div class="circle-stat" style="border:6px solid #dde4ee;border-top-color:${C.accent};border-right-color:${C.accent}">
          <div style="font-family:'Montserrat';font-size:32px;font-weight:800;color:${C.deep}">25–35%</div>
          <div style="font-size:11px;color:${C.muted};margin-top:4px;max-width:120px">Lohnkosten für interne FuE-Aufwände</div>
        </div>
      </div>
      <div style="text-align:center">
        <div class="circle-stat" style="width:130px;height:130px;border:6px solid #dde4ee;border-top-color:${C.light};border-right-color:${C.light}">
          <div style="font-family:'Montserrat';font-size:28px;font-weight:800;color:${C.deep}">15%</div>
          <div style="font-size:10px;color:${C.muted};margin-top:4px;max-width:110px;line-height:1.35">Gesamte Kosten für externe Entwicklungs-Dienstleistungen (innerhalb des EWR)</div>
        </div>
      </div>
      <div style="text-align:center">
        <div class="circle-stat" style="width:180px;height:180px;background:${C.deep};color:white">
          <div style="font-family:'Montserrat';font-size:28px;font-weight:800">Max. 3,5 Mio. €</div>
          <div style="font-size:12px;opacity:0.7;margin-top:4px">Förderung pro Wirtschaftsjahr</div>
        </div>
      </div>
    </div>
    ${footer(3)}
  </div>

  <!-- P4: ANTRAGSVORAUSSETZUNGEN -->
  <div style="${pageStyle} background:${C.bg}">
    ${slideHeader('ANTRAGSVORAUSSETZUNGEN')}
    <div style="padding:50px 48px;display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:640px;margin:0 auto">
      <div class="numbered"><div class="num-circle">1</div><div><p style="font-size:14px;color:${C.text};line-height:1.5">Unbeschränkte und beschränkte Steuerpflicht in Deutschland</p></div></div>
      <div class="numbered"><div class="num-circle">3</div><div><p style="font-size:14px;color:${C.text};line-height:1.5">Alle Aufwände mit Projektstart ab 01.01.2020, auch rückwirkend</p></div></div>
      <div class="numbered"><div class="num-circle">2</div><div><p style="font-size:14px;color:${C.text};line-height:1.5">Unabhängig von Größe, Mitarbeiteranzahl und Umsatz</p></div></div>
      <div class="numbered"><div class="num-circle">4</div><div><p style="font-size:14px;color:${C.text};line-height:1.5">Geltendmachung nach Ablauf des Wirtschaftsjahres</p></div></div>
    </div>
    ${footer(4)}
  </div>

  <!-- P5: FÖRDERFÄHIGE F&E-KRITERIEN -->
  <div style="${pageStyle} background:${C.bg}">
    ${slideHeader('FÖRDERFÄHIGE F&amp;E-KRITERIEN')}
    <div style="padding:60px 48px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:36px;text-align:center;max-width:600px;margin:0 auto">
      <div>
        <div style="width:100px;height:100px;border-radius:50%;background:white;box-shadow:0 4px 16px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:36px">📐</div>
        <h4 style="font-size:16px;color:${C.deep};font-weight:700">Planbarkeit</h4>
        <p style="font-size:11.5px;color:${C.muted};margin-top:6px;line-height:1.5">Das Vorhaben muss systematisch geplant und durchgeführt werden.</p>
      </div>
      <div>
        <div style="width:100px;height:100px;border-radius:50%;background:white;box-shadow:0 4px 16px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:36px">🚀</div>
        <h4 style="font-size:16px;color:${C.deep};font-weight:700">Neuartigkeit</h4>
        <p style="font-size:11.5px;color:${C.muted};margin-top:6px;line-height:1.5">Das Projekt muss auf die Schaffung neuen Wissens oder neuer Fähigkeiten abzielen.</p>
      </div>
      <div>
        <div style="width:100px;height:100px;border-radius:50%;background:white;box-shadow:0 4px 16px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:36px">🧪</div>
        <h4 style="font-size:16px;color:${C.deep};font-weight:700">Technisches Risiko</h4>
        <p style="font-size:11.5px;color:${C.muted};margin-top:6px;line-height:1.5">Das Ergebnis muss zu Projektbeginn unsicher und nicht vorhersehbar sein.</p>
      </div>
    </div>
    ${footer(5)}
  </div>

  <!-- P6: BEANTRAGUNGSPROZESS -->
  <div style="${pageStyle} background:${C.bg}">
    ${slideHeader('BEANTRAGUNGSPROZESS')}
    <div style="padding:40px 48px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px">
        <div style="background:white;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;align-items:flex-start;gap:14px">
          <div class="num-circle" style="font-size:16px">1</div>
          <div>
            <h4 style="font-size:14px;font-weight:700;color:${C.navy};margin-bottom:6px">Antrag auf Bescheinigung bei der BSFZ</h4>
            <p style="font-size:12px;color:${C.muted};line-height:1.55">Das Unternehmen stellt einen Antrag bei der Bescheinigungsstelle Forschungszulage. Die BSFZ prüft, ob ein förderfähiges F&E-Vorhaben vorliegt, und erteilt die Bescheinigung.</p>
          </div>
        </div>
        <div style="background:white;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;align-items:flex-start;gap:14px">
          <div class="num-circle" style="font-size:16px">2</div>
          <div>
            <h4 style="font-size:14px;font-weight:700;color:${C.navy};margin-bottom:6px">Antrag auf Festsetzung beim Finanzamt</h4>
            <p style="font-size:12px;color:${C.muted};line-height:1.55">Nach Erhalt der BSFZ-Bescheinigung reicht das Unternehmen den Antrag beim zuständigen Finanzamt ein. Dieses setzt die Forschungszulage fest und verrechnet oder zahlt aus.</p>
          </div>
        </div>
      </div>
      <div style="text-align:center;padding:28px;background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <div style="display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap">
          <div style="text-align:center"><div style="font-size:28px;margin-bottom:4px">📋</div><div style="font-size:11px;color:${C.navy};font-weight:600">Antrag</div></div>
          <div style="font-size:20px;color:${C.light}">→</div>
          <div style="text-align:center"><div style="font-size:28px;margin-bottom:4px">🔍</div><div style="font-size:11px;color:${C.navy};font-weight:600">BSFZ-Prüfung</div></div>
          <div style="font-size:20px;color:${C.light}">→</div>
          <div style="text-align:center"><div style="font-size:28px;margin-bottom:4px">✅</div><div style="font-size:11px;color:${C.navy};font-weight:600">Bewilligung</div></div>
          <div style="font-size:20px;color:${C.light}">→</div>
          <div style="text-align:center"><div style="font-size:28px;margin-bottom:4px">🏦</div><div style="font-size:11px;color:${C.navy};font-weight:600">Finanzamt</div></div>
          <div style="font-size:20px;color:${C.light}">→</div>
          <div style="text-align:center"><div style="font-size:28px;margin-bottom:4px">💰</div><div style="font-size:11px;color:${C.navy};font-weight:600">Auszahlung</div></div>
        </div>
      </div>
    </div>
    ${footer(6)}
  </div>

  <!-- P7: DOKUMENTATION -->
  <div style="${pageStyle} background:${C.bg}">
    ${slideHeader('WICHTIGE ASPEKTE BEI DER DOKUMENTATION')}
    <div style="padding:50px 48px;display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:640px;margin:0 auto">
      <div class="numbered"><div class="num-circle">1</div><div><p style="font-size:14px;color:${C.text};line-height:1.5">Doppelförderungsverbot gemäß §7 Abs. 2 FZulG</p></div></div>
      <div class="numbered"><div class="num-circle">3</div><div><p style="font-size:14px;color:${C.text};line-height:1.5">Projektfortschrittsdokumentation bzgl. Aufwand und Gehalt</p></div></div>
      <div class="numbered"><div class="num-circle">2</div><div><p style="font-size:14px;color:${C.text};line-height:1.5">Einmalige Geltendmachung pro Wirtschaftsjahr</p></div></div>
      <div class="numbered"><div class="num-circle">4</div><div><p style="font-size:14px;color:${C.text};line-height:1.5">Einhaltung der GoBD-Konformität</p></div></div>
    </div>
    ${footer(7)}
  </div>

  <!-- P8: ZUSAMMENARBEIT -->
  <div style="${pageStyle} background:${C.bg}">
    ${slideHeader('ZUSAMMENARBEIT')}
    <div style="padding:50px 48px;display:flex;gap:48px;align-items:center;justify-content:center">
      <div style="width:200px;height:200px;border-radius:50%;border:10px solid #dde4ee;border-top-color:${C.deep};position:relative;display:flex;align-items:center;justify-content:center">
        <div style="text-align:center;font-size:12px;color:${C.muted}">Honorarmodell</div>
      </div>
      <div style="max-width:340px">
        <h3 style="font-size:16px;color:${C.deep};font-weight:700;margin-bottom:20px">Modalitäten der Zusammenarbeit:</h3>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><div style="width:14px;height:14px;border-radius:3px;background:#dde4ee;flex-shrink:0"></div><p style="font-size:13px;color:${C.text}">Bescheinigte Kosten Ihrer Entwicklungsprojekte</p></div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><div style="width:14px;height:14px;border-radius:3px;background:${C.deep};flex-shrink:0"></div><p style="font-size:13px;color:${C.text}">Fördersumme (25 % der bescheinigten Kosten)</p></div>
        <div style="display:flex;align-items:center;gap:10px"><div style="width:14px;height:14px;border-radius:3px;background:${C.accent};flex-shrink:0"></div><p style="font-size:13px;color:${C.text}">Erfolgsbasiertes Honorar von 5 % bezogen auf die bescheinigten Projektkosten</p></div>
      </div>
    </div>
    ${footer(8)}
  </div>

  <!-- P9: VORTEILE EINER ZUSAMMENARBEIT -->
  <div style="${pageStyle} background:${C.bg};page-break-after:auto">
    ${slideHeader('VORTEILE EINER ZUSAMMENARBEIT')}
    <div style="padding:50px 48px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:20px;text-align:center">
      <div class="benefit-card">
        <div class="benefit-icon">💰</div>
        <h4 style="font-size:13px;color:${C.navy};font-weight:700;margin-bottom:6px">Kostenanalyse</h4>
        <p style="font-size:11.5px;color:${C.muted};line-height:1.5">Analyse und Qualifikation Ihrer ansetzbaren Kosten</p>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">🔍</div>
        <h4 style="font-size:13px;color:${C.navy};font-weight:700;margin-bottom:6px">Förderfähigkeitsprüfung</h4>
        <p style="font-size:11.5px;color:${C.muted};line-height:1.5">Prüfung Ihrer Inhalte auf Förderfähigkeit</p>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">📄</div>
        <h4 style="font-size:13px;color:${C.navy};font-weight:700;margin-bottom:6px">Antragserstellung</h4>
        <p style="font-size:11.5px;color:${C.muted};line-height:1.5">Vollumfängliche Erstellung des Förderantrags inkl. Beantwortung von Rückfragen</p>
      </div>
      <div class="benefit-card">
        <div class="benefit-icon">🤝</div>
        <h4 style="font-size:13px;color:${C.navy};font-weight:700;margin-bottom:6px">Erfolgsbasiert</h4>
        <p style="font-size:11.5px;color:${C.muted};line-height:1.5">Erfolgsbasiertes Honorar in Bezug auf die veranschlagte Fördersumme</p>
      </div>
    </div>
    <div style="margin:0 48px;padding:28px;background:linear-gradient(135deg,${C.navy},${C.deep});border-radius:12px;text-align:center;color:white">
      <h3 style="font-size:18px;font-weight:800;margin-bottom:6px">Bereit für Ihre Forschungszulage?</h3>
      <p style="font-size:12px;color:rgba(255,255,255,0.65);margin-bottom:10px">Kostenlose und unverbindliche Erstanalyse</p>
      <div style="display:inline-block;background:${C.accent};padding:10px 28px;border-radius:8px;font-weight:700;font-size:13px">novaris-consulting.com</div>
    </div>
    ${footer(9)}
  </div>

  </body></html>`;
}

// ══════════════════════════════════════════════
//  GENERATE ALL PDFs
// ══════════════════════════════════════════════
(async () => {
  let browser;
  try {
    console.log('\n  🚀 Starting PDF generation...\n');
    browser = await puppeteer.launch(launchOpts);

    // Helper: HTML string → PDF file
    async function htmlToPdf(html, outPath, opts = {}) {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: outPath,
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        ...opts,
      });
      await page.close();
      console.log(`  ✅ ${path.relative(__dirname, outPath)}`);
    }

    // 1) Generate 9 industry flyers
    for (const b of branchen) {
      await htmlToPdf(flyerHtml(b), path.join(brDir, `${b.slug}.pdf`));
    }

    // 2) Generate short whitepaper (2 pages)
    await htmlToPdf(leitfadenHtml(), path.join(dlDir, 'fzulg-leitfaden.pdf'));

    // 3) Generate extended whitepaper (9 pages)
    await htmlToPdf(whitepaperHtml(), path.join(dlDir, 'fzulg-whitepaper.pdf'));

    console.log('\n  🎉 All 11 PDFs generated successfully!\n');
  } catch (err) {
    console.error('\n  ❌ PDF generation failed:', err.message, '\n');
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
