/* ═══════════════════════════════════════════════════════
   theme.js — Dark mode init & toggle
   Runs immediately (no defer) to prevent FOUC
   ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';

  // Immediate: apply saved theme before paint
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }

  function toggleDark() {
    var dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    _updateDarkBtn();
  }

  function _updateDarkBtn() {
    var dark  = document.documentElement.classList.contains('dark');
    var moon  = document.getElementById('icon-moon');
    var sun   = document.getElementById('icon-sun');
    var moonM = document.getElementById('icon-moon-mob');
    var sunM  = document.getElementById('icon-sun-mob');
    if (moon)  moon.style.display  = dark ? 'none'  : 'block';
    if (sun)   sun.style.display   = dark ? 'block' : 'none';
    if (moonM) moonM.style.display = dark ? 'none'  : 'block';
    if (sunM)  sunM.style.display  = dark ? 'block' : 'none';
  }

  // Expose globally for onclick="toggleDark()"
  window.toggleDark = toggleDark;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _updateDarkBtn);
  } else {
    _updateDarkBtn();
  }
})();
