# Full SEO Audit Report — NOVARIS Consulting
**Date:** 2026-03-13
**Domain:** novaris-consulting.com
**Business Type:** German B2B Consulting — Forschungszulage (R&D Tax Credit)
**Pages Analyzed:** 66 HTML files (30 DE + 30 EN indexable + 6 noindex legal/utility)
**Overall SEO Health Score: 78 / 100**

---

## Executive Summary

NOVARIS Consulting's website demonstrates **strong SEO fundamentals** with excellent structured data, proper hreflang implementation, clean URL structure, and comprehensive topical coverage. The site is a static HTML site with no JS rendering issues, making it highly crawlable.

### Top 5 Critical Issues
1. **No named authors or team page** — largest E-E-A-T gap for a YMYL-adjacent financial services site
2. **Missing BreadcrumbList schema on 20 pages** (all branchen + forschungszulage-antrag)
3. **Large HTML file sizes** (index.html = 198KB) due to inlined Tailwind CSS
4. **No CSP meta tag** on any page — security gap
5. **Pharma page has short title (42ch) and description (88ch)**

### Top 5 Quick Wins
1. Add BreadcrumbList JSON-LD to all 18 branchen pages + forschungszulage-antrag (copy existing pattern)
2. Fix pharma.html title and meta description length
3. Add `loading="lazy"` to all below-fold images consistently
4. Add SRI integrity attribute to i18n.js
5. Compress og-image.png from 678KB to <100KB

---

## 1. Technical SEO (Score: 82/100, Weight: 25%)

### Crawlability — PASS (95/100)
- **robots.txt:** Well-configured. Blocks AI training crawlers (GPTBot, Google-Extended, CCBot, Bytespider, Amazonbot, Meta-ExternalAgent, anthropic-ai, Applebot-Extended). Allows citation crawlers (ClaudeBot, PerplexityBot, ChatGPT-User). Sitemap declared.
- **sitemap.xml:** Valid XML with 60 URLs, proper xhtml namespace for hreflang. All entries correspond to real files. No phantom URLs.
- **noindex directives:** Correctly applied to agb.html, impressum.html, datenschutz.html, 404.html (DE + EN).

| Severity | Issue |
|----------|-------|
| Low | All 60 sitemap `<lastmod>` dates are identical (2026-03-13). Implement per-URL dates based on file modification times. |

### Indexability — PASS (88/100)
- **Canonical tags:** 100% coverage, all self-referencing with absolute HTTPS URLs.
- **Hreflang:** All content pages have bidirectional de/en/x-default tags matching sitemap annotations.

| Severity | Issue |
|----------|-------|
| Medium | `en/forschungszulage-sachkosten.html` and `en/forschungszulage-hoehe.html` have 4 hreflang entries instead of 3 — extra entry may confuse search engines. |

### Security — NEEDS WORK (70/100)
- **HTTPS:** All canonical/og/hreflang URLs use https://. No mixed content.
- **SRI:** All external JS files have integrity hashes except `i18n.js`.

| Severity | Issue |
|----------|-------|
| High | No Content-Security-Policy meta tag on any page. Add CSP for XSS protection. |
| Medium | `i18n.js` loaded without SRI integrity attribute. |

### URL Structure — PASS (95/100)
- Clean, hyphenated, lowercase URLs. Max 2 levels deep. German slugs used for both DE and EN versions (simplifies management).

### Mobile Optimization — PASS (92/100)
- Viewport meta on all pages. Tailwind responsive breakpoints. Fluid typography with `clamp()`. Touch targets adequately sized.

### Core Web Vitals Indicators — NEEDS WORK (68/100)

| Severity | Issue |
|----------|-------|
| High | HTML file sizes too large: index.html (198KB), en/index.html (201KB), erfolge.html (140KB). Inline Tailwind CSS (~25KB+) duplicated on every page. Consider purging unused classes or extracting to cached external file. |
| Medium | `theme.js` loaded without `defer`/`async` (render-blocking). Intentional for FOUC prevention but impacts LCP. Consider inlining critical theme detection. |
| Pass | Font loading excellent: self-hosted, `font-display: swap`, preloaded critical fonts. |
| Pass | Hero logo has `fetchpriority="high"`. |
| Pass | Images have explicit width/height preventing CLS. |

### JavaScript Rendering — PASS (98/100)
- Fully static HTML. No SPA frameworks. All content in initial HTML. Search engines can index without JS execution.

