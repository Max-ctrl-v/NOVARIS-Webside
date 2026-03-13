# SEO Action Plan — NOVARIS Consulting
**Date:** 2026-03-13
**Current Score:** 78/100
**Target Score:** 90/100

---

## CRITICAL — Fix Immediately (Blocks Rankings or Penalties)

### 1. Fix pharma.html title and meta description
- **Title:** Only 42 chars — expand to 50-60 chars with keywords (e.g., add "F&E-Kosten zuruck")
- **Description:** Only 88 chars — expand to 120-160 chars with specific services and CTA
- **Files:** `branchen/pharma.html`, `en/branchen/pharma.html`
- **Impact:** Direct ranking signal for pharma industry keyword cluster
- **Effort:** 15 min

### 2. Add BreadcrumbList schema to 20 pages
- All 9 branchen pages (DE) + 9 branchen pages (EN) + forschungszulage-antrag.html (DE+EN)
- BreadcrumbList is one of the most reliable rich result types for commercial sites
- Pattern: Home > Branchen > [Industry Name] or Home > Forschungszulage > [Topic]
- **Impact:** Rich result eligibility, improved SERP appearance
- **Effort:** 1-2 hours (template copy)

### 3. Display physical address and phone number in footer
- Currently only in JSON-LD schema, not visible on page
- For YMYL-adjacent financial consulting, visible contact info is critical for trust
- **Files:** Footer section of all pages
- **Impact:** E-E-A-T trust signal, Google QRG compliance
- **Effort:** 30 min

---

## HIGH — Fix Within 1 Week (Significantly Impacts Rankings)

### 4. Create team/about page with named individuals
- Largest E-E-A-T gap: no identifiable people behind YMYL financial claims
- Include: names, roles, credentials, photos, experience statements
- Add author bylines to key articles (Article schema author -> Person, not just Organization)
- **Impact:** Major E-E-A-T improvement, especially for Google's Helpful Content system
- **Effort:** 2-4 hours

### 5. Add Content-Security-Policy meta tag
- No CSP on any page — security gap
- Add to all pages: `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self'">`
- **Impact:** Security signal, prevents XSS
- **Effort:** 1 hour (template update)

### 6. Compress OG image
- `brand_assets/og-image.png` is 678KB — should be <100KB
- Convert to optimized JPEG or compress PNG with TinyPNG
- Actual size 2400x1260 is fine (retina), but file size must decrease
- **Impact:** Faster social sharing previews, reduced bandwidth
- **Effort:** 15 min

### 7. Reduce HTML file sizes
- index.html (198KB), en/index.html (201KB) are 2-4x larger than ideal
- Options: (a) Purge unused Tailwind classes more aggressively, (b) Extract shared CSS to cached external file, (c) Ensure server gzip/brotli compression
- **Impact:** Faster LCP, better Core Web Vitals
- **Effort:** 2-4 hours

### 8. Fix extra hreflang entries
- `en/forschungszulage-sachkosten.html` and `en/forschungszulage-hoehe.html` have 4 hreflang tags instead of 3
- Remove the duplicate/extra entry
- **Impact:** Prevents search engine confusion about language targeting
- **Effort:** 15 min

---

## MEDIUM — Fix Within 1 Month (Optimization Opportunities)

### 9. Add SRI integrity attribute to i18n.js
- All other scripts have SRI hashes, i18n.js is the exception
- Generate hash: `cat i18n.js | openssl dgst -sha384 -binary | openssl base64 -A`
- **Effort:** 15 min

### 10. Add visible "last updated" dates to all content pages
- Several pages lack visible dates (only in JSON-LD)
- `forschungszulage-rechner.html` has no date signals at all
- Pattern `ds-updated` already exists on some pages — extend to all
- **Effort:** 1 hour

### 11. Add `loading="lazy"` consistently to below-fold images
- Footer logos and secondary images inconsistently use lazy loading
- Audit all pages and add `loading="lazy"` to below-fold images
- **Effort:** 1 hour

