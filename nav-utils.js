/* ═══════════════════════════════════════════════════════
   nav-utils.js — Shared navigation, FAQ & utility functions
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';

  /* ── Mobile hamburger menu toggle ── */
  function toggleMob() {
    var m = document.getElementById('mob-menu');
    if (!m) return;
    var open = m.classList.toggle('open');
    var btn = document.getElementById('ham-btn');
    if (btn) btn.setAttribute('aria-expanded', open);
  }

  /* ── Nav dropdown keyboard/hover handling ── */
  function initNavDropdowns() {
    document.querySelectorAll('.nav-dropdown-wrap').forEach(function(w) {
      var t = w.querySelector('.nav-dropdown-trigger');
      if (!t) return;
      w.addEventListener('mouseenter', function() {
        t.setAttribute('aria-expanded', 'true');
      });
      w.addEventListener('mouseleave', function() {
        t.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Nav scroll shadow ── */
  function initNavShadow() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        nav.style.boxShadow = '0 2px 24px rgba(0,0,0,0.12)';
      } else {
        nav.style.boxShadow = '';
      }
    }, { passive: true });
  }

  /* ── FAQ accordion toggle ── */
  function toggleFaq(btn) {
    var wrap = btn.closest('.faq-wrap');
    if (wrap) wrap.classList.toggle('open');
  }

  /* ── Reveal animations via IntersectionObserver ── */
  function initRevealAnimations() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function(el) {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('visible');
      } else {
        io.observe(el);
      }
    });
  }

  /* ── Cal.com booking helper ── */
  function openCal(link) {
    window.open('https://cal.com/' + link, '_blank', 'noopener,noreferrer');
  }

  /* ── Close mobile menu on link click ── */
  function initMobMenuAutoClose() {
    var mob = document.getElementById('mob-menu');
    if (!mob) return;
    mob.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        mob.classList.remove('open');
        var btn = document.getElementById('ham-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Expose globally
  window.toggleMob = toggleMob;
  window.toggleFaq = toggleFaq;
  window.openCal = openCal;

  // Init on DOM ready
  function init() {
    initNavDropdowns();
    initNavShadow();
    initRevealAnimations();
    initMobMenuAutoClose();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