---

## 2. Content Quality (Score: 72/100, Weight: 25%)

### E-E-A-T Assessment

| Signal | Score | Assessment |
|--------|------:|-----------|
| **Experience** | 14/20 | Case studies on erfolge.html with specific figures (1.2M, 1.4M, 620K EUR). But anonymized clients, no named team members, no "Uber uns" page. |
| **Expertise** | 19/25 | Pillar content (forschungszulage.html: 2,666 words) demonstrates deep legal/procedural knowledge. Cites FZulG sections, EU recommendations. |
| **Authoritativeness** | 18/25 | Links to official sources (gesetze-im-internet.de, BSFZ). llms.txt for AI discoverability. 9 industry verticals. But no external citations, press mentions, or partner logos. |
| **Trustworthiness** | 23/30 | Legal pages in footer, transparent pricing model, HTTPS enforced. But no visible address/phone in footer (only in schema), "100% Bewilligungsquote" unsubstantiated, no review widgets. |

### Content Depth

| Page | Words | Status |
|------|------:|--------|
| forschungszulage.html | 2,666 | Excellent pillar content |
| bsfz-ablehnung-widerspruch.html | 2,508 | Strong problem-solving content |
| forschungszulage-antrag.html | 2,388 | Comprehensive guide |
| forschungszulage-2026.html | 2,067 | Thorough coverage |
| erfolge.html | 1,662 | Good case studies |
| index.html | 1,436 | Good for homepage |
| branchen/software-it.html | 1,003 | Meets minimum |
| forschungszulage-rechner.html | 717 | **Borderline thin** — tool page, but needs more explanatory content |

### AI Citation Readiness — 82/100
- **llms.txt** file exists with structured facts and URLs
- FAQ schema on most content pages with well-formed Q&A pairs
- Specific citable numbers: "25%", "35% KMU", "12 Mio. EUR", "4.2 Mio. EUR"
- SpeakableSpecification on multiple pages
- Gap: Calculator page has no FAQ schema; erfolge.html missing FAQ items

### Content Freshness
- Most pages have `dateModified` in Article schema
- `forschungszulage-rechner.html` has **no date signals at all**
- Several pages lack visible "last updated" text (only in JSON-LD)

### Duplicate Content Risk — NONE
- DE/EN properly separated with hreflang, distinct canonical URLs, correct `lang` attributes

---

## 3. On-Page SEO (Score: 82/100, Weight: 20%)

### Title Tags — STRONG (mostly 50-60 chars)

| Severity | Issue |
|----------|-------|
| Critical | `branchen/pharma.html` title only 42 chars — too short, missing keyword context |
| Medium | `forschungszulage-antrag.html` (65ch) and `branchen/software-it.html` (65ch) exceed optimal 60 chars |
| Pass | All other pages have unique, keyword-rich titles in optimal range |

### Meta Descriptions — STRONG (mostly 120-160 chars)

| Severity | Issue |
|----------|-------|
| Critical | `branchen/pharma.html` description only 88 chars — needs expansion to 120-160 |
| Medium | Legal pages (agb.html, datenschutz.html) have no meta description (noindex, but still recommended) |
| Pass | All content pages have unique, descriptive meta descriptions |

### H1 Tags — PASS
- All pages have exactly 1 H1 tag
- H1s are keyword-rich and properly positioned
- Proper H1 > H2 > H3 hierarchy maintained throughout

### Canonical Tags — EXCELLENT (100% coverage)
### Hreflang Tags — EXCELLENT (100% coverage for content pages)

### OG / Twitter Tags — STRONG
- Complete og:type, og:title, og:description, og:url, og:locale, og:site_name, og:image on all content pages
- Twitter card with summary_large_image on all content pages
- Gap: Legal pages and 404 missing OG/Twitter tags (low priority since noindex)

### Internal Linking — STRONG
- Hub-and-spoke architecture with index.html (47 links) and forschungszulage.html (50 links) as hubs
- All branchen pages cross-link to themen pages and back
- Gap: Some deep themen pages (eigenleistungen, sachkosten) only reachable through contextual links, not navigation

---

## 4. Schema / Structured Data (Score: 88/100, Weight: 10%)

### Coverage
- **170+ JSON-LD blocks** across 53 files (zero parse errors)
- Schema types: ProfessionalService, Organization, WebSite, FAQPage, Article, BreadcrumbList, Service, WebApplication, SpeakableSpecification, ContactPoint