### 12. Fix @id references in forschungszulage.html schemas
- Article author/publisher uses inline Organization instead of @id reference to `#organization`
- Service provider same issue
- Match the pattern used on all other Article pages
- **Effort:** 15 min

### 13. Add missing WebPage blocks to EN pages
- `en/forschungszulage-antrag.html` and `en/forschungszulage-hoehe.html` missing WebPage schema (DE versions have it)
- **Effort:** 15 min

### 14. Trim overlong title tags
- `forschungszulage-antrag.html` (65ch) and `branchen/software-it.html` (65ch) — trim to 55-60 chars
- **Effort:** 15 min

### 15. Expand calculator page content
- `forschungszulage-rechner.html` at 717 words — borderline thin for tool page
- Add methodology explanation, assumptions, FAQ section (target 1,000+ words)
- Add FAQ schema and Article/dateModified schema
- **Effort:** 1-2 hours

### 16. Add third-party trust signals
- Google Reviews widget, ProvenExpert badge, or industry association memberships
- Substantiate "100% Bewilligungsquote" claim with verifiable data
- **Effort:** 1-2 hours

### 17. Differentiate branchen page content
- All 9 pages follow identical template — potential Helpful Content risk
- Ensure each has genuinely unique project examples, industry stats, and FAQ answers
- **Effort:** 2-4 hours

### 18. Add aria-labels to SVG icons
- 50+ SVG elements across site lack `aria-label` or `role="img"`
- **Impact:** Accessibility score improvement
- **Effort:** 1-2 hours

---

## LOW — Backlog (Nice to Have)

### 19. Add Service schema to branchen pages
- Each industry page describes a specific service offering — Service schema would strengthen topical relevance
- **Effort:** 1-2 hours

### 20. Automate sitemap lastmod dates
- Implement build script that reads file modification times for per-URL accuracy
- **Effort:** 1 hour

### 21. Inline critical theme.js logic
- Move dark-mode detection to small inline `<script>` in `<head>`, defer rest of theme.js
- Reduces render-blocking impact on LCP
- **Effort:** 30 min

### 22. Remove unused brand asset files
- Logo V2.png (1.2M), V3.png (1.9M), V3-transparent.png (2.2M) — unused but stored
- **Effort:** 5 min

### 23. Remove duplicate Google verification file
- `brand_assets/googled8c1e55133f9c79d.html` is duplicate of root copy
- **Effort:** 1 min

### 24. Add sameAs to more platforms
- Organization schema only includes LinkedIn — add Xing, industry directories
- **Effort:** 15 min

### 25. Verify DE/EN content consistency
- `en/forschungszulage-auftragsforschung.html` H1 references "60% Rule" while DE version says 70%
- Confirm which is correct and fix
- **Effort:** 15 min

### 26. Add meta descriptions to legal pages
- agb.html, datenschutz.html are noindex but should still have descriptions for completeness
- **Effort:** 15 min

### 27. Consider English-language URL slugs for EN pages
- Currently `en/forschungszulage.html` not `en/research-allowance.html`
- Low priority since primary audience is Germany-based
- **Effort:** High (requires redirects)

---

## Impact Summary

| Priority | Items | Est. Total Effort | Expected Score Impact |
|----------|------:|------------------:|----------------------|
| Critical | 3 | ~2-3 hours | +4-5 points |
| High | 5 | ~5-8 hours | +5-7 points |
| Medium | 10 | ~8-12 hours | +3-5 points |
| Low | 9 | ~4-6 hours | +1-2 points |
| **Total** | **27** | **~19-29 hours** | **78 -> 90+** |

---

## Category Score Targets

| Category | Current | After Critical+High | After All |
|----------|--------:|--------------------:|----------:|
| Technical SEO | 82 | 90 | 94 |
| Content Quality | 72 | 82 | 88 |
| On-Page SEO | 82 | 90 | 94 |
| Schema | 88 | 95 | 97 |
| Performance | 68 | 75 | 82 |
| Images | 85 | 92 | 95 |
| AI Readiness | 82 | 85 | 90 |
| **Overall** | **78** | **87** | **92** |
