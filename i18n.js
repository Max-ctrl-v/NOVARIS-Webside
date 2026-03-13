/* Shared i18n engine — loaded after page-specific window.T is defined */
(function () {
  'use strict';

  // Detect default language from <html lang="..."> attribute
  var defaultLang = document.documentElement.lang || 'de';
  var _currentLang = defaultLang;

  function setLang(lang) {
    _currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    // Apply translations from page-specific T object
    if (window.T && window.T[lang]) {
      document.querySelectorAll('[data-t]').forEach(function (el) {
        var key = el.getAttribute('data-t');
        if (window.T[lang][key] !== undefined) el.innerHTML = window.T[lang][key];
      });
    }

    // Update page title if page defines title map
    if (window._pageTitles && window._pageTitles[lang]) {
      document.title = window._pageTitles[lang];
    }

    // Toggle desktop lang buttons
    var de = document.getElementById('lang-de');
    var en = document.getElementById('lang-en');
    if (de) de.classList.toggle('active', lang === 'de');
    if (en) en.classList.toggle('active', lang === 'en');

    // Toggle mobile lang buttons (if present)
    var dem = document.getElementById('lang-de-mob');
    var enm = document.getElementById('lang-en-mob');
    if (dem) dem.classList.toggle('active', lang === 'de');
    if (enm) enm.classList.toggle('active', lang === 'en');
  }

  // Expose globally
  window.setLang = setLang;
  window._currentLang = _currentLang;

  // Restore saved language on load
  var saved = localStorage.getItem('lang');
  if (saved && saved !== defaultLang) {
    setLang(saved);
  } else if (defaultLang !== 'de') {
    // EN pages: ensure EN translations are applied on initial load
    setLang(defaultLang);
  }
})();