### Issues

| Severity | Issue | Pages |
|----------|-------|-------|
| High | Missing BreadcrumbList on all 18 branchen pages (DE+EN) and forschungszulage-antrag.html (DE+EN) | 20 pages |
| Medium | forschungszulage.html Article author/publisher missing @id reference to Organization entity | 1 page |
| Medium | EN pages missing WebPage block on forschungszulage-antrag.html and forschungszulage-hoehe.html | 2 pages |
| Low | FAQPage schema will not generate rich results (restricted to gov/health since Aug 2023). Harmless to keep. | All pages |
| Low | Legal pages have zero schema (low priority since noindex) | 6 pages |

### Recommended Additions
- **BreadcrumbList** on all branchen pages: Home > Branchen > [Industry]
- **Service schema** on branchen pages for industry-specific offerings
- Consistent @id references across all Article blocks

---

## 5. Performance / CWV (Score: 68/100, Weight: 10%)

| Indicator | Status | Detail |
|-----------|--------|--------|
| **LCP** | Needs work | Large HTML sizes (198KB homepage). Inline Tailwind CSS adds ~25KB per page. Render-blocking theme.js. |
| **INP** | Good | 6-7 deferred JS files. No heavy frameworks. |
| **CLS** | Good | Images have width/height. Fonts use swap. Minor risk from FAQ accordions. |
| **Font Loading** | Excellent | Self-hosted, preloaded, font-display: swap |
| **Resource Hints** | Good | dns-prefetch for GTM, preload for critical fonts |

---

## 6. Images (Score: 85/100, Weight: 5%)

| Severity | Issue |
|----------|-------|
| High | OG image (og-image.png) is 678KB — compress to <100KB |
| Medium | Inconsistent `loading="lazy"` on below-fold logo instances across branchen pages |
| Low | Unused large PNGs in brand_assets/ (Logo V2: 1.2M, V3: 1.9M, V3-transparent: 2.2M) |
| Pass | All img tags have alt attributes |
| Pass | Active logo is SVG (12KB) — excellent |
| Pass | All images have explicit width/height preventing CLS |
| Pass | Favicons complete (SVG, 16/32/192/512px PNG, apple-touch-icon) |

---

## 7. AI Search Readiness (Score: 82/100, Weight: 5%)

| Signal | Status |
|--------|--------|
| llms.txt file | Present with structured facts |
| AI crawler policy | Selective: blocks training, allows citation |
| FAQ schema | Present on most pages |
| SpeakableSpecification | Present on key pages |
| Citable facts | Excellent — specific numbers, legal references |
| Passage-level structure | Good — clear heading hierarchy |
| Gap | Calculator page lacks FAQ/Article schema |

---

## Overall SEO Health Score

| Category | Weight | Score | Weighted |
|----------|-------:|------:|---------:|
| Technical SEO | 25% | 82 | 20.5 |
| Content Quality | 25% | 72 | 18.0 |
| On-Page SEO | 20% | 82 | 16.4 |
| Schema / Structured Data | 10% | 88 | 8.8 |
| Performance (CWV) | 10% | 68 | 6.8 |
| Images | 5% | 85 | 4.25 |
| AI Search Readiness | 5% | 82 | 4.1 |
| **Total** | **100%** | | **78.85 → 78** |

### Score Breakdown
- **90-100:** Excellent — industry-leading SEO
- **80-89:** Good — minor optimizations needed
- **70-79:** Fair — several areas need attention ← **NOVARIS is here**
- **60-69:** Needs work — significant gaps
- **<60:** Poor — major issues blocking performance

---

## Site-Wide Strengths

- Excellent structured data coverage (170+ valid JSON-LD blocks)
- Perfect canonical and hreflang implementation
- Clean, crawlable static HTML (no JS rendering dependency)
- Strong topical authority with comprehensive Forschungszulage content cluster
- Self-hosted fonts with optimal loading strategy
- Smart AI crawler policy (block training, allow citation)
- llms.txt for AI discoverability
- Good internal linking hub-and-spoke architecture
- Proper noindex on legal pages, correctly excluded from sitemap

---

*Audit performed by 6 parallel SEO subagents analyzing technical SEO, content quality, schema markup, sitemap structure, on-page elements, and images.*
