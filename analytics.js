/* ═══════════════════════════════════════════════════════
   Google Analytics 4 — DSGVO-konform via CookieConsent
   ═══════════════════════════════════════════════════════

   SETUP: Ersetze 'G-XXXXXXXXXX' unten mit deiner echten
   GA4 Measurement-ID aus analytics.google.com.

   Tracking umfasst:
   - Seitenaufrufe (automatisch)
   - Scrolltiefe (automatisch via enhanced measurement)
   - Klicks auf CTAs / Buttons (custom events)
   - Verweildauer (automatisch)
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  DEINE GA4 MEASUREMENT-ID HIER EINTRAGEN:
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  var GA_ID = 'G-DJH7CGGES0';

  function loadGA() {
    // Prevent double-loading
    if (document.querySelector('script[src*="googletagmanager.com/gtag"]')) return;

    // Load gtag.js
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    // Initialize dataLayer & gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    // ── Custom event tracking ──
    trackCTAClicks();
    trackSectionVisibility();
  }

  /* ── Track clicks on important buttons / links ── */
  function trackCTAClicks() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('a, button');
      if (!el) return;

      var text = (el.textContent || '').trim().substring(0, 60);
      var href = el.getAttribute('href') || '';
      var section = findSection(el);

      // CTA buttons (links with cal.com, mailto, tel)
      if (href.includes('cal.com') || href.includes('mailto:') || href.includes('tel:')) {
        gtag('event', 'cta_click', {
          event_category: 'conversion',
          event_label: text,
          link_url: href,
          page_section: section
        });
        return;
      }

      // Navigation clicks
      if (el.closest('nav') || el.closest('header')) {
        gtag('event', 'nav_click', {
          event_category: 'navigation',
          event_label: text,
          link_url: href
        });
        return;
      }

      // Any other button/link click
      if (el.tagName === 'BUTTON' || el.classList.contains('btn') || el.getAttribute('role') === 'button') {
        gtag('event', 'button_click', {
          event_category: 'engagement',
          event_label: text,
          page_section: section
        });
      }
    });
  }

  /* ── Track which sections users actually see ── */
  function trackSectionVisibility() {
    if (!('IntersectionObserver' in window)) return;

    var tracked = {};

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id || entry.target.getAttribute('data-section');
        if (!id || tracked[id]) return;

        tracked[id] = true;
        gtag('event', 'section_view', {
          event_category: 'engagement',
          event_label: id
        });
      });
    }, { threshold: 0.3 });

    // Observe all sections with an id
    document.querySelectorAll('section[id], [data-section]').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Helper: find parent section name ── */
  function findSection(el) {
    var section = el.closest('section[id], [data-section]');
    if (section) return section.id || section.getAttribute('data-section');
    return 'unknown';
  }

  /* ── Kick off: request consent, then load GA ── */
  if (window.CookieConsent) {
    CookieConsent.request(loadGA);
  }
})();
