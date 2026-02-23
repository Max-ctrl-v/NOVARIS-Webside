/* ============================================================
   Page Transition Controller
   —————————————————————————
   Orchestrates a smooth fade-in on every page load:
     1. Injects a slim progress bar at the top
     2. Waits for DOM ready
     3. Adds .page-ready to <body>  → triggers CSS body fade-in
     4. Staggers each <section> with cascading animation-delay
     5. Safety timeout (2.5 s) guarantees visibility

   Usage — add to every page, before </head>:
     <link rel="stylesheet" href="/page-transition.css">
     <script src="/page-transition.js" defer></script>
   ============================================================ */
(function () {
  "use strict";

  var SAFETY_TIMEOUT = 2500;   /* ms — max time page stays hidden */
  var SECTION_STAGGER = 0.06;  /* s  — delay between sections     */
  var BASE_DELAY = 0.08;       /* s  — initial delay before first section */

  var revealed = false;

  /* --- 1. Inject progress bar ------------------------------ */
  var bar = document.createElement("div");
  bar.className = "ptr-bar";
  bar.setAttribute("aria-hidden", "true");
  document.documentElement.appendChild(bar);

  /* --- 2. Reveal function ---------------------------------- */
  function revealPage() {
    if (revealed) return;
    revealed = true;

    /* Fade in body */
    document.body.classList.add("page-ready");

    /* Dismiss progress bar */
    bar.classList.add("ptr-done");
    setTimeout(function () {
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    }, 400);

    /* Stagger sections — all at once, time-based cascade */
    var sections = document.querySelectorAll("section, [data-reveal]");
    sections.forEach(function (el, i) {
      el.style.animationDelay = (BASE_DELAY + i * SECTION_STAGGER) + "s";
      el.classList.add("ptr-section");
    });
  }

  /* --- 3. Trigger reveal on DOM ready ---------------------- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revealPage);
  } else {
    revealPage();
  }

  /* --- 4. Safety timeout ----------------------------------- */
  setTimeout(function () {
    if (!revealed) revealPage();
  }, SAFETY_TIMEOUT);

})();
