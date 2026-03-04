/**
 * generate-pdfs.mjs — Generates all NOVARIS PDF materials using Puppeteer
 * Usage: node generate-pdfs.mjs
 *
 * Outputs:
 *   downloads/branchen/*.pdf  (9 industry flyers)
 *   downloads/fzulg-leitfaden.pdf (2-page whitepaper)
 *   downloads/fzulg-whitepaper.pdf (extended whitepaper based on PPT)
 *
 * FZulG numbers verified against 2026 law:
 *   - Bemessungsgrundlage: max €12 Mio. pro Unternehmensverbund
 *   - Fördersatz: 25% (Standard) / 35% (KMU)
 *   - Max Förderung: €3 Mio. (Standard) / €4,2 Mio. (KMU) pro Jahr
 *   - Auftragsforschung: 70% anrechenbar
 *   - Gemeinkostenpauschale: 20% auf direkte Projektkosten
 *   - Eigenleistung: €100/Stunde (seit 2026)
 *   - Rückwirkend ab 01.01.2020
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

// ── Logo SVG inline for dark backgrounds ──
const logoSvgPath = path.join(__dirname, 'brand_assets', 'Logo V5-light.svg');
const logoSvg = fs.existsSync(logoSvgPath) ? fs.readFileSync(logoSvgPath, 'utf8') : '';
const logoSvgBase64 = logoSvg ? `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}` : '';

// ── Brand constants ──
const C = {
  navy: '#0F2747',
  deep: '#123E6B',
  accent: '#1E6DB5',
  light: '#4FA3E3',
  sky: '#7ECEF5',
  white: '#FFFFFF',
  bg: '#F7F9FC',
  card: '#FFFFFF',
  text: '#1E293B',
  muted: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
};

// ── SVG Icons (crisp, professional — no emojis) ──
const icons = {
  check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkWhite: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  download: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  shield: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10" stroke="${C.success}" stroke-width="2"/></svg>`,
  doc: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  trophy: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 22V2h4v20"/><rect x="6" y="2" width="12" height="7" rx="1"/></svg>`,
  euro: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7 10h6M7 14h6M14.5 7.5C13.5 6.5 12 6 10.5 6.5 8 7.5 7 10 7 12s1 4.5 3.5 5.5c1.5.5 3-.5 4-1.5"/></svg>`,
  building: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 22v-4h6v4"/></svg>`,
  calendar: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  target: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  rocket: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  flask: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6.5L3.5 20.5a1 1 0 0 0 .86 1.5h15.28a1 1 0 0 0 .86-1.5L14 9.5V3"/><path d="M7.5 16h9"/></svg>`,
  search: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  clipboard: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/></svg>`,
  handshake: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>`,
  arrowRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${C.light}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${C.light}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`,
  percent: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8"><circle cx="9" cy="9" r="2.5"/><circle cx="15" cy="15" r="2.5"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`,
  users: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
};

// ── Decorative background SVG patterns ──
const decoCircles = (opacity = 0.04) => `
  <svg style="position:absolute;top:0;right:0;width:300px;height:300px;opacity:${opacity}" viewBox="0 0 300 300" fill="none">
    <circle cx="250" cy="50" r="120" stroke="${C.light}" stroke-width="1" opacity="0.3"/>
    <circle cx="280" cy="20" r="80" stroke="${C.sky}" stroke-width="0.5" opacity="0.2"/>
    <circle cx="200" cy="100" r="40" fill="${C.light}" opacity="0.06"/>
  </svg>`;

const decoDotsGrid = (opacity = 0.03) => `
  <svg style="position:absolute;bottom:60px;left:20px;width:120px;height:120px;opacity:${opacity}" viewBox="0 0 120 120">
    ${Array.from({length: 36}, (_, i) => `<circle cx="${(i % 6) * 22 + 11}" cy="${Math.floor(i / 6) * 22 + 11}" r="2" fill="${C.deep}"/>`).join('')}
  </svg>`;

// ── Shared CSS ──
const baseCss = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; color:${C.text}; line-height:1.6; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  h1,h2,h3,h4 { font-family:'Montserrat',sans-serif; letter-spacing:-0.03em; line-height:1.2; }
`;

// ══════════════════════════════════════════════
//  BRANCHEN FLYER DATA
// ══════════════════════════════════════════════
const branchen = [
  { slug:'software-it', title:'Software & IT', cards:[
    {t:'KI- & ML-Systeme', d:'Entwicklung proprietärer Algorithmen, neuronaler Netze, NLP-Modelle oder Computer-Vision-Systeme, die über den Stand der Technik hinausgehen.'},
    {t:'Individualsoftware & Architekturen', d:'Entwicklung branchenspezifischer Softwarelösungen, neuartiger Systemarchitekturen oder proprietärer Datenbanken.'},
    {t:'Embedded Systems & IoT', d:'Firmware-Entwicklung, Echtzeitsysteme und proprietäre Kommunikationsprotokolle für eingebettete Hardware.'},
  ]},
  { slug:'maschinenbau', title:'Maschinenbau', cards:[
    {t:'Neue Maschinenkonzepte & Prototypen', d:'Entwicklung neuartiger Maschinenkinematiken, innovativer Antriebskonzepte oder Prototypen jenseits des Stands der Technik.'},
    {t:'Prozessautomatisierung & Robotik', d:'Entwicklung automatisierter Fertigungszellen, kollaborativer Robotersysteme oder intelligenter Produktionssteuerung.'},
    {t:'Werkstofftechnik & Fertigungsverfahren', d:'Erforschung neuer Werkstoffe, additiver Fertigungsverfahren oder innovativer Oberflächentechnologien.'},
  ]},
  { slug:'pharma', title:'Pharma & Life Sciences', cards:[
    {t:'Wirkstoffentwicklung & Drug Discovery', d:'Entwicklung und Optimierung neuer Wirkstoffkandidaten, neuartiger Synthesewege oder innovativer Formulierungskonzepte.'},
    {t:'Bioprozess-Entwicklung & Scale-Up', d:'Entwicklung und Optimierung biotechnologischer Herstellungsprozesse, Fermentation, Aufreinigung und Maßstabsvergrößerung.'},
    {t:'Analytische Methoden & QC', d:'Entwicklung neuer Analysemethoden, Charakterisierungsverfahren oder In-process-Kontrollen jenseits des Stands der Technik.'},
  ]},
  { slug:'automotive', title:'Automotive & Mobilität', cards:[
    {t:'Elektrifizierung & E-Antriebe', d:'Entwicklung neuer Elektromotoren, Batteriemanagement-Systeme, Leistungselektronik oder Ladetechnologien.'},
    {t:'Autonomes Fahren & ADAS', d:'Entwicklung von Fahrerassistenzsystemen, Sensorfusion-Algorithmen oder vollautonomen Steuerungssystemen.'},
    {t:'Leichtbau & neue Materialien', d:'Erforschung neuer Leichtbaustrukturen, Faserverbundwerkstoffe oder innovativer Fügetechnologien.'},
  ]},
  { slug:'medizintechnik', title:'Medizintechnik', cards:[
    {t:'Aktive Medizinprodukte', d:'Entwicklung neuartiger aktiver Implantate, Therapiegeräte oder diagnostischer Hardware mit neuen Wirkmechanismen.'},
    {t:'SaMD & KI-Diagnostik', d:'Entwicklung von Software as a Medical Device und KI-gestützten Diagnosesystemen.'},
    {t:'In-vitro-Diagnostika & Biosensoren', d:'Entwicklung neuer Nachweismethoden, Biosensor-Plattformen oder Point-of-Care-Tests.'},
  ]},
  { slug:'energie', title:'Energie & Cleantech', cards:[
    {t:'Erneuerbare Energiesysteme', d:'Entwicklung neuer Photovoltaik-Zellkonzepte, Windturbinen-Aerodynamik, Wärmepumpen oder Geothermie-Technologien.'},
    {t:'Energiespeichertechnologien', d:'Entwicklung neuer Batteriezellchemien, Festkörperbatterien, Redox-Flow-Systeme oder Wasserstoffspeicher.'},
    {t:'Smart Grid & Netzsteuerung', d:'Entwicklung neuer Algorithmen für prädiktives Lastmanagement, digitale Netzsteuerung oder Aggregatoren-Plattformen.'},
  ]},
  { slug:'luft-raumfahrt', title:'Luft- & Raumfahrt', cards:[
    {t:'Antriebssysteme & Triebwerke', d:'Entwicklung neuer Triebwerkskonzepte, Hybridantriebe oder elektrischer Antriebssysteme für die Luft- und Raumfahrt.'},
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

// ══════════════════════════════════════════════
//  INDUSTRY FLYER — 1 page A4, premium design
// ══════════════════════════════════════════════
function flyerHtml(b) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseCss}
    .page { width:210mm; min-height:297mm; padding:0; position:relative; background:${C.white}; overflow:hidden; }

    /* Header bar */
    .header {
      background:linear-gradient(135deg,${C.navy} 0%,${C.deep} 60%,${C.accent} 120%);
      padding:22px 40px;
      display:flex; align-items:center; justify-content:space-between;
    }
    .header img { height:34px; }
    .header-tag {
      background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15);
      color:rgba(255,255,255,0.85); font-size:9px; font-weight:600;
      letter-spacing:0.12em; text-transform:uppercase;
      padding:5px 14px; border-radius:20px;
    }

    /* Hero section */
    .hero {
      background:linear-gradient(160deg,${C.deep} 0%,${C.accent} 100%);
      padding:32px 40px 28px; color:${C.white}; position:relative; overflow:hidden;
    }
    .hero::after {
      content:''; position:absolute; top:-40px; right:-40px;
      width:200px; height:200px; border-radius:50%;
      background:radial-gradient(circle, rgba(79,163,227,0.2), transparent 70%);
    }
    .hero h1 { font-size:24px; font-weight:800; margin-bottom:5px; position:relative; z-index:1; }
    .hero p { font-size:12px; color:rgba(255,255,255,0.75); line-height:1.55; max-width:440px; position:relative; z-index:1; }

    /* Content area */
    .content { padding:24px 40px 20px; }
    .section-label {
      display:inline-flex; align-items:center; gap:6px;
      font-size:9px; font-weight:700; color:${C.accent}; text-transform:uppercase;
      letter-spacing:0.12em; margin-bottom:14px;
      padding:4px 12px; background:rgba(30,109,181,0.06); border-radius:20px;
    }

    /* Project cards */
    .card {
      background:${C.bg}; border-radius:10px; padding:16px 18px; margin-bottom:10px;
      border-left:3px solid transparent;
      border-image:linear-gradient(180deg,${C.accent},${C.light}) 1;
      position:relative;
    }
    .card h3 { font-size:12.5px; font-weight:700; color:${C.navy}; margin-bottom:3px; }
    .card p { font-size:11px; color:${C.muted}; line-height:1.55; }

    /* Key facts */
    .facts { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin-top:20px; }
    .fact {
      text-align:center; background:${C.bg}; border-radius:10px; padding:14px 8px;
      border:1px solid ${C.border};
    }
    .fact-icon { margin-bottom:6px; display:flex; justify-content:center; }
    .fact-num { font-family:'Montserrat',sans-serif; font-size:18px; font-weight:800; color:${C.deep}; line-height:1.1; }
    .fact-label { font-size:9px; color:${C.muted}; margin-top:3px; line-height:1.3; }

    /* USP strip */
    .usps {
      display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:8px; margin-top:16px;
    }
    .usp {
      text-align:center; padding:12px 6px;
      background:linear-gradient(150deg,${C.navy},${C.deep});
      border-radius:8px; color:${C.white};
      box-shadow:0 2px 8px rgba(15,39,71,0.15);
    }
    .usp-icon { margin-bottom:4px; display:flex; justify-content:center; }
    .usp-text { font-size:9px; font-weight:600; line-height:1.3; opacity:0.92; }

    /* Footer */
    .footer {
      position:absolute; bottom:0; left:0; right:0;
      background:${C.navy}; padding:14px 40px;
      display:flex; justify-content:space-between; align-items:center;
    }
    .footer-text { color:rgba(255,255,255,0.45); font-size:9px; }
    .footer-cta { color:${C.light}; font-size:10px; font-weight:600; }
  </style></head><body>
  <div class="page">
    <div class="header">
      ${logoSvgBase64 ? `<img src="${logoSvgBase64}" alt="NOVARIS" style="height:34px">` : logoBase64 ? `<img src="${logoBase64}" alt="NOVARIS" style="height:34px">` : '<div style="color:#fff;font-family:Montserrat;font-weight:800;font-size:16px">NOVARIS</div>'}
      <div class="header-tag">Branchen-Factsheet</div>
    </div>
    <div class="hero">
      <h1>Forschungszulage für ${b.title}</h1>
      <p>Welche F&E-Projekte sind in Ihrer Branche förderfähig? Sichern Sie sich bis zu 35 % Ihrer Personalkosten zurück.</p>
    </div>
    <div class="content">
      <div class="section-label">${icons.target.replace(/width="28" height="28"/g, 'width="12" height="12"')} Förderfähige Projektbereiche</div>
      ${b.cards.map(c => `<div class="card"><h3>${c.t}</h3><p>${c.d}</p></div>`).join('')}

      <div class="facts">
        <div class="fact">
          <div class="fact-icon">${icons.percent}</div>
          <div class="fact-num">25–35 %</div>
          <div class="fact-label">der F&E-Personalkosten<br>als Steuererstattung</div>
        </div>
        <div class="fact">
          <div class="fact-icon">${icons.euro.replace(/stroke="${C.accent}"/g, 'stroke="#10B981"')}</div>
          <div class="fact-num">bis €4,2 Mio.</div>
          <div class="fact-label">max. Förderung pro Jahr<br>(KMU: 35 % von €12 Mio.)</div>
        </div>
        <div class="fact">
          <div class="fact-icon">${icons.calendar}</div>
          <div class="fact-num">ab 2020</div>
          <div class="fact-label">rückwirkend<br>beantragbar</div>
        </div>
        <div class="fact">
          <div class="fact-icon">${icons.building}</div>
          <div class="fact-num">€12 Mio.</div>
          <div class="fact-label">Bemessungsgrundlage<br>pro Unternehmensverbund</div>
        </div>
      </div>

      <div class="usps">
        <div class="usp">
          <div class="usp-icon">${icons.shield.replace(/stroke="${C.accent}"/g, 'stroke="#fff"').replace(/stroke="${C.success}"/g, 'stroke="#7ECEF5"')}</div>
          <div class="usp-text">0 € Vorab-<br>kosten</div>
        </div>
        <div class="usp">
          <div class="usp-icon">${icons.doc.replace(/stroke="${C.accent}"/g, 'stroke="#fff"')}</div>
          <div class="usp-text">GoBD-konforme<br>Dokumentation</div>
        </div>
        <div class="usp">
          <div class="usp-icon">${icons.trophy.replace(/stroke="${C.accent}"/g, 'stroke="#fff"')}</div>
          <div class="usp-text">100 %<br>Bewilligungsquote</div>
        </div>
        <div class="usp">
          <div class="usp-icon">${icons.euro.replace(/stroke="${C.accent}"/g, 'stroke="#fff"')}</div>
          <div class="usp-text">Bis zu 40 %<br>günstiger</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-text">© 2026 NOVARIS Consulting · Stand: Januar 2026</div>
      <div class="footer-cta">novaris-consulting.com</div>
    </div>
  </div>
  </body></html>`;
}

// ══════════════════════════════════════════════
//  SHORT WHITEPAPER — 2 pages, premium design
// ══════════════════════════════════════════════
function leitfadenHtml() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseCss}
    .page {
      width:210mm; height:297mm; padding:0; position:relative; overflow:hidden;
      page-break-after:always;
    }
    .page:last-child { page-break-after:auto; }

    /* Cover header */
    .cover-header {
      background:linear-gradient(135deg,${C.navy} 0%,${C.deep} 60%,${C.accent} 120%);
      padding:24px 44px; display:flex; align-items:center; justify-content:space-between;
    }
    .cover-header img { height:34px; }
    .cover-tag {
      background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15);
      color:rgba(255,255,255,0.85); font-size:9px; font-weight:600;
      letter-spacing:0.12em; text-transform:uppercase;
      padding:5px 14px; border-radius:20px;
    }

    /* Hero */
    .cover-hero {
      background:linear-gradient(160deg,${C.deep} 0%,${C.accent} 100%);
      padding:44px; color:white; position:relative; overflow:hidden;
    }
    .cover-hero::after {
      content:''; position:absolute; top:-60px; right:-60px;
      width:300px; height:300px; border-radius:50%;
      background:radial-gradient(circle, rgba(126,206,245,0.15), transparent 70%);
    }
    .cover-hero h1 { font-size:28px; font-weight:800; margin-bottom:6px; position:relative; z-index:1; }
    .cover-hero p { font-size:13px; color:rgba(255,255,255,0.7); max-width:400px; position:relative; z-index:1; }

    /* Body */
    .body1 { padding:28px 44px; }
    .section-title {
      display:flex; align-items:center; gap:10px;
      font-size:16px; font-weight:800; color:${C.navy}; margin-bottom:12px;
    }
    .section-title .accent-bar { width:4px; height:20px; border-radius:2px; background:linear-gradient(180deg,${C.accent},${C.light}); }
    .body-text { font-size:11.5px; color:${C.muted}; line-height:1.7; margin-bottom:12px; }

    /* Stats grid */
    .stats-grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px; margin:18px 0; }
    .stat-card {
      text-align:center; padding:16px 10px; border-radius:10px;
      background:${C.bg}; border:1px solid ${C.border};
    }
    .stat-icon { margin-bottom:6px; display:flex; justify-content:center; }
    .stat-num { font-family:'Montserrat',sans-serif; font-size:20px; font-weight:800; color:${C.deep}; }
    .stat-label { font-size:9px; color:${C.muted}; margin-top:2px; line-height:1.3; }

    /* Checklist */
    .check-list { list-style:none; padding:0; margin:0; }
    .check-item {
      display:flex; align-items:flex-start; gap:10px;
      font-size:11.5px; color:${C.text}; padding:6px 0; line-height:1.5;
    }
    .check-icon {
      width:20px; height:20px; border-radius:50%; flex-shrink:0; margin-top:1px;
      background:linear-gradient(135deg,${C.accent},${C.light});
      display:flex; align-items:center; justify-content:center;
    }

    /* Page 2 */
    .p2-header {
      background:linear-gradient(135deg,${C.navy} 0%,${C.deep} 60%,${C.accent} 120%);
      padding:32px 44px; color:white; position:relative; overflow:hidden;
    }
    .p2-header::after {
      content:''; position:absolute; top:-40px; right:-40px;
      width:200px; height:200px; border-radius:50%;
      background:radial-gradient(circle, rgba(126,206,245,0.12), transparent 70%);
    }
    .p2-header h2 { font-size:22px; font-weight:800; position:relative; z-index:1; }
    .p2-header p { font-size:12px; color:rgba(255,255,255,0.6); margin-top:4px; position:relative; z-index:1; }
    .p2-body { padding:28px 44px; }

    /* USP grid */
    .usp-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:22px; }
    .usp-card {
      background:${C.bg}; border-radius:10px; padding:16px 18px;
      border-left:3px solid transparent;
      border-image:linear-gradient(180deg,${C.accent},${C.light}) 1;
      display:flex; gap:12px; align-items:flex-start;
    }
    .usp-card h4 { font-size:12px; font-weight:700; color:${C.navy}; margin-bottom:3px; }
    .usp-card p { font-size:10.5px; color:${C.muted}; line-height:1.55; }

    /* Process steps */
    .process { display:grid; grid-template-columns:1fr auto 1fr auto 1fr auto 1fr; gap:0; align-items:flex-start; margin:16px 0; }
    .step { text-align:center; }
    .step-num {
      width:36px; height:36px; border-radius:50%;
      background:linear-gradient(135deg,${C.deep},${C.accent});
      color:white; font-family:'Montserrat'; font-weight:800; font-size:14px;
      display:flex; align-items:center; justify-content:center; margin:0 auto 8px;
      box-shadow:0 2px 8px rgba(30,109,181,0.25);
    }
    .step-title { font-size:10px; font-weight:700; color:${C.navy}; }
    .step-desc { font-size:9px; color:${C.muted}; margin-top:2px; line-height:1.3; }
    .step-arrow { display:flex; align-items:center; padding-top:10px; }

    /* CTA */
    .cta-box {
      background:linear-gradient(135deg,${C.navy} 0%,${C.deep} 60%,${C.accent} 120%);
      border-radius:12px; padding:24px; text-align:center; color:white; margin-top:18px;
      position:relative; overflow:hidden;
    }
    .cta-box::after {
      content:''; position:absolute; top:-30px; right:-30px;
      width:140px; height:140px; border-radius:50%;
      background:radial-gradient(circle, rgba(126,206,245,0.12), transparent 70%);
    }
    .cta-box h3 { font-size:16px; font-weight:800; margin-bottom:4px; position:relative; z-index:1; }
    .cta-box p { font-size:11px; color:rgba(255,255,255,0.6); position:relative; z-index:1; }
    .cta-btn {
      display:inline-block; margin-top:10px; position:relative; z-index:1;
      background:rgba(255,255,255,0.15); backdrop-filter:blur(4px);
      border:1px solid rgba(255,255,255,0.2);
      color:white; padding:9px 24px; border-radius:8px;
      font-weight:700; font-size:12px; text-decoration:none;
    }

    /* Footer */
    .footer {
      position:absolute; bottom:0; left:0; right:0;
      background:${C.navy}; padding:12px 44px; display:flex; justify-content:space-between;
    }
    .footer span { color:rgba(255,255,255,0.4); font-size:9px; }
  </style></head><body>

  <!-- PAGE 1 -->
  <div class="page">
    <div class="cover-header">
      ${logoSvgBase64 ? `<img src="${logoSvgBase64}" alt="NOVARIS">` : logoBase64 ? `<img src="${logoBase64}" alt="NOVARIS">` : '<div style="color:#fff;font-family:Montserrat;font-weight:800;font-size:16px">NOVARIS</div>'}
      <div class="cover-tag">Leitfaden</div>
    </div>
    <div class="cover-hero">
      <h1>Das Forschungszulagengesetz (FZulG)</h1>
      <p>Ihr kompakter Leitfaden zur steuerlichen Forschungsförderung in Deutschland — aktualisiert für 2026.</p>
    </div>
    <div class="body1">
      <div class="section-title"><div class="accent-bar"></div> Was ist das FZulG?</div>
      <p class="body-text">Das Forschungszulagengesetz (FZulG) gewährt Unternehmen jeder Größe und Branche eine steuerliche Zulage für Forschung und Entwicklung. Der Staat erstattet <strong>25 %</strong> (KMU: <strong>35 %</strong>) der förderfähigen F&E-Personalkosten direkt als Steuerbonus — oder als Barauszahlung bei Verlustvortrag.</p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">${icons.percent}</div>
          <div class="stat-num">25–35 %</div>
          <div class="stat-label">F&E-Personalkosten<br>als Steuererstattung</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">${icons.euro.replace(/stroke="${C.accent}"/g, 'stroke="#10B981"')}</div>
          <div class="stat-num">bis €4,2 Mio.</div>
          <div class="stat-label">max. Förderung/Jahr<br>(KMU: 35 % × €12 Mio.)</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">${icons.building}</div>
          <div class="stat-num">€12 Mio.</div>
          <div class="stat-label">Bemessungsgrundlage<br>seit 01.01.2026</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">${icons.calendar}</div>
          <div class="stat-num">ab 2020</div>
          <div class="stat-label">rückwirkend<br>beantragbar</div>
        </div>
      </div>

      <div class="section-title" style="margin-top:18px"><div class="accent-bar"></div> Wer ist berechtigt?</div>
      <ul class="check-list">
        <li class="check-item"><div class="check-icon">${icons.checkWhite}</div><span>Unbeschränkte oder beschränkte Steuerpflicht in Deutschland</span></li>
        <li class="check-item"><div class="check-icon">${icons.checkWhite}</div><span>Unabhängig von Unternehmensgröße, Mitarbeiteranzahl und Umsatz</span></li>
        <li class="check-item"><div class="check-icon">${icons.checkWhite}</div><span>Alle Branchen: Software, Maschinenbau, Pharma, Automotive, Bau u. v. m.</span></li>
        <li class="check-item"><div class="check-icon">${icons.checkWhite}</div><span>Rückwirkend für alle offenen Steuerjahre ab 01.01.2020</span></li>
      </ul>

      <div class="section-title" style="margin-top:18px"><div class="accent-bar"></div> Was ist förderfähig?</div>
      <ul class="check-list">
        <li class="check-item"><div class="check-icon">${icons.checkWhite}</div><span>Personalkosten interner F&E-Mitarbeiter (25 % Standard, 35 % KMU)</span></li>
        <li class="check-item"><div class="check-icon">${icons.checkWhite}</div><span>Auftragsforschung im EWR: 70 % anrechenbar (seit 2026, vorher 60 %)</span></li>
        <li class="check-item"><div class="check-icon">${icons.checkWhite}</div><span>Eigenleistungen: €100 pro Stunde (seit 2026, vorher €70)</span></li>
        <li class="check-item"><div class="check-icon">${icons.checkWhite}</div><span>Gemeinkostenpauschale: +20 % auf direkte Projektkosten (neu ab 2026)</span></li>
      </ul>
    </div>
    <div class="footer"><span>© 2026 NOVARIS Consulting · Stand: Januar 2026</span><span>Seite 1 / 2</span></div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div class="p2-header">
      <h2>NOVARIS — Ihr Partner für die Forschungszulage</h2>
      <p>Vier Gründe, warum führende Unternehmen auf NOVARIS setzen.</p>
    </div>
    <div class="p2-body">
      <div class="usp-grid">
        <div class="usp-card">
          <div style="flex-shrink:0">${icons.shield}</div>
          <div><h4>Erfolgsbasierte Vergütung</h4><p>Sie zahlen erst bei erfolgreicher Bewilligung. Keine Vorabkosten, keine versteckten Gebühren.</p></div>
        </div>
        <div class="usp-card">
          <div style="flex-shrink:0">${icons.doc}</div>
          <div><h4>GoBD-konforme Dokumentation</h4><p>Unsere Software erstellt Ihre F&E-Dokumentation automatisch — prüfungssicher und vollständig digital.</p></div>
        </div>
        <div class="usp-card">
          <div style="flex-shrink:0">${icons.trophy}</div>
          <div><h4>100 % Bewilligungsquote</h4><p>Kein anderer FZulG-Dienstleister erreicht eine hundertprozentige Bewilligungsquote bei der BSFZ.</p></div>
        </div>
        <div class="usp-card">
          <div style="flex-shrink:0">${icons.euro}</div>
          <div><h4>Bis zu 40 % günstiger</h4><p>Unser Honorar liegt deutlich unter dem Branchendurchschnitt — ohne Kompromisse bei der Qualität.</p></div>
        </div>
      </div>

      <div class="section-title" style="font-size:14px"><div class="accent-bar"></div> Unser Prozess in 4 Schritten</div>
      <div class="process">
        <div class="step"><div class="step-num">1</div><div class="step-title">Erstanalyse</div><div class="step-desc">Kostenlose Prüfung<br>Ihres Förderpotenzials</div></div>
        <div class="step-arrow">${icons.arrowRight}</div>
        <div class="step"><div class="step-num">2</div><div class="step-title">Dokumentation</div><div class="step-desc">GoBD-konforme Erfassung<br>Ihrer F&E-Projekte</div></div>
        <div class="step-arrow">${icons.arrowRight}</div>
        <div class="step"><div class="step-num">3</div><div class="step-title">Antragstellung</div><div class="step-desc">BSFZ-Bescheinigung &<br>Finanzamtantrag</div></div>
        <div class="step-arrow">${icons.arrowRight}</div>
        <div class="step"><div class="step-num">4</div><div class="step-title">Auszahlung</div><div class="step-desc">Steuererstattung oder<br>Barauszahlung</div></div>
      </div>

      <div class="cta-box">
        <h3>Prüfen Sie Ihr Förderpotenzial — kostenlos</h3>
        <p>Unverbindliche Erstanalyse in weniger als 48 Stunden.</p>
        <div class="cta-btn">novaris-consulting.com</div>
      </div>
    </div>
    <div class="footer"><span>© 2026 NOVARIS Consulting · Stand: Januar 2026</span><span>Seite 2 / 2</span></div>
  </div>
  </body></html>`;
}

