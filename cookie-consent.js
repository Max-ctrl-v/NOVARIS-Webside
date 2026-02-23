/* ═══════════════════════════════════════════════════════
   Cookie Consent — Dormant-Until-Needed
   ═══════════════════════════════════════════════════════
   The banner does NOT appear on its own.
   It only shows when another script calls:

     CookieConsent.request(callback)

   If the user already accepted → callback fires immediately.
   If declined → callback is never called.
   If no choice yet → banner slides in; callback fires on accept.

   Choice is stored in localStorage (not a cookie).
   ═══════════════════════════════════════════════════════ */

window.CookieConsent = (() => {
  'use strict';

  const STORAGE_KEY = 'novaris_cookie_consent'; // 'accepted' | 'declined'
  let bannerEl = null;
  let pendingCallbacks = [];

  /* ── Read stored choice ── */
  function getChoice() {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch { return null; }
  }

  function setChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); }
    catch { /* private mode — silently ignore */ }
  }

  /* ── Build & inject DOM (once) ── */
  function ensureBanner() {
    if (bannerEl) return bannerEl;

    const wrapper = document.createElement('div');
    wrapper.className = 'cc-banner';
    wrapper.setAttribute('role', 'dialog');
    wrapper.setAttribute('aria-label', 'Cookie-Einwilligung');

    wrapper.innerHTML = `
      <div class="cc-card">
        <div class="cc-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="8" cy="9" r="1" fill="currentColor"/>
            <circle cx="15" cy="11" r="1" fill="currentColor"/>
            <circle cx="10" cy="15" r="1" fill="currentColor"/>
            <circle cx="14" cy="7" r="0.8" fill="currentColor"/>
          </svg>
        </div>
        <p class="cc-title">Cookies &amp; Tracking</p>
        <p class="cc-text">
          Diese Webseite möchte Cookies setzen, um Ihr Erlebnis zu verbessern und
          anonyme Nutzungsdaten zu erfassen.
          <a href="/datenschutz.html">Mehr erfahren</a>
        </p>
        <div class="cc-actions">
          <button class="cc-btn cc-btn-accept" data-cc="accept">Akzeptieren</button>
          <button class="cc-btn cc-btn-decline" data-cc="decline">Ablehnen</button>
        </div>
      </div>`;

    document.body.appendChild(wrapper);
    bannerEl = wrapper;

    /* ── Wire buttons ── */
    wrapper.querySelector('[data-cc="accept"]').addEventListener('click', () => {
      resolve('accepted');
    });
    wrapper.querySelector('[data-cc="decline"]').addEventListener('click', () => {
      resolve('declined');
    });

    return wrapper;
  }

  /* ── Show / hide helpers ── */
  function show() {
    const el = ensureBanner();
    // Force reflow so the transition fires even if just injected
    void el.offsetHeight;
    el.classList.add('cc-visible');
  }

  function hide() {
    if (!bannerEl) return;
    bannerEl.classList.remove('cc-visible');
  }

  /* ── Handle user choice ── */
  function resolve(choice) {
    setChoice(choice);
    hide();

    if (choice === 'accepted') {
      // Fire every pending callback
      pendingCallbacks.forEach(fn => { try { fn(); } catch (e) { console.error('[CookieConsent]', e); } });
    }
    pendingCallbacks = [];
  }

  /* ═══════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════ */

  /**
   * CookieConsent.request(callback)
   *
   * Call this BEFORE setting any cookie or loading a
   * tracking script. The callback only runs if the
   * user accepts cookies.
   *
   * Example:
   *   CookieConsent.request(() => {
   *     // safe to set cookies / load analytics here
   *     gtag('config', 'G-XXXXXX');
   *   });
   */
  function request(callback) {
    const choice = getChoice();

    if (choice === 'accepted') {
      // Already consented — run immediately
      if (typeof callback === 'function') callback();
      return;
    }

    if (choice === 'declined') {
      // Already declined — do nothing
      return;
    }

    // No choice yet — queue callback & show banner
    if (typeof callback === 'function') {
      pendingCallbacks.push(callback);
    }
    show();
  }

  /**
   * CookieConsent.reset()
   *
   * Clears stored choice so the banner can appear again
   * on the next .request() call. Useful for a "Cookie
   * Settings" link in the footer.
   */
  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); }
    catch { /* ignore */ }
    pendingCallbacks = [];
    hide();
  }

  /**
   * CookieConsent.hasConsent()
   *
   * Returns true if user has accepted, false otherwise.
   */
  function hasConsent() {
    return getChoice() === 'accepted';
  }

  return { request, reset, hasConsent };
})();
