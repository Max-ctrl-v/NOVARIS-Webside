/* ═══════════════════════════════════════════════════════
   Cookie Consent — Centered Modal Popup
   ═══════════════════════════════════════════════════════
   Shows a centered popup on first visit with three options:
     - Alle akzeptieren   → fires analytics callbacks
     - Nur notwendige     → no analytics, stores 'necessary'
     - Ablehnen           → no analytics, stores 'declined'

   Choice is stored in localStorage (not a cookie).
   ═══════════════════════════════════════════════════════ */

window.CookieConsent = (() => {
  'use strict';

  const STORAGE_KEY = 'novaris_cookie_consent'; // 'accepted' | 'necessary' | 'declined'
  let modalEl = null;
  let pendingCallbacks = [];

  function getChoice() {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch { return null; }
  }

  function setChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); }
    catch { /* private mode */ }
  }

  /* ── Build & inject modal ── */
  function ensureModal() {
    if (modalEl) return modalEl;

    const overlay = document.createElement('div');
    overlay.className = 'cc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Cookie-Einwilligung');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="cc-modal">
        <div class="cc-modal-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="8" cy="9" r="1" fill="currentColor"/>
            <circle cx="15" cy="11" r="1" fill="currentColor"/>
            <circle cx="10" cy="15" r="1" fill="currentColor"/>
            <circle cx="14" cy="7" r="0.8" fill="currentColor"/>
          </svg>
        </div>
        <p class="cc-modal-title">Cookies &amp; Datenschutz</p>
        <p class="cc-modal-text">
          Wir nutzen Cookies, um unsere Webseite zu verbessern und anonyme
          Nutzungsstatistiken zu erheben. Sie k\u00F6nnen w\u00E4hlen, welche Cookies
          Sie zulassen m\u00F6chten.
          <a href="/datenschutz.html">Datenschutzerkl\u00E4rung</a>
        </p>
        <div class="cc-modal-actions">
          <button class="cc-btn cc-btn-accept" data-cc="accept">Alle akzeptieren</button>
          <button class="cc-btn cc-btn-necessary" data-cc="necessary">Nur notwendige</button>
          <button class="cc-btn cc-btn-decline" data-cc="decline">Ablehnen</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    modalEl = overlay;

    overlay.querySelector('[data-cc="accept"]').addEventListener('click', () => resolve('accepted'));
    overlay.querySelector('[data-cc="necessary"]').addEventListener('click', () => resolve('necessary'));
    overlay.querySelector('[data-cc="decline"]').addEventListener('click', () => resolve('declined'));

    return overlay;
  }

  function show() {
    const el = ensureModal();
    void el.offsetHeight;
    el.classList.add('cc-visible');
    document.body.style.overflow = 'hidden';
    el.querySelector('.cc-btn-accept').focus();
  }

  function hide() {
    if (!modalEl) return;
    modalEl.classList.remove('cc-visible');
    document.body.style.overflow = '';
  }

  function resolve(choice) {
    setChoice(choice);
    hide();

    if (choice === 'accepted' || choice === 'necessary') {
      pendingCallbacks.forEach(fn => { try { fn(); } catch (e) { console.error('[CookieConsent]', e); } });
    }
    pendingCallbacks = [];
  }

  /* ═══════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════ */

  function request(callback) {
    const choice = getChoice();

    if (choice === 'accepted') {
      if (typeof callback === 'function') callback();
      return;
    }

    if (choice === 'declined') {
      return;
    }

    if (choice === 'necessary') {
      if (typeof callback === 'function') callback();
      return;
    }

    if (typeof callback === 'function') {
      pendingCallbacks.push(callback);
    }
    show();
  }

  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); }
    catch { /* ignore */ }
    pendingCallbacks = [];
    hide();
  }

  function hasConsent() {
    return getChoice() === 'accepted';
  }

  return { request, reset, hasConsent };
})();