// ══════════════════════════════════════════════
//  EXTENDED WHITEPAPER — 9 pages, premium design
// ══════════════════════════════════════════════
function whitepaperHtml() {
  const pageBase = `width:210mm; height:297mm; position:relative; overflow:hidden; page-break-after:always;`;

  const slideHeader = (title, subtitle) => `
    <div style="background:linear-gradient(135deg,${C.navy} 0%,${C.deep} 60%,${C.accent} 120%);padding:28px 48px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(126,206,245,0.1),transparent 70%)"></div>
      <div style="display:flex;align-items:center;gap:12px;position:relative;z-index:1">
        <div style="width:4px;height:28px;border-radius:2px;background:linear-gradient(180deg,${C.light},${C.sky})"></div>
        <div>
          <h2 style="font-size:20px;font-weight:800;color:white;letter-spacing:-0.02em">${title}</h2>
          ${subtitle ? `<p style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px">${subtitle}</p>` : ''}
        </div>
      </div>
    </div>`;

  const footer = (pg) => `
    <div style="position:absolute;bottom:0;left:0;right:0;background:${C.navy};padding:12px 48px;display:flex;justify-content:space-between;align-items:center">
      <span style="color:rgba(255,255,255,0.35);font-size:8.5px">© 2026 NOVARIS Consulting · Vertraulich · Stand: Januar 2026</span>
      <div style="display:flex;align-items:center;gap:8px">
        ${logoSvgBase64 ? `<img src="${logoSvgBase64}" style="height:14px;opacity:0.4" alt="">` : ''}
        <span style="color:rgba(255,255,255,0.35);font-size:8.5px">Seite ${pg} / 9</span>
      </div>
    </div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseCss}
    .icon-circle {
      width:72px; height:72px; border-radius:50%;
      background:${C.bg}; border:1px solid ${C.border};
      display:flex; align-items:center; justify-content:center;
      margin:0 auto 14px;
      box-shadow:0 2px 12px rgba(15,39,71,0.06);
    }
    .numbered-card {
      display:flex; align-items:flex-start; gap:16px;
      padding:20px; background:white; border-radius:12px;
      border:1px solid ${C.border};
      box-shadow:0 1px 4px rgba(15,39,71,0.04), 0 4px 16px rgba(15,39,71,0.03);
    }
    .num-circle {
      width:36px; height:36px; border-radius:50%;
      background:linear-gradient(135deg,${C.deep},${C.accent});
      color:white; font-family:'Montserrat'; font-weight:800; font-size:15px;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
      box-shadow:0 2px 8px rgba(30,109,181,0.2);
    }
    .stat-circle {
      border-radius:50%; display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      box-shadow:0 4px 20px rgba(15,39,71,0.08);
    }
    .benefit-card {
      text-align:center; padding:24px 14px; background:white;
      border-radius:12px; border:1px solid ${C.border};
      box-shadow:0 1px 4px rgba(15,39,71,0.04), 0 4px 16px rgba(15,39,71,0.03);
    }
  </style></head><body>

  <!-- P1: COVER -->
  <div style="${pageBase} background:linear-gradient(160deg,${C.navy} 0%,${C.deep} 45%,${C.accent} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden">
      <div style="position:absolute;top:-100px;right:-100px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(126,206,245,0.08),transparent 60%)"></div>
      <div style="position:absolute;bottom:-80px;left:-80px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(79,163,227,0.06),transparent 60%)"></div>
    </div>
    ${logoSvgBase64 ? `<img src="${logoSvgBase64}" style="height:48px;margin-bottom:44px;position:relative;z-index:1" alt="NOVARIS">` : ''}
    <div style="position:relative;z-index:1;max-width:540px">
      <p style="font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:${C.sky};margin-bottom:16px">Steuerliche Forschungsförderung · FZulG 2026</p>
      <h1 style="font-size:32px;font-weight:300;color:white;line-height:1.35">Erfolgreich &amp; ohne Risiko bis zu<br><strong style="font-weight:800">4,2 Mio. €</strong> Forschungsförderung pro Jahr</h1>
      <div style="width:60px;height:2px;background:linear-gradient(90deg,${C.light},${C.sky});margin:28px auto;opacity:0.6;border-radius:1px"></div>
      <p style="color:rgba(255,255,255,0.5);font-size:12px">NOVARIS Consulting · Ihr Partner für die Forschungszulage</p>
    </div>
    ${footer(1)}
  </div>

  <!-- P2: BEGRIFFSERKLÄRUNG -->
  <div style="${pageBase} background:${C.bg}">
    ${slideHeader('Begriffserklärung', 'Steuerliche Forschungsförderung in Deutschland')}
    <div style="padding:48px;text-align:center">
      <h3 style="font-size:24px;color:${C.deep};font-weight:700;margin-bottom:10px">
        <span style="font-weight:800;color:${C.accent}">S</span>teuerliche
        <span style="font-weight:800;color:${C.accent}">F</span>orschungs
        <span style="font-weight:800;color:${C.accent}">F</span>örderung
      </h3>
      <p style="font-size:12px;color:${C.muted};max-width:400px;margin:0 auto 36px">Das FZulG fördert Forschung und Entwicklung durch eine direkte Steuergutschrift — branchenunabhängig und größenunabhängig.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;max-width:580px;margin:0 auto">
        <div style="text-align:center">
          <div class="icon-circle">${icons.building}</div>
          <h4 style="font-size:13px;color:${C.navy};font-weight:700;margin-bottom:6px">Steuergutschrift</h4>
          <p style="font-size:11px;color:${C.muted};line-height:1.5">Direkte Steuergutschrift für F&E-Aufwendungen — intern und extern</p>
        </div>
        <div style="text-align:center">
          <div class="icon-circle">${icons.users}</div>
          <h4 style="font-size:13px;color:${C.navy};font-weight:700;margin-bottom:6px">25–35 % Erstattung</h4>
          <p style="font-size:11px;color:${C.muted};line-height:1.5">25 % der Personalkosten (Standard) bzw. 35 % für KMU vom Finanzamt</p>
        </div>
        <div style="text-align:center">
          <div class="icon-circle">${icons.euro}</div>
          <h4 style="font-size:13px;color:${C.navy};font-weight:700;margin-bottom:6px">Bis zu €4,2 Mio./Jahr</h4>
          <p style="font-size:11px;color:${C.muted};line-height:1.5">Bemessungsgrundlage €12 Mio. pro Unternehmensverbund (seit 2026)</p>
        </div>
      </div>
    </div>
    ${footer(2)}
  </div>

  <!-- P3: WAS WIRD BEMESSEN? -->
  <div style="${pageBase} background:${C.bg}">
    ${slideHeader('Was wird bemessen?', 'Förderfähige Aufwendungen und Höchstbeträge')}
    <div style="padding:40px 48px">
      <div style="display:flex;gap:28px;align-items:center;justify-content:center;margin-bottom:32px">
        <div style="text-align:center">
          <div class="stat-circle" style="width:150px;height:150px;background:white;border:4px solid ${C.border};border-top-color:${C.accent};border-right-color:${C.accent}">
            <div style="font-family:'Montserrat';font-size:28px;font-weight:800;color:${C.deep}">25–35 %</div>
            <div style="font-size:10px;color:${C.muted};margin-top:4px;max-width:110px;line-height:1.3">Lohnkosten für<br>interne F&E-Aufwände</div>
          </div>
        </div>
        <div style="text-align:center">
          <div class="stat-circle" style="width:120px;height:120px;background:white;border:4px solid ${C.border};border-top-color:${C.light};border-right-color:${C.light}">
            <div style="font-family:'Montserrat';font-size:24px;font-weight:800;color:${C.deep}">70 %</div>
            <div style="font-size:9px;color:${C.muted};margin-top:3px;max-width:100px;line-height:1.3">der externen Auftrags-<br>forschung anrechenbar</div>
          </div>
        </div>
        <div style="text-align:center">
          <div class="stat-circle" style="width:170px;height:170px;background:linear-gradient(135deg,${C.deep},${C.accent});color:white">
            <div style="font-family:'Montserrat';font-size:26px;font-weight:800">€12 Mio.</div>
            <div style="font-size:11px;opacity:0.7;margin-top:4px">Bemessungsgrundlage<br>pro Unternehmensverbund</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:560px;margin:0 auto">
        <div style="background:white;border-radius:10px;padding:16px 18px;border:1px solid ${C.border};display:flex;gap:12px;align-items:flex-start">
          <div style="flex-shrink:0;margin-top:2px">${icons.percent.replace(/width="32" height="32"/g, 'width="22" height="22"')}</div>
          <div>
            <h4 style="font-size:12px;font-weight:700;color:${C.navy};margin-bottom:3px">Maximale Förderung</h4>
            <p style="font-size:10.5px;color:${C.muted};line-height:1.5">Standard: <strong>€3 Mio.</strong>/Jahr (25 %)<br>KMU: <strong>€4,2 Mio.</strong>/Jahr (35 %)</p>
          </div>
        </div>
        <div style="background:white;border-radius:10px;padding:16px 18px;border:1px solid ${C.border};display:flex;gap:12px;align-items:flex-start">
          <div style="flex-shrink:0;margin-top:2px">${icons.users.replace(/width="28" height="28"/g, 'width="22" height="22"')}</div>
          <div>
            <h4 style="font-size:12px;font-weight:700;color:${C.navy};margin-bottom:3px">Eigenleistungen</h4>
            <p style="font-size:10.5px;color:${C.muted};line-height:1.5">Gesellschafter-Geschäftsführer:<br><strong>€100</strong>/Stunde (seit 2026)</p>
          </div>
        </div>
        <div style="background:white;border-radius:10px;padding:16px 18px;border:1px solid ${C.border};display:flex;gap:12px;align-items:flex-start;grid-column:span 2">
          <div style="flex-shrink:0;margin-top:2px">${icons.doc.replace(/width="28" height="28"/g, 'width="22" height="22"')}</div>
          <div>
            <h4 style="font-size:12px;font-weight:700;color:${C.navy};margin-bottom:3px">Gemeinkostenpauschale (neu ab 2026)</h4>
            <p style="font-size:10.5px;color:${C.muted};line-height:1.5">Zusätzlich <strong>20 %</strong> auf die förderfähigen direkten Projektkosten für Gemeinkosten und sonstige Betriebskosten.</p>
          </div>
        </div>
      </div>
    </div>
    ${footer(3)}
  </div>

  <!-- P4: ANTRAGSVORAUSSETZUNGEN -->
  <div style="${pageBase} background:${C.bg}">
    ${slideHeader('Antragsvoraussetzungen', 'Wer kann die Forschungszulage beantragen?')}
    <div style="padding:48px;display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:600px;margin:0 auto">
      <div class="numbered-card">
        <div class="num-circle">1</div>
        <div>
          <h4 style="font-size:13px;font-weight:700;color:${C.navy};margin-bottom:4px">Steuerpflicht</h4>
          <p style="font-size:11.5px;color:${C.muted};line-height:1.5">Unbeschränkte oder beschränkte Steuerpflicht in Deutschland</p>
        </div>
      </div>
      <div class="numbered-card">
        <div class="num-circle">2</div>
        <div>
          <h4 style="font-size:13px;font-weight:700;color:${C.navy};margin-bottom:4px">Größenunabhängig</h4>
          <p style="font-size:11.5px;color:${C.muted};line-height:1.5">Unabhängig von Größe, Mitarbeiteranzahl und Umsatz</p>
        </div>
      </div>
      <div class="numbered-card">
        <div class="num-circle">3</div>
        <div>
          <h4 style="font-size:13px;font-weight:700;color:${C.navy};margin-bottom:4px">Rückwirkend ab 2020</h4>
          <p style="font-size:11.5px;color:${C.muted};line-height:1.5">Alle Aufwände mit Projektstart ab 01.01.2020, auch rückwirkend geltend machbar</p>
        </div>
      </div>
      <div class="numbered-card">
        <div class="num-circle">4</div>
        <div>
          <h4 style="font-size:13px;font-weight:700;color:${C.navy};margin-bottom:4px">Wirtschaftsjahr</h4>
          <p style="font-size:11.5px;color:${C.muted};line-height:1.5">Geltendmachung nach Ablauf des Wirtschaftsjahres</p>
        </div>
      </div>
    </div>
    ${decoDotsGrid(0.06)}
    ${footer(4)}
  </div>

  <!-- P5: FÖRDERFÄHIGE F&E-KRITERIEN -->
  <div style="${pageBase} background:${C.bg}">
    ${slideHeader('Förderfähige F&E-Kriterien', 'Wann gilt ein Projekt als Forschung und Entwicklung?')}
    <div style="padding:48px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;text-align:center;max-width:580px;margin:0 auto">
      <div>
        <div class="icon-circle" style="width:80px;height:80px">${icons.target}</div>
        <h4 style="font-size:15px;color:${C.deep};font-weight:700;margin-bottom:8px">Planbarkeit</h4>
        <p style="font-size:11px;color:${C.muted};line-height:1.55">Das Vorhaben muss systematisch geplant und strukturiert durchgeführt werden.</p>
      </div>
      <div>
        <div class="icon-circle" style="width:80px;height:80px">${icons.rocket}</div>
        <h4 style="font-size:15px;color:${C.deep};font-weight:700;margin-bottom:8px">Neuartigkeit</h4>
        <p style="font-size:11px;color:${C.muted};line-height:1.55">Das Projekt zielt auf die Schaffung neuen Wissens oder neuer Fähigkeiten ab.</p>
      </div>
      <div>
        <div class="icon-circle" style="width:80px;height:80px">${icons.flask}</div>
        <h4 style="font-size:15px;color:${C.deep};font-weight:700;margin-bottom:8px">Technisches Risiko</h4>
        <p style="font-size:11px;color:${C.muted};line-height:1.55">Das Ergebnis war zu Projektbeginn unsicher und nicht vorhersehbar.</p>
      </div>
    </div>
    <div style="max-width:480px;margin:0 auto;padding:0 48px">
      <div style="background:white;border-radius:12px;padding:20px 24px;border:1px solid ${C.border};text-align:center;box-shadow:0 1px 4px rgba(15,39,71,0.04)">
        <p style="font-size:11.5px;color:${C.muted};line-height:1.6"><strong style="color:${C.navy}">Wichtig:</strong> Die Kriterien orientieren sich am Frascati-Handbuch der OECD. Entscheidend ist der <strong>Erkenntnisgewinn</strong> und die <strong>technische Unsicherheit</strong> — nicht das kommerzielle Ergebnis.</p>
      </div>
    </div>
    ${footer(5)}
  </div>

  <!-- P6: BEANTRAGUNGSPROZESS -->
  <div style="${pageBase} background:${C.bg}">
    ${slideHeader('Beantragungsprozess', 'Zweistufiges Verfahren: BSFZ + Finanzamt')}
    <div style="padding:36px 48px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
        <div style="background:white;border-radius:12px;padding:22px;border:1px solid ${C.border};box-shadow:0 1px 4px rgba(15,39,71,0.04);display:flex;align-items:flex-start;gap:14px">
          <div class="num-circle" style="font-size:16px">1</div>
          <div>
            <h4 style="font-size:13px;font-weight:700;color:${C.navy};margin-bottom:5px">Antrag bei der BSFZ</h4>
            <p style="font-size:11px;color:${C.muted};line-height:1.55">Das Unternehmen stellt einen Antrag bei der Bescheinigungsstelle Forschungszulage. Die BSFZ prüft, ob ein förderfähiges F&E-Vorhaben vorliegt, und erteilt die Bescheinigung.</p>
          </div>
        </div>
        <div style="background:white;border-radius:12px;padding:22px;border:1px solid ${C.border};box-shadow:0 1px 4px rgba(15,39,71,0.04);display:flex;align-items:flex-start;gap:14px">
          <div class="num-circle" style="font-size:16px">2</div>
          <div>
            <h4 style="font-size:13px;font-weight:700;color:${C.navy};margin-bottom:5px">Festsetzung beim Finanzamt</h4>
            <p style="font-size:11px;color:${C.muted};line-height:1.55">Nach Erhalt der BSFZ-Bescheinigung reicht das Unternehmen den Antrag beim zuständigen Finanzamt ein. Dieses setzt die Forschungszulage fest und verrechnet oder zahlt aus.</p>
          </div>
        </div>
      </div>

      <div style="background:white;border-radius:12px;padding:28px;border:1px solid ${C.border};box-shadow:0 1px 4px rgba(15,39,71,0.04)">
        <p style="font-size:10px;font-weight:600;color:${C.accent};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;text-align:center">Prozessübersicht</p>
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap">
          <div style="text-align:center;padding:12px 16px;background:${C.bg};border-radius:10px;min-width:80px">
            <div style="margin-bottom:4px">${icons.clipboard.replace(/width="28" height="28"/g, 'width="24" height="24"')}</div>
            <div style="font-size:10px;color:${C.navy};font-weight:600">Antrag</div>
          </div>
          <div>${icons.arrowRight}</div>
          <div style="text-align:center;padding:12px 16px;background:${C.bg};border-radius:10px;min-width:80px">
            <div style="margin-bottom:4px">${icons.search.replace(/width="28" height="28"/g, 'width="24" height="24"')}</div>
            <div style="font-size:10px;color:${C.navy};font-weight:600">BSFZ-Prüfung</div>
          </div>
          <div>${icons.arrowRight}</div>
          <div style="text-align:center;padding:12px 16px;background:${C.bg};border-radius:10px;min-width:80px">
            <div style="margin-bottom:4px">${icons.check.replace(/width="20" height="20"/g, 'width="24" height="24"')}</div>
            <div style="font-size:10px;color:${C.navy};font-weight:600">Bewilligung</div>
          </div>
          <div>${icons.arrowRight}</div>
          <div style="text-align:center;padding:12px 16px;background:${C.bg};border-radius:10px;min-width:80px">
            <div style="margin-bottom:4px">${icons.building.replace(/width="28" height="28"/g, 'width="24" height="24"')}</div>
            <div style="font-size:10px;color:${C.navy};font-weight:600">Finanzamt</div>
          </div>
          <div>${icons.arrowRight}</div>
          <div style="text-align:center;padding:12px 16px;background:linear-gradient(135deg,${C.deep},${C.accent});border-radius:10px;min-width:80px">
            <div style="margin-bottom:4px">${icons.euro.replace(/stroke="${C.accent}"/g, 'stroke="#fff"').replace(/width="28" height="28"/g, 'width="24" height="24"')}</div>
            <div style="font-size:10px;color:white;font-weight:600">Auszahlung</div>
          </div>
        </div>
      </div>
    </div>
    ${footer(6)}
  </div>

  <!-- P7: DOKUMENTATION -->
  <div style="${pageBase} background:${C.bg}">
    ${slideHeader('Wichtige Aspekte der Dokumentation', 'Anforderungen an die F&E-Dokumentation')}
    <div style="padding:48px;display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:600px;margin:0 auto">
      <div class="numbered-card">
        <div class="num-circle">1</div>
        <div>
          <h4 style="font-size:13px;font-weight:700;color:${C.navy};margin-bottom:4px">Doppelförderungsverbot</h4>
          <p style="font-size:11px;color:${C.muted};line-height:1.5">Gemäß §7 Abs. 2 FZulG: Keine parallele Inanspruchnahme anderer Förderungen für dieselben Aufwände.</p>
        </div>
      </div>
      <div class="numbered-card">
        <div class="num-circle">2</div>
        <div>
          <h4 style="font-size:13px;font-weight:700;color:${C.navy};margin-bottom:4px">Einmalige Geltendmachung</h4>
          <p style="font-size:11px;color:${C.muted};line-height:1.5">Pro Wirtschaftsjahr wird die Forschungszulage einmalig beantragt und festgesetzt.</p>
        </div>
      </div>
      <div class="numbered-card">
        <div class="num-circle">3</div>
        <div>
          <h4 style="font-size:13px;font-weight:700;color:${C.navy};margin-bottom:4px">Fortschrittsdokumentation</h4>
          <p style="font-size:11px;color:${C.muted};line-height:1.5">Laufende Dokumentation des Projektfortschritts, der Aufwände und Gehälter.</p>
        </div>
      </div>
      <div class="numbered-card">
        <div class="num-circle">4</div>
        <div>
          <h4 style="font-size:13px;font-weight:700;color:${C.navy};margin-bottom:4px">GoBD-Konformität</h4>
          <p style="font-size:11px;color:${C.muted};line-height:1.5">Alle Unterlagen müssen revisionssicher und GoBD-konform archiviert werden.</p>
        </div>
      </div>
    </div>
    ${decoDotsGrid(0.06)}
    ${footer(7)}
  </div>

  <!-- P8: ZUSAMMENARBEIT -->
  <div style="${pageBase} background:${C.bg}">
    ${slideHeader('Zusammenarbeit mit NOVARIS', 'Modalitäten und Honorarmodell')}
    <div style="padding:44px 48px;display:flex;gap:40px;align-items:center;justify-content:center">
      <!-- Pie-chart style visual -->
      <div style="position:relative;width:220px;height:220px;flex-shrink:0">
        <svg viewBox="0 0 220 220" style="width:100%;height:100%">
          <circle cx="110" cy="110" r="95" fill="none" stroke="${C.border}" stroke-width="16"/>
          <circle cx="110" cy="110" r="95" fill="none" stroke="${C.deep}" stroke-width="16"
            stroke-dasharray="${0.25 * 2 * Math.PI * 95} ${2 * Math.PI * 95}"
            stroke-dashoffset="${0.25 * 2 * Math.PI * 95}" transform="rotate(-90 110 110)"/>
          <circle cx="110" cy="110" r="95" fill="none" stroke="${C.accent}" stroke-width="16"
            stroke-dasharray="${0.05 * 2 * Math.PI * 95} ${2 * Math.PI * 95}"
            stroke-dashoffset="${(0.25 + 0.05) * 2 * Math.PI * 95}" transform="rotate(-90 110 110)"/>
        </svg>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
          <div style="font-family:'Montserrat';font-size:14px;font-weight:800;color:${C.deep}">Honorarmodell</div>
          <div style="font-size:10px;color:${C.muted}">Erfolgsbasiert</div>
        </div>
      </div>

      <div style="max-width:320px">
        <h3 style="font-size:16px;color:${C.deep};font-weight:700;margin-bottom:20px">Modalitäten der Zusammenarbeit</h3>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:16px;height:16px;border-radius:4px;background:${C.border};flex-shrink:0"></div>
            <div>
              <p style="font-size:12px;color:${C.text};font-weight:600">Bescheinigte Kosten</p>
              <p style="font-size:10px;color:${C.muted}">Ihre qualifizierten F&E-Projektkosten</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:16px;height:16px;border-radius:4px;background:${C.deep};flex-shrink:0"></div>
            <div>
              <p style="font-size:12px;color:${C.text};font-weight:600">Fördersumme (25–35 %)</p>
              <p style="font-size:10px;color:${C.muted}">Ihre Steuererstattung durch das Finanzamt</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:16px;height:16px;border-radius:4px;background:${C.accent};flex-shrink:0"></div>
            <div>
              <p style="font-size:12px;color:${C.text};font-weight:600">NOVARIS Honorar (5 %)</p>
              <p style="font-size:10px;color:${C.muted}">Nur bei Erfolg — bezogen auf bescheinigte Kosten</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${footer(8)}
  </div>

  <!-- P9: VORTEILE EINER ZUSAMMENARBEIT -->
  <div style="${pageBase} background:${C.bg};page-break-after:auto">
    ${slideHeader('Vorteile einer Zusammenarbeit', 'Warum NOVARIS Ihr idealer Partner ist')}
    <div style="padding:40px 48px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;margin-bottom:28px">
      <div class="benefit-card">
        <div style="margin-bottom:12px;display:flex;justify-content:center">${icons.euro}</div>
        <h4 style="font-size:12px;color:${C.navy};font-weight:700;margin-bottom:6px">Kostenanalyse</h4>
        <p style="font-size:10.5px;color:${C.muted};line-height:1.5">Analyse und Qualifikation Ihrer ansetzbaren F&E-Kosten</p>
      </div>
      <div class="benefit-card">
        <div style="margin-bottom:12px;display:flex;justify-content:center">${icons.search}</div>
        <h4 style="font-size:12px;color:${C.navy};font-weight:700;margin-bottom:6px">Förderfähigkeitsprüfung</h4>
        <p style="font-size:10.5px;color:${C.muted};line-height:1.5">Prüfung Ihrer Projekte auf FZulG-Förderfähigkeit</p>
      </div>
      <div class="benefit-card">
        <div style="margin-bottom:12px;display:flex;justify-content:center">${icons.clipboard}</div>
        <h4 style="font-size:12px;color:${C.navy};font-weight:700;margin-bottom:6px">Antragserstellung</h4>
        <p style="font-size:10.5px;color:${C.muted};line-height:1.5">Vollumfängliche Erstellung des Förderantrags inkl. Rückfragen</p>
      </div>
      <div class="benefit-card">
        <div style="margin-bottom:12px;display:flex;justify-content:center">${icons.shield}</div>
        <h4 style="font-size:12px;color:${C.navy};font-weight:700;margin-bottom:6px">Erfolgsbasiert</h4>
        <p style="font-size:10.5px;color:${C.muted};line-height:1.5">Erfolgsbasiertes Honorar — Sie zahlen nur bei Bewilligung</p>
      </div>
    </div>
    <div style="margin:0 48px;padding:28px;background:linear-gradient(135deg,${C.navy} 0%,${C.deep} 60%,${C.accent} 120%);border-radius:12px;text-align:center;color:white;position:relative;overflow:hidden">
      <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(126,206,245,0.1),transparent 70%)"></div>
      <h3 style="font-size:18px;font-weight:800;margin-bottom:6px;position:relative;z-index:1">Bereit für Ihre Forschungszulage?</h3>
      <p style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:12px;position:relative;z-index:1">Kostenlose und unverbindliche Erstanalyse in weniger als 48 Stunden.</p>
      <div style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);padding:10px 28px;border-radius:8px;font-weight:700;font-size:13px;position:relative;z-index:1">novaris-consulting.com</div>
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
