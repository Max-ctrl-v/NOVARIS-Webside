/* ═══════════════════════════════════════════════════════════════
   scroll-animations.js — NOVARIS scroll reveal system
   Auto-discovers elements, applies animation classes,
   triggers via IntersectionObserver on scroll.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Inject critical hiding CSS inline (synchronous — no race condition) ──
  var style = document.createElement('style');
  style.textContent =
    'html.sa-ready .sa-fade-up{opacity:0;transform:translateY(32px)}' +
    'html.sa-ready .sa-fade-in{opacity:0}' +
    'html.sa-ready .sa-fade-left{opacity:0;transform:translateX(-32px)}' +
    'html.sa-ready .sa-fade-right{opacity:0;transform:translateX(32px)}' +
    'html.sa-ready .sa-scale-up{opacity:0;transform:scale(0.88)}' +
    'html.sa-ready .sa-counter{opacity:0;transform:translateY(14px)}';
  document.head.appendChild(style);

  // ── Inject companion CSS for transitions + visible states ──
  var script = document.currentScript;
  if (script && script.src) {
    var cssHref = script.src.replace(/\.js(\?.*)?$/, '.css$1');
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssHref;
    document.head.appendChild(link);
  }

  // Signal CSS that JS is loaded
  document.documentElement.classList.add('sa-ready');

  // ── State ──
  var observed = [];

  // ── Helpers ──
  function tag(el, animClass, delayIndex) {
    if (!el || el._saTagged) return;
    el._saTagged = true;
    animClass.split(' ').forEach(function (c) { if (c) el.classList.add(c); });
    if (delayIndex > 0 && delayIndex <= 10) {
      el.classList.add('sa-d' + delayIndex);
    }
    observed.push(el);
  }

  // ── Section-specific setup ─────────────────────────────── */

  /* Trust stats bar — section without id containing .stat-gradient */
  function setupTrustBar() {
    var secs = document.querySelectorAll('section');
    for (var i = 0; i < secs.length; i++) {
      var sec = secs[i];
      if (sec.id || sec.classList.contains('hero-bg')) continue;
      var stats = sec.querySelectorAll('.stat-gradient');
      if (stats.length === 0) continue;

      for (var j = 0; j < stats.length; j++) {
        var col = stats[j].parentElement;
        tag(col, 'sa-fade-up', j + 1);
        stats[j]._saCounterTarget = true;
        stats[j]._saOriginalHTML = stats[j].innerHTML;
      }
      break;
    }
  }

  /* Was ist FZulG — badge, h2, p, then 3 cards + 2 dark boxes */
  function setupFzulg() {
    var sec = document.getElementById('was-ist-fzulg');
    if (!sec) return;
    sectionHeader(sec);

    var cards = sec.querySelectorAll('.bg-white.rounded-2xl');
    for (var i = 0; i < cards.length; i++) {
      tag(cards[i], 'sa-fade-up', i + 1);
    }

    var darks = sec.querySelectorAll('[style*="background:linear-gradient(135deg,#0D1B3E"]');
    for (var d = 0; d < darks.length; d++) {
      tag(darks[d], d === 0 ? 'sa-fade-left' : 'sa-fade-right', 0);
    }
  }

  /* Branchen — header only (grid already has its own IO) */
  function setupBranchen() {
    var sec = document.getElementById('branchen');
    if (!sec) return;
    sectionHeader(sec);
  }

  /* Prozess — header only (step-wrap already has its own IO) */
  function setupProzess() {
    var sec = document.getElementById('prozess');
    if (!sec) return;
    sectionHeader(sec);
  }

  /* Vorteile — header, check-dot rows, depth card */
  function setupVorteile() {
    var sec = document.getElementById('vorteile');
    if (!sec) return;

    var badge = sec.querySelector('.badge');
    if (badge) tag(badge, 'sa-fade-up', 0);
    var h2 = sec.querySelector('h2');
    if (h2) tag(h2, 'sa-fade-up', 1);
    var p = sec.querySelector('h2 ~ p');
    if (p) tag(p, 'sa-fade-up', 2);

    var checkRows = sec.querySelectorAll('.check-dot');
    for (var i = 0; i < checkRows.length; i++) {
      var row = checkRows[i].closest('[style*="display:flex"][style*="gap:0.85rem"]');
      if (row) tag(row, 'sa-fade-left', i + 1);
    }

    var depthCard = sec.querySelector('.card-z2');
    if (depthCard) {
      var wrapper = depthCard.closest('.relative');
      if (wrapper) tag(wrapper, 'sa-fade-right', 2);
    }
  }

  /* Kunden — header (ticker is always running) */
  function setupKunden() {
    var sec = document.getElementById('kunden');
    if (!sec) return;
    sectionHeader(sec);
  }

  /* FAQ — header, then staggered faq-wraps */
  function setupFaq() {
    var sec = document.getElementById('faq');
    if (!sec) return;
    sectionHeader(sec);

    var faqs = sec.querySelectorAll('.faq-wrap');
    for (var i = 0; i < faqs.length; i++) {
      tag(faqs[i], 'sa-fade-up', Math.min(i + 1, 6));
    }
  }

  /* Kontakt — header + form card */
  function setupKontakt() {
    var sec = document.getElementById('kontakt');
    if (!sec) return;

    var badge = sec.querySelector('.badge, .badge-dark');
    if (badge) tag(badge, 'sa-fade-up', 0);
    var h2 = sec.querySelector('h2');
    if (h2) tag(h2, 'sa-fade-up', 1);
    var p = h2 ? h2.nextElementSibling : null;
    if (p && p.tagName === 'P') tag(p, 'sa-fade-up', 2);

    var btns = sec.querySelectorAll('.btn-primary, .btn-outline');
    for (var b = 0; b < btns.length; b++) {
      var btnRow = btns[b].closest('[style*="display:flex"]');
      if (btnRow && !btnRow._saTagged) tag(btnRow, 'sa-fade-up', 3);
    }

    var formCard = sec.querySelector('.card-z3');
    if (formCard) tag(formCard, 'sa-fade-right', 2);
  }

  /* Subpage .reveal elements — hook into same system */
  function setupRevealElements() {
    var reveals = document.querySelectorAll('.reveal');
    for (var i = 0; i < reveals.length; i++) {
      reveals[i].style.animation = 'none';
      tag(reveals[i], 'sa-fade-up', 0);
    }
  }

  /* Subpage project-card elements */
  function setupProjectCards() {
    var cards = document.querySelectorAll('.project-card');
    for (var i = 0; i < cards.length; i++) {
      tag(cards[i], 'sa-fade-up', Math.min(i + 1, 3));
    }
  }

  // ── Shared: animate badge → h2 → p at top of a section ── */
  function sectionHeader(sec) {
    var d = 0;
    var badge = sec.querySelector('.badge');
    if (badge) tag(badge, 'sa-fade-up', d++);
    var h2 = sec.querySelector('h2');
    if (h2) tag(h2, 'sa-fade-up', d++);
    var center = sec.querySelector('.text-center');
    if (center) {
      var p = center.querySelector('p');
      if (p) tag(p, 'sa-fade-up', d++);
    }
  }

  // ── Counter animation for stat numbers ─────────────────── */

  function animateCounter(el) {
    if (!el._saCounterTarget || el._saCounted) return;
    el._saCounted = true;

    var html = el._saOriginalHTML;
    var text = el.textContent;
    var match = text.match(/([\d,.]+)/);
    if (!match) return;

    var targetNum = parseFloat(match[1].replace(',', '.'));
    var numStr = match[1];
    var prefix = text.substring(0, text.indexOf(match[0]));
    var suffix = text.substring(text.indexOf(match[0]) + match[0].length);

    var duration = 1400;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = eased * targetNum;

      var formatted;
      if (numStr.indexOf(',') !== -1) {
        formatted = current.toFixed(1).replace('.', ',');
      } else if (numStr.indexOf('.') !== -1) {
        formatted = current.toFixed(1);
      } else {
        formatted = Math.round(current).toString();
      }

      var out = prefix.replace(/\u00A0/g, '&nbsp;') +
                formatted +
                suffix.replace(/\u00A0/g, '&nbsp;');
      el.innerHTML = out;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.innerHTML = html;
      }
    }

    requestAnimationFrame(step);
  }

  // ── IntersectionObserver ───────────────────────────────── */

  function observeAll() {
    if (!('IntersectionObserver' in window)) {
      observed.forEach(function (el) { el.classList.add('sa-visible'); });
      triggerCounters();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('sa-visible');
        io.unobserve(entry.target);

        var counters = entry.target.querySelectorAll('.stat-gradient');
        for (var c = 0; c < counters.length; c++) {
          animateCounter(counters[c]);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    // Puppeteer / headless — reveal everything instantly
    if (navigator.webdriver) {
      observed.forEach(function (el) { el.classList.add('sa-visible'); });
      triggerCounters();
      return;
    }

    observed.forEach(function (el) {
      // Elements already in viewport on load — reveal instantly (no animation)
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50 && rect.bottom > 0) {
        el.classList.add('sa-visible');
        var stats = el.querySelectorAll('.stat-gradient');
        for (var s = 0; s < stats.length; s++) animateCounter(stats[s]);
      } else {
        io.observe(el);
      }
    });
  }

  function triggerCounters() {
    document.querySelectorAll('.stat-gradient').forEach(function (s) {
      animateCounter(s);
    });
  }

  // ── Init ───────────────────────────────────────────────── */

  function init() {
    setupTrustBar();
    setupFzulg();
    setupBranchen();
    setupProzess();
    setupVorteile();
    setupKunden();
    setupFaq();
    setupKontakt();
    setupRevealElements();
    setupProjectCards();
    observeAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
