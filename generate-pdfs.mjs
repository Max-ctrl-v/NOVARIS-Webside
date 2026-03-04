/**
 * generate-pdfs.mjs — Generates all NOVARIS PDF materials using Puppeteer
 * Usage: node generate-pdfs.mjs
 *
 * FZulG numbers (Stand: 2026):
 *   - Bemessungsgrundlage: max €12 Mio. pro Unternehmensverbund
 *   - Fördersatz: 25 % (Standard) / 35 % (KMU)
 *   - Max Förderung: €3 Mio. (Standard) / €4,2 Mio. (KMU) pro Jahr
 *   - Auftragsforschung (extern): 17,5 % Fördersatz
 *   - Gemeinkostenpauschale: 20 % auf direkte Projektkosten
 *   - Eigenleistung: €100/Stunde
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

// ── Logo SVG for dark backgrounds (base64 encoded) ──
const logoSvgPath = path.join(__dirname, 'brand_assets', 'Logo V5-light.svg');
const logoSvg = fs.existsSync(logoSvgPath) ? fs.readFileSync(logoSvgPath, 'utf8') : '';
const logoSvgB64 = logoSvg ? `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}` : '';

// ── Logo PNG for light backgrounds ──
const logoPngPath = path.join(__dirname, 'brand_assets', 'Logo V3-transparent.png');
const logoPngB64 = fs.existsSync(logoPngPath)
  ? `data:image/png;base64,${fs.readFileSync(logoPngPath).toString('base64')}`
  : '';

// ══════════════════════════════════════════════
//  DESIGN SYSTEM — matches novaris-consulting.com
// ══════════════════════════════════════════════

// Grain texture SVG (same as website)
const grainSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.04'/%3E%3C/svg%3E")`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family:'Inter',sans-serif; color:#0D1B3E; line-height:1.7;
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
  -webkit-font-smoothing:antialiased;
}
h1,h2,h3,h4,h5 { font-family:'Montserrat',sans-serif; letter-spacing:-0.03em; line-height:1.13; }
p,li,span { font-family:'Inter',sans-serif; line-height:1.7; }

/* ── Page container ── */
.page { width:210mm; height:297mm; position:relative; overflow:hidden; page-break-after:always; }
.page:last-child { page-break-after:auto; }

/* ── Hero backgrounds (matches website hero-bg) ── */
.hero-dark {
  background:
    radial-gradient(ellipse 110% 60% at 55% -5%, rgba(30,86,181,0.30) 0%, transparent 62%),
    radial-gradient(ellipse 55% 55% at 95% 45%, rgba(77,174,229,0.14) 0%, transparent 58%),
    radial-gradient(ellipse 65% 70% at 0% 100%, rgba(13,27,62,0.25) 0%, transparent 60%),
    linear-gradient(160deg, #04091a 0%, #0D1B3E 50%, #122244 100%);
  position:relative;
}
.hero-dark::after {
  content:''; position:absolute; inset:0;
  background-image:${grainSvg};
  pointer-events:none; z-index:1;
}

/* ── Section bg (matches bg-tinted) ── */
.bg-tinted {
  background:
    radial-gradient(ellipse 80% 60% at 90% 10%, rgba(30,86,181,0.055) 0%, transparent 60%),
    radial-gradient(ellipse 60% 60% at 5% 90%, rgba(77,174,229,0.04) 0%, transparent 55%),
    #f5f8fe;
}

/* ── Badge (matches website .badge) ── */
.badge {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 12px; border-radius:999px;
  background:rgba(30,86,181,0.09); border:1px solid rgba(30,86,181,0.20);
  color:#1E56B5;
  font-family:'Montserrat',sans-serif; font-size:8.5px; font-weight:700;
  letter-spacing:0.07em; text-transform:uppercase;
}
.badge-dark {
  background:rgba(77,174,229,0.13); border-color:rgba(77,174,229,0.30); color:#7ECEF5;
}

/* ── Check dot (matches website) ── */
.check-dot {
  width:18px; height:18px; border-radius:999px; flex-shrink:0;
  background:linear-gradient(135deg, #1E56B5, #4DAEE5);
  display:flex; align-items:center; justify-content:center;
}

/* ── Card shadows (matches card-z1, card-z2) ── */
.card-z1 {
  box-shadow:
    0 1px 2px rgba(13,27,62,0.06),
    0 4px 8px rgba(13,27,62,0.06),
    0 0 0 1px rgba(30,86,181,0.06) inset;
}
.card-z2 {
  box-shadow:
    0 2px 4px rgba(13,27,62,0.07),
    0 8px 18px rgba(13,27,62,0.08),
    0 24px 40px rgba(13,27,62,0.05),
    0 0 0 1px rgba(30,86,181,0.08) inset;
}

/* ── Glassmorphism card (matches edge-card) ── */
.glass-card {
  background:rgba(13,27,62,0.70);
  border:1px solid rgba(77,174,229,0.15);
  border-radius:14px;
  backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
}

/* ── Stat gradient text ── */
.stat-gradient {
  font-family:'Montserrat',sans-serif; font-weight:900; letter-spacing:-0.04em;
  background:linear-gradient(135deg, #1E56B5 20%, #4DAEE5 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}

/* ── Button ── */
.btn-primary {
  display:inline-flex; align-items:center; justify-content:center; gap:6px;
  padding:10px 24px;
  background:linear-gradient(135deg, #1E56B5 0%, #1A3462 100%);
  color:#fff;
  font-family:'Montserrat',sans-serif; font-weight:700; font-size:11px;
  border-radius:10px; border:none; text-decoration:none;
  box-shadow:0 4px 14px rgba(30,86,181,0.38), 0 1px 3px rgba(0,0,0,0.22);
}

/* ── Footer ── */
.pdf-footer {
  position:absolute; bottom:0; left:0; right:0;
  background:linear-gradient(160deg, #04091a 0%, #0D1B3E 100%);
  padding:10px 40px; display:flex; justify-content:space-between; align-items:center;
}
.pdf-footer span { color:rgba(255,255,255,0.35); font-size:8px; letter-spacing:0.02em; }
`;

// ── SVG check icon (white, for check-dots) ──
const checkSvg = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

// ── Logo HTML helpers ──
const logoDark = logoSvgB64 ? `<img src="${logoSvgB64}" style="height:30px" alt="NOVARIS">` : '<span style="color:#fff;font-family:Montserrat;font-weight:800;font-size:15px">NOVARIS</span>';
const logoLight = logoPngB64 ? `<img src="${logoPngB64}" style="height:30px" alt="NOVARIS">` : '<span style="color:#0D1B3E;font-family:Montserrat;font-weight:800;font-size:15px">NOVARIS</span>';
const logoSmall = logoSvgB64 ? `<img src="${logoSvgB64}" style="height:13px;opacity:0.4" alt="">` : '';

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
//  INDUSTRY FLYER — 1 page A4
// ══════════════════════════════════════════════
function flyerHtml(b) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>
  <div class="page" style="display:flex;flex-direction:column">

    <!-- HEADER — dark hero matching website -->
    <div class="hero-dark" style="padding:24px 36px 20px;flex-shrink:0">
      <div style="display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2">
        ${logoDark}
        <div class="badge-dark" style="font-size:7.5px;padding:3px 10px">Branchen-Factsheet</div>
      </div>
    </div>

    <!-- HERO TITLE — dark with radial glow -->
    <div class="hero-dark" style="padding:28px 36px 32px;flex-shrink:0">
      <div style="position:relative;z-index:2">
        <h1 style="font-size:26px;font-weight:900;color:#fff;margin-bottom:6px">Forschungszulage für<br>${b.title}</h1>
        <p style="font-size:11.5px;color:rgba(255,255,255,0.55);max-width:380px">Welche F&E-Projekte sind in Ihrer Branche förderfähig? Sichern Sie sich bis zu 35 % Ihrer Personalkosten als Steuererstattung.</p>
      </div>
    </div>

    <!-- CONTENT — light bg-tinted matching website -->
    <div class="bg-tinted" style="flex:1;padding:24px 36px 60px;position:relative">
      <div class="badge" style="margin-bottom:14px">Förderfähige Projektbereiche</div>

      <!-- Project cards with z1 shadow -->
      ${b.cards.map(c => `
      <div class="card-z1" style="background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start">
        <div class="check-dot" style="margin-top:2px">${checkSvg}</div>
        <div>
          <h3 style="font-size:12px;font-weight:700;color:#0D1B3E;margin-bottom:2px">${c.t}</h3>
          <p style="font-size:10.5px;color:#5a6e8c;line-height:1.55">${c.d}</p>
        </div>
      </div>`).join('')}

      <!-- Key facts — glass cards on dark strip -->
      <div class="hero-dark" style="margin:18px -36px 0;padding:20px 36px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;position:relative;z-index:2">
          <div class="glass-card" style="padding:14px 12px;text-align:center">
            <div class="stat-gradient" style="font-size:22px;-webkit-text-fill-color:unset;color:#7ECEF5;font-weight:900">25–35 %</div>
            <div style="font-size:8.5px;color:rgba(255,255,255,0.5);margin-top:2px">Steuererstattung auf<br>F&E-Personalkosten</div>
          </div>
          <div class="glass-card" style="padding:14px 12px;text-align:center">
            <div style="font-family:'Montserrat';font-size:22px;font-weight:900;color:#7ECEF5">€4,2 Mio.</div>
            <div style="font-size:8.5px;color:rgba(255,255,255,0.5);margin-top:2px">max. Förderung/Jahr<br>(KMU, 35 % × €12 Mio.)</div>
          </div>
          <div class="glass-card" style="padding:14px 12px;text-align:center">
            <div style="font-family:'Montserrat';font-size:22px;font-weight:900;color:#7ECEF5">ab 2020</div>
            <div style="font-size:8.5px;color:rgba(255,255,255,0.5);margin-top:2px">rückwirkend<br>beantragbar</div>
          </div>
        </div>

        <!-- USP row -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-top:12px;position:relative;z-index:2">
          ${['0 € Vorabkosten', 'GoBD-konform', '100 % Bewilligung', 'Bis zu 40 % günstiger'].map(t => `
          <div style="text-align:center;padding:8px 4px;border-radius:8px;border:1px solid rgba(77,174,229,0.12);background:rgba(30,86,181,0.15)">
            <div style="font-size:8.5px;color:rgba(255,255,255,0.75);font-weight:600">${t}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="pdf-footer">
      <span>© 2026 NOVARIS Consulting · Stand: Januar 2026</span>
      <div style="display:flex;align-items:center;gap:8px">
        ${logoSmall}
        <span>novaris-consulting.com</span>
      </div>
    </div>
  </div>
  </body></html>`;
}

// ══════════════════════════════════════════════
//  SHORT WHITEPAPER — 2 pages
// ══════════════════════════════════════════════
function leitfadenHtml() {
  const footer = (pg) => `
    <div class="pdf-footer">
      <span>© 2026 NOVARIS Consulting · Stand: Januar 2026</span>
      <div style="display:flex;align-items:center;gap:8px">${logoSmall}<span>Seite ${pg} / 2</span></div>
    </div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>

  <!-- PAGE 1 -->
  <div class="page" style="display:flex;flex-direction:column">
    <!-- Header -->
    <div class="hero-dark" style="padding:22px 40px;flex-shrink:0">
      <div style="display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2">
        ${logoDark}
        <div class="badge-dark" style="font-size:7.5px;padding:3px 10px">Leitfaden</div>
      </div>
    </div>

    <!-- Hero -->
    <div class="hero-dark" style="padding:36px 40px 40px;flex-shrink:0">
      <div style="position:relative;z-index:2">
        <h1 style="font-size:28px;font-weight:900;color:#fff;margin-bottom:6px">Das Forschungszulagen-<br>gesetz (FZulG)</h1>
        <p style="font-size:12px;color:rgba(255,255,255,0.5);max-width:380px">Ihr kompakter Leitfaden zur steuerlichen Forschungsförderung — aktualisiert für 2026.</p>
      </div>
    </div>

    <!-- Content -->
    <div class="bg-tinted" style="flex:1;padding:24px 40px 60px">

      <!-- What is FZulG -->
      <div class="badge" style="margin-bottom:10px">Was ist das FZulG?</div>
      <p style="font-size:11px;color:#5a6e8c;margin-bottom:16px;max-width:480px">Das FZulG gewährt Unternehmen jeder Größe und Branche eine steuerliche Zulage für F&E. Der Staat erstattet <strong style="color:#0D1B3E">25 %</strong> (KMU: <strong style="color:#0D1B3E">35 %</strong>) der förderfähigen Personalkosten — als Steuerbonus oder Barauszahlung.</p>

      <!-- Stats row — white cards with z1 shadow -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:20px">
        ${[
          {n:'25–35 %', l:'Steuererstattung auf<br>F&E-Personalkosten'},
          {n:'€4,2 Mio.', l:'max. Förderung/Jahr<br>(KMU: 35 % × €12 Mio.)'},
          {n:'17,5 %', l:'Fördersatz auf<br>externe Auftragsforschung'},
          {n:'ab 2020', l:'rückwirkend<br>beantragbar'},
        ].map(s => `
        <div class="card-z1" style="background:#fff;border-radius:10px;padding:12px 8px;text-align:center">
          <div class="stat-gradient" style="font-size:18px">${s.n}</div>
          <div style="font-size:8px;color:#5a6e8c;margin-top:2px;line-height:1.35">${s.l}</div>
        </div>`).join('')}
      </div>

      <!-- Who is eligible -->
      <div class="badge" style="margin-bottom:10px">Wer ist berechtigt?</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:18px">
        ${[
          'Unbeschränkte oder beschränkte Steuerpflicht in Deutschland',
          'Unabhängig von Unternehmensgröße, Mitarbeiteranzahl und Umsatz',
          'Alle Branchen: Software, Maschinenbau, Pharma, Automotive, Bau u. v. m.',
          'Rückwirkend für alle offenen Steuerjahre ab 01.01.2020',
        ].map(t => `
        <div style="display:flex;align-items:flex-start;gap:8px">
          <div class="check-dot" style="margin-top:1px">${checkSvg}</div>
          <span style="font-size:10.5px;color:#374151">${t}</span>
        </div>`).join('')}
      </div>

      <!-- What is eligible -->
      <div class="badge" style="margin-bottom:10px">Was ist förderfähig?</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${[
          'Personalkosten interner F&E-Mitarbeiter (25 % Standard, 35 % KMU)',
          'Externe Auftragsforschung im EWR: 17,5 % Fördersatz',
          'Eigenleistungen von Gesellschaftern: €100 pro Stunde (seit 2026)',
          'Gemeinkostenpauschale: +20 % auf direkte Projektkosten (neu ab 2026)',
          'Bemessungsgrundlage: max. €12 Mio. pro Unternehmensverbund',
        ].map(t => `
        <div style="display:flex;align-items:flex-start;gap:8px">
          <div class="check-dot" style="margin-top:1px">${checkSvg}</div>
          <span style="font-size:10.5px;color:#374151">${t}</span>
        </div>`).join('')}
      </div>
    </div>
    ${footer(1)}
  </div>

  <!-- PAGE 2 -->
  <div class="page" style="display:flex;flex-direction:column">
    <!-- Header -->
    <div class="hero-dark" style="padding:30px 40px 34px;flex-shrink:0">
      <div style="position:relative;z-index:2">
        <h2 style="font-size:22px;font-weight:900;color:#fff">NOVARIS — Ihr Partner für<br>die Forschungszulage</h2>
        <p style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:4px">Vier Gründe, warum führende Unternehmen auf NOVARIS setzen.</p>
      </div>
    </div>

    <div class="bg-tinted" style="flex:1;padding:24px 40px 60px">
      <!-- USP cards -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px">
        ${[
          {t:'Erfolgsbasierte Vergütung', d:'Sie zahlen erst bei erfolgreicher Bewilligung. Keine Vorabkosten, keine versteckten Gebühren.'},
          {t:'GoBD-konforme Dokumentation', d:'Unsere Software erstellt Ihre F&E-Dokumentation automatisch — prüfungssicher und vollständig digital.'},
          {t:'100 % Bewilligungsquote', d:'Kein anderer FZulG-Dienstleister erreicht eine hundertprozentige Bewilligungsquote bei der BSFZ.'},
          {t:'Bis zu 40 % günstiger', d:'Unser Honorar liegt deutlich unter dem Branchendurchschnitt — ohne Kompromisse bei der Qualität.'},
        ].map(u => `
        <div class="card-z1" style="background:#fff;border-radius:12px;padding:16px;display:flex;gap:10px;align-items:flex-start">
          <div class="check-dot" style="margin-top:1px">${checkSvg}</div>
          <div>
            <h4 style="font-size:11.5px;font-weight:700;color:#0D1B3E;margin-bottom:2px">${u.t}</h4>
            <p style="font-size:10px;color:#5a6e8c;line-height:1.5">${u.d}</p>
          </div>
        </div>`).join('')}
      </div>

      <!-- Process -->
      <div class="badge" style="margin-bottom:14px">Unser Prozess in 4 Schritten</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:24px">
        ${[
          {n:'1', t:'Erstanalyse', d:'Kostenlose Prüfung Ihres Förderpotenzials'},
          {n:'2', t:'Dokumentation', d:'GoBD-konforme Erfassung Ihrer F&E-Projekte'},
          {n:'3', t:'Antragstellung', d:'BSFZ-Bescheinigung & Finanzamtantrag'},
          {n:'4', t:'Auszahlung', d:'Steuererstattung oder Barauszahlung'},
        ].map(s => `
        <div class="card-z1" style="background:#fff;border-radius:12px;padding:14px;text-align:center">
          <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#1E56B5,#4DAEE5);color:#fff;font-family:'Montserrat';font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px">${s.n}</div>
          <h4 style="font-size:10.5px;font-weight:700;color:#0D1B3E;margin-bottom:2px">${s.t}</h4>
          <p style="font-size:9px;color:#5a6e8c;line-height:1.4">${s.d}</p>
        </div>`).join('')}
      </div>

      <!-- CTA — dark hero style -->
      <div class="hero-dark" style="border-radius:14px;padding:24px;text-align:center;margin:0 -4px">
        <div style="position:relative;z-index:2">
          <h3 style="font-size:17px;font-weight:900;color:#fff;margin-bottom:4px">Prüfen Sie Ihr Förderpotenzial — kostenlos</h3>
          <p style="font-size:10.5px;color:rgba(255,255,255,0.45);margin-bottom:12px">Unverbindliche Erstanalyse in weniger als 48 Stunden.</p>
          <div class="btn-primary" style="font-size:10.5px;padding:8px 22px">novaris-consulting.com</div>
        </div>
      </div>
    </div>
    ${footer(2)}
  </div>
  </body></html>`;
}

// ══════════════════════════════════════════════
//  EXTENDED WHITEPAPER — 9 pages (matches PPT)
// ══════════════════════════════════════════════
function whitepaperHtml() {
  const footer = (pg) => `
    <div class="pdf-footer">
      <span>© 2026 NOVARIS Consulting · Vertraulich · Stand: Januar 2026</span>
      <div style="display:flex;align-items:center;gap:8px">${logoSmall}<span>Seite ${pg} / 9</span></div>
    </div>`;

  // Slide header — dark strip matching hero-dark style
  const slideHeader = (title, sub) => `
    <div class="hero-dark" style="padding:24px 44px;flex-shrink:0">
      <div style="position:relative;z-index:2">
        <h2 style="font-size:19px;font-weight:900;color:#fff">${title}</h2>
        ${sub ? `<p style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px">${sub}</p>` : ''}
      </div>
    </div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>

  <!-- P1: COVER -->
  <div class="page hero-dark" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
    <div style="position:relative;z-index:2">
      ${logoSvgB64 ? `<img src="${logoSvgB64}" style="height:44px;margin-bottom:40px" alt="NOVARIS">` : ''}
      <div class="badge-dark" style="margin-bottom:20px;font-size:7.5px">Steuerliche Forschungsförderung · FZulG 2026</div>
      <h1 style="font-size:30px;font-weight:300;color:#fff;line-height:1.3;max-width:480px;margin:0 auto">Erfolgreich &amp; ohne Risiko bis zu<br><span style="font-weight:900">4,2 Mio. €</span> Forschungsförderung<br>pro Jahr</h1>
      <div style="width:50px;height:2px;background:linear-gradient(90deg,#1E56B5,#4DAEE5);margin:28px auto;border-radius:1px"></div>
      <p style="color:rgba(255,255,255,0.35);font-size:11px">NOVARIS Consulting · Ihr Partner für die Forschungszulage</p>
    </div>
    ${footer(1)}
  </div>

  <!-- P2: BEGRIFFSERKLÄRUNG -->
  <div class="page" style="display:flex;flex-direction:column">
    ${slideHeader('Begriffserklärung', 'Steuerliche Forschungsförderung in Deutschland')}
    <div class="bg-tinted" style="flex:1;padding:40px 44px 60px">
      <div style="text-align:center;margin-bottom:28px">
        <h3 style="font-size:22px;color:#0D1B3E;font-weight:800">
          <span style="color:#1E56B5">S</span>teuerliche
          <span style="color:#1E56B5">F</span>orschungs
          <span style="color:#1E56B5">F</span>örderung
        </h3>
        <p style="font-size:11px;color:#5a6e8c;margin-top:6px;max-width:380px;margin-left:auto;margin-right:auto">Das FZulG fördert F&E durch eine direkte Steuergutschrift — branchenunabhängig und größenunabhängig.</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;max-width:500px;margin:0 auto">
        ${[
          {n:'Steuergutschrift', d:'Direkte Steuergutschrift für interne und externe F&E-Aufwendungen'},
          {n:'25–35 % Erstattung', d:'25 % der Personalkosten (Standard) bzw. 35 % für KMU vom Finanzamt'},
          {n:'Bis zu €4,2 Mio./Jahr', d:'Bemessungsgrundlage €12 Mio. pro Unternehmensverbund (seit 2026)'},
        ].map(item => `
        <div class="card-z2" style="background:#fff;border-radius:14px;padding:20px 16px;text-align:center">
          <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,rgba(30,86,181,0.08),rgba(77,174,229,0.08));display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
            <div class="check-dot" style="width:24px;height:24px">${checkSvg}</div>
          </div>
          <h4 style="font-size:12px;font-weight:700;color:#0D1B3E;margin-bottom:4px">${item.n}</h4>
          <p style="font-size:10px;color:#5a6e8c;line-height:1.5">${item.d}</p>
        </div>`).join('')}
      </div>
    </div>
    ${footer(2)}
  </div>

  <!-- P3: WAS WIRD BEMESSEN? -->
  <div class="page" style="display:flex;flex-direction:column">
    ${slideHeader('Was wird bemessen?', 'Förderfähige Aufwendungen und Höchstbeträge')}
    <div class="bg-tinted" style="flex:1;padding:36px 44px 60px">
      <!-- Big stat circles on dark strip -->
      <div class="hero-dark" style="border-radius:14px;padding:28px;margin-bottom:20px">
        <div style="display:flex;gap:20px;align-items:center;justify-content:center;position:relative;z-index:2">
          <div class="glass-card" style="width:140px;height:140px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
            <div style="font-family:'Montserrat';font-size:26px;font-weight:900;color:#7ECEF5">25–35 %</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.45);margin-top:3px;max-width:100px">Lohnkosten für<br>interne F&E-Aufwände</div>
          </div>
          <div class="glass-card" style="width:110px;height:110px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
            <div style="font-family:'Montserrat';font-size:22px;font-weight:900;color:#7ECEF5">17,5 %</div>
            <div style="font-size:8px;color:rgba(255,255,255,0.4);margin-top:2px;max-width:90px">Fördersatz auf<br>externe Auftragsforschung</div>
          </div>
          <div style="width:160px;height:160px;border-radius:50%;background:linear-gradient(135deg,#1E56B5,#4DAEE5);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:0 8px 32px rgba(30,86,181,0.4)">
            <div style="font-family:'Montserrat';font-size:24px;font-weight:900;color:#fff">€12 Mio.</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.6);margin-top:3px">Bemessungsgrundlage<br>pro Unternehmensverbund</div>
          </div>
        </div>
      </div>

      <!-- Detail cards -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          {t:'Maximale Förderung', d:'Standard: <strong>€3 Mio.</strong>/Jahr (25 %)<br>KMU: <strong>€4,2 Mio.</strong>/Jahr (35 %)'},
          {t:'Eigenleistungen', d:'Gesellschafter-Geschäftsführer:<br><strong>€100</strong> pro Stunde (seit 2026)'},
        ].map(c => `
        <div class="card-z1" style="background:#fff;border-radius:12px;padding:14px 16px;display:flex;gap:10px;align-items:flex-start">
          <div class="check-dot" style="margin-top:1px">${checkSvg}</div>
          <div>
            <h4 style="font-size:11px;font-weight:700;color:#0D1B3E;margin-bottom:2px">${c.t}</h4>
            <p style="font-size:10px;color:#5a6e8c;line-height:1.5">${c.d}</p>
          </div>
        </div>`).join('')}
        <div class="card-z1" style="background:#fff;border-radius:12px;padding:14px 16px;display:flex;gap:10px;align-items:flex-start;grid-column:span 2">
          <div class="check-dot" style="margin-top:1px">${checkSvg}</div>
          <div>
            <h4 style="font-size:11px;font-weight:700;color:#0D1B3E;margin-bottom:2px">Gemeinkostenpauschale (neu ab 2026)</h4>
            <p style="font-size:10px;color:#5a6e8c;line-height:1.5">Zusätzlich <strong>20 %</strong> auf die förderfähigen direkten Projektkosten für Gemeinkosten und sonstige Betriebskosten.</p>
          </div>
        </div>
      </div>
    </div>
    ${footer(3)}
  </div>

  <!-- P4: ANTRAGSVORAUSSETZUNGEN -->
  <div class="page" style="display:flex;flex-direction:column">
    ${slideHeader('Antragsvoraussetzungen', 'Wer kann die Forschungszulage beantragen?')}
    <div class="bg-tinted" style="flex:1;padding:44px;display:flex;align-items:flex-start;justify-content:center">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:520px;width:100%">
        ${[
          {n:'1', t:'Steuerpflicht', d:'Unbeschränkte oder beschränkte Steuerpflicht in Deutschland'},
          {n:'2', t:'Größenunabhängig', d:'Unabhängig von Größe, Mitarbeiteranzahl und Umsatz'},
          {n:'3', t:'Rückwirkend ab 2020', d:'Alle Aufwände mit Projektstart ab 01.01.2020, auch rückwirkend'},
          {n:'4', t:'Wirtschaftsjahr', d:'Geltendmachung nach Ablauf des Wirtschaftsjahres'},
        ].map(c => `
        <div class="card-z2" style="background:#fff;border-radius:14px;padding:18px;display:flex;gap:14px;align-items:flex-start">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#1E56B5,#4DAEE5);color:#fff;font-family:'Montserrat';font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${c.n}</div>
          <div>
            <h4 style="font-size:12px;font-weight:700;color:#0D1B3E;margin-bottom:3px">${c.t}</h4>
            <p style="font-size:10.5px;color:#5a6e8c;line-height:1.5">${c.d}</p>
          </div>
        </div>`).join('')}
      </div>
    </div>
    ${footer(4)}
  </div>

  <!-- P5: FÖRDERFÄHIGE F&E-KRITERIEN -->
  <div class="page" style="display:flex;flex-direction:column">
    ${slideHeader('Förderfähige F&E-Kriterien', 'Wann gilt ein Projekt als Forschung und Entwicklung?')}
    <div class="bg-tinted" style="flex:1;padding:44px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;max-width:520px;margin-bottom:28px">
        ${[
          {t:'Planbarkeit', d:'Das Vorhaben muss systematisch geplant und strukturiert durchgeführt werden.'},
          {t:'Neuartigkeit', d:'Das Projekt zielt auf die Schaffung neuen Wissens oder neuer Fähigkeiten ab.'},
          {t:'Technisches Risiko', d:'Das Ergebnis war zu Projektbeginn unsicher und nicht vorhersehbar.'},
        ].map(c => `
        <div class="card-z2" style="background:#fff;border-radius:14px;padding:20px 16px;text-align:center">
          <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,rgba(30,86,181,0.08),rgba(77,174,229,0.08));display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
            <div class="check-dot" style="width:24px;height:24px">${checkSvg}</div>
          </div>
          <h4 style="font-size:13px;font-weight:700;color:#0D1B3E;margin-bottom:6px">${c.t}</h4>
          <p style="font-size:10.5px;color:#5a6e8c;line-height:1.5">${c.d}</p>
        </div>`).join('')}
      </div>
      <div class="card-z1" style="background:#fff;border-radius:12px;padding:16px 20px;max-width:460px;text-align:center">
        <p style="font-size:10.5px;color:#5a6e8c;line-height:1.55"><strong style="color:#0D1B3E">Wichtig:</strong> Die Kriterien orientieren sich am Frascati-Handbuch der OECD. Entscheidend ist der <strong style="color:#0D1B3E">Erkenntnisgewinn</strong> und die <strong style="color:#0D1B3E">technische Unsicherheit</strong> — nicht das kommerzielle Ergebnis.</p>
      </div>
    </div>
    ${footer(5)}
  </div>

  <!-- P6: BEANTRAGUNGSPROZESS -->
  <div class="page" style="display:flex;flex-direction:column">
    ${slideHeader('Beantragungsprozess', 'Zweistufiges Verfahren: BSFZ + Finanzamt')}
    <div class="bg-tinted" style="flex:1;padding:32px 44px 60px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
        ${[
          {n:'1', t:'Antrag bei der BSFZ', d:'Das Unternehmen stellt einen Antrag bei der Bescheinigungsstelle Forschungszulage. Die BSFZ prüft, ob ein förderfähiges F&E-Vorhaben vorliegt, und erteilt die Bescheinigung.'},
          {n:'2', t:'Festsetzung beim Finanzamt', d:'Nach Erhalt der BSFZ-Bescheinigung reicht das Unternehmen den Antrag beim zuständigen Finanzamt ein. Dieses setzt die Forschungszulage fest und verrechnet oder zahlt aus.'},
        ].map(s => `
        <div class="card-z2" style="background:#fff;border-radius:14px;padding:18px;display:flex;gap:12px;align-items:flex-start">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#1E56B5,#4DAEE5);color:#fff;font-family:'Montserrat';font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${s.n}</div>
          <div>
            <h4 style="font-size:12px;font-weight:700;color:#0D1B3E;margin-bottom:4px">${s.t}</h4>
            <p style="font-size:10.5px;color:#5a6e8c;line-height:1.5">${s.d}</p>
          </div>
        </div>`).join('')}
      </div>

      <!-- Process flow on dark -->
      <div class="hero-dark" style="border-radius:14px;padding:22px 24px">
        <div style="position:relative;z-index:2">
          <div class="badge-dark" style="font-size:7px;margin-bottom:14px">Prozessübersicht</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:8px">
            ${['Antrag', 'BSFZ-Prüfung', 'Bewilligung', 'Finanzamt', 'Auszahlung'].map((step, i, arr) => `
              <div class="glass-card" style="padding:10px 14px;text-align:center;min-width:70px;${i === arr.length - 1 ? 'background:linear-gradient(135deg,#1E56B5,#4DAEE5);border-color:transparent' : ''}">
                <div style="font-size:9px;color:${i === arr.length - 1 ? '#fff' : 'rgba(255,255,255,0.7)'};font-weight:600">${step}</div>
              </div>
              ${i < arr.length - 1 ? '<div style="color:rgba(77,174,229,0.4);font-size:16px">›</div>' : ''}
            `).join('')}
          </div>
        </div>
      </div>
    </div>
    ${footer(6)}
  </div>

  <!-- P7: DOKUMENTATION -->
  <div class="page" style="display:flex;flex-direction:column">
    ${slideHeader('Wichtige Aspekte der Dokumentation', 'Anforderungen an die F&E-Dokumentation')}
    <div class="bg-tinted" style="flex:1;padding:44px;display:flex;align-items:flex-start;justify-content:center">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:520px;width:100%">
        ${[
          {n:'1', t:'Doppelförderungsverbot', d:'Gemäß §7 Abs. 2 FZulG: Keine parallele Inanspruchnahme anderer Förderungen für dieselben Aufwände.'},
          {n:'2', t:'Einmalige Geltendmachung', d:'Pro Wirtschaftsjahr wird die Forschungszulage einmalig beantragt und festgesetzt.'},
          {n:'3', t:'Fortschrittsdokumentation', d:'Laufende Dokumentation des Projektfortschritts, der Aufwände und Gehälter.'},
          {n:'4', t:'GoBD-Konformität', d:'Alle Unterlagen müssen revisionssicher und GoBD-konform archiviert werden.'},
        ].map(c => `
        <div class="card-z2" style="background:#fff;border-radius:14px;padding:18px;display:flex;gap:14px;align-items:flex-start">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#1E56B5,#4DAEE5);color:#fff;font-family:'Montserrat';font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${c.n}</div>
          <div>
            <h4 style="font-size:12px;font-weight:700;color:#0D1B3E;margin-bottom:3px">${c.t}</h4>
            <p style="font-size:10.5px;color:#5a6e8c;line-height:1.5">${c.d}</p>
          </div>
        </div>`).join('')}
      </div>
    </div>
    ${footer(7)}
  </div>

  <!-- P8: ZUSAMMENARBEIT -->
  <div class="page" style="display:flex;flex-direction:column">
    ${slideHeader('Zusammenarbeit mit NOVARIS', 'Modalitäten und Honorarmodell')}
    <div class="bg-tinted" style="flex:1;padding:36px 44px 60px;display:flex;align-items:flex-start;justify-content:center;gap:28px">

      <!-- Donut chart on dark -->
      <div class="hero-dark" style="border-radius:14px;padding:28px;width:220px;flex-shrink:0;text-align:center">
        <div style="position:relative;z-index:2">
          <svg viewBox="0 0 200 200" width="160" height="160" style="margin:0 auto">
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(77,174,229,0.12)" stroke-width="20"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#4DAEE5" stroke-width="20"
              stroke-dasharray="${0.25 * 2 * Math.PI * 80} ${2 * Math.PI * 80}"
              transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#1E56B5" stroke-width="20"
              stroke-dasharray="${0.05 * 2 * Math.PI * 80} ${2 * Math.PI * 80}"
              stroke-dashoffset="${-0.25 * 2 * Math.PI * 80}"
              transform="rotate(-90 100 100)"/>
            <text x="100" y="95" text-anchor="middle" style="font-family:'Montserrat';font-size:13px;font-weight:800;fill:#7ECEF5">Honorar-</text>
            <text x="100" y="112" text-anchor="middle" style="font-family:'Montserrat';font-size:13px;font-weight:800;fill:#7ECEF5">modell</text>
          </svg>
        </div>
      </div>

      <!-- Legend -->
      <div style="max-width:280px;padding-top:10px">
        <div class="badge" style="margin-bottom:16px">Modalitäten</div>
        <div style="display:flex;flex-direction:column;gap:14px">
          ${[
            {c:'rgba(77,174,229,0.12)', t:'Bescheinigte Kosten', d:'Ihre qualifizierten F&E-Projektkosten'},
            {c:'#4DAEE5', t:'Fördersumme (25–35 %)', d:'Ihre Steuererstattung durch das Finanzamt'},
            {c:'#1E56B5', t:'NOVARIS Honorar (5 %)', d:'Nur bei Erfolg — bezogen auf bescheinigte Kosten'},
          ].map(item => `
          <div style="display:flex;align-items:flex-start;gap:10px">
            <div style="width:14px;height:14px;border-radius:4px;background:${item.c};flex-shrink:0;margin-top:2px;border:1px solid rgba(30,86,181,0.1)"></div>
            <div>
              <h4 style="font-size:11px;font-weight:700;color:#0D1B3E">${item.t}</h4>
              <p style="font-size:9.5px;color:#5a6e8c;line-height:1.4">${item.d}</p>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    ${footer(8)}
  </div>

  <!-- P9: VORTEILE EINER ZUSAMMENARBEIT -->
  <div class="page" style="display:flex;flex-direction:column;page-break-after:auto">
    ${slideHeader('Vorteile einer Zusammenarbeit', 'Warum NOVARIS Ihr idealer Partner ist')}
    <div class="bg-tinted" style="flex:1;padding:36px 44px 60px">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:28px">
        ${[
          {t:'Kostenanalyse', d:'Analyse und Qualifikation Ihrer ansetzbaren F&E-Kosten'},
          {t:'Förderfähigkeitsprüfung', d:'Prüfung Ihrer Projekte auf FZulG-Förderfähigkeit'},
          {t:'Antragserstellung', d:'Vollumfängliche Erstellung des Förderantrags inkl. Rückfragen'},
          {t:'Erfolgsbasiert', d:'Erfolgsbasiertes Honorar — Sie zahlen nur bei Bewilligung'},
        ].map(c => `
        <div class="card-z2" style="background:#fff;border-radius:14px;padding:18px 14px;text-align:center">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,rgba(30,86,181,0.08),rgba(77,174,229,0.08));display:flex;align-items:center;justify-content:center;margin:0 auto 10px">
            <div class="check-dot" style="width:22px;height:22px">${checkSvg}</div>
          </div>
          <h4 style="font-size:11px;font-weight:700;color:#0D1B3E;margin-bottom:4px">${c.t}</h4>
          <p style="font-size:9.5px;color:#5a6e8c;line-height:1.5">${c.d}</p>
        </div>`).join('')}
      </div>

      <!-- CTA -->
      <div class="hero-dark" style="border-radius:14px;padding:28px;text-align:center">
        <div style="position:relative;z-index:2">
          <h3 style="font-size:19px;font-weight:900;color:#fff;margin-bottom:4px">Bereit für Ihre Forschungszulage?</h3>
          <p style="font-size:10.5px;color:rgba(255,255,255,0.4);margin-bottom:14px">Kostenlose und unverbindliche Erstanalyse in weniger als 48 Stunden.</p>
          <div class="btn-primary" style="font-size:11px;padding:9px 24px">novaris-consulting.com</div>
        </div>
      </div>
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

    for (const b of branchen) {
      await htmlToPdf(flyerHtml(b), path.join(brDir, `${b.slug}.pdf`));
    }
    await htmlToPdf(leitfadenHtml(), path.join(dlDir, 'fzulg-leitfaden.pdf'));
    await htmlToPdf(whitepaperHtml(), path.join(dlDir, 'fzulg-whitepaper.pdf'));

    console.log('\n  🎉 All 11 PDFs generated successfully!\n');
  } catch (err) {
    console.error('\n  ❌ PDF generation failed:', err.message, '\n');
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
