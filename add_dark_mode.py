import re

files = [
    r'c:\Users\maxno\OneDrive\Desktop\Ai automation\webseite\branchen\software-it.html',
    r'c:\Users\maxno\OneDrive\Desktop\Ai automation\webseite\branchen\maschinenbau.html',
    r'c:\Users\maxno\OneDrive\Desktop\Ai automation\webseite\branchen\pharma.html',
    r'c:\Users\maxno\OneDrive\Desktop\Ai automation\webseite\branchen\automotive.html',
]

SCROLLBAR = ('::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#f0f4fd}'
             '::-webkit-scrollbar-thumb{background:#c2d0ea;border-radius:999px}::-webkit-scrollbar-thumb:hover{background:#1E56B5}')

DARK_CSS = (
    '    :root{--bg-base:#ffffff;--bg-raised:#f5f8fe;--bg-card:#ffffff;--bg-faq-btn:#ffffff;--bg-faq-hov:#f5f8fe;--clr-h:#0D1B3E;--bdr:#dde5f4;--bdr-faq:#edf2fb}\n'
    '    html.dark{--bg-base:#0a1428;--bg-raised:#0D1B3E;--bg-card:#122244;--bg-faq-btn:#0D1B3E;--bg-faq-hov:#122244;--clr-h:#e8f0fa;--bdr:rgba(77,174,229,0.18);--bdr-faq:rgba(77,174,229,0.10)}\n'
    '    html.dark section.bg-white{background:var(--bg-base)!important}html.dark .bg-tinted{background:var(--bg-raised)!important}\n'
    '    html.dark .faq-content{color:#8aaac8;border-top-color:var(--bdr-faq)}\n'
    '    html.dark section.bg-white [style*='+chr(34)+'color:#0D1B3E'+chr(34)+'],html.dark .bg-tinted [style*='+chr(34)+'color:#0D1B3E'+chr(34)+']{color:#e8f0fa!important}\n'
    '    html.dark section.bg-white [style*='+chr(34)+'color:#5a6e8c'+chr(34)+'],html.dark .bg-tinted [style*='+chr(34)+'color:#5a6e8c'+chr(34)+']{color:#8aaac8!important}\n'
    '    html.dark section.bg-white [style*='+chr(34)+'color:#374151'+chr(34)+'],html.dark .bg-tinted [style*='+chr(34)+'color:#374151'+chr(34)+']{color:#a8c0d8!important}\n'
    '    html.dark section.bg-white .badge:not(.badge-dark),html.dark .bg-tinted .badge:not(.badge-dark){background:rgba(30,86,181,0.20)!important}\n'
    '    #dark-toggle:hover,#dark-toggle-mob:hover{background:rgba(255,255,255,0.14)!important;color:#fff!important}'
)

DARK_JS = chr(10).join(["  (function(){if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark');}})();", "  function toggleDark(){var dark=document.documentElement.classList.toggle('dark');localStorage.setItem('theme',dark?'dark':'light');_updateDarkBtn();}", "  function _updateDarkBtn(){var dark=document.documentElement.classList.contains('dark');var moon=document.getElementById('icon-moon');var sun=document.getElementById('icon-sun');var moonM=document.getElementById('icon-moon-mob');var sunM=document.getElementById('icon-sun-mob');if(moon)moon.style.display=dark?'none':'block';if(sun)sun.style.display=dark?'block':'none';if(moonM)moonM.style.display=dark?'none':'block';if(sunM)sunM.style.display=dark?'block':'none';}", "  window.addEventListener(\"DOMContentLoaded\",_updateDarkBtn);"])

DARK_TOGGLE_DESKTOP = "      <button id=\"dark-toggle\" onclick=\"toggleDark()\" aria-label=\"Toggle dark mode\"\n        class=\"hidden sm:flex\" style=\"width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.07);cursor:pointer;align-items:center;justify-content:center;color:rgba(255,255,255,0.7);transition:background 0.15s ease,color 0.15s ease\">\n        <svg id=\"icon-moon\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"/></svg>\n        <svg id=\"icon-sun\"   width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:none\"><circle cx=\"12\" cy=\"12\" r=\"5\"/><line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"3\"/><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"/><line x1=\"4.22\" y1=\"4.22\" x2=\"5.64\" y2=\"5.64\"/><line x1=\"18.36\" y1=\"18.36\" x2=\"19.78\" y2=\"19.78\"/><line x1=\"1\" y1=\"12\" x2=\"3\" y2=\"12\"/><line x1=\"21\" y1=\"12\" x2=\"23\" y2=\"12\"/><line x1=\"4.22\" y1=\"19.78\" x2=\"5.64\" y2=\"18.36\"/><line x1=\"18.36\" y1=\"5.64\" x2=\"19.78\" y2=\"4.22\"/></svg>\n      </button>"

DARK_TOGGLE_MOBILE = "      <div class=\"flex items-center gap-2 mt-2\">\n        <button id=\"dark-toggle-mob\" onclick=\"toggleDark()\" aria-label=\"Toggle dark mode\"\n          style=\"width:32px;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.07);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.7);transition:background 0.15s ease,color 0.15s ease\">\n          <svg id=\"icon-moon-mob\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"/></svg>\n          <svg id=\"icon-sun-mob\"   width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:none\"><circle cx=\"12\" cy=\"12\" r=\"5\"/><line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"3\"/><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"/><line x1=\"4.22\" y1=\"4.22\" x2=\"5.64\" y2=\"5.64\"/><line x1=\"18.36\" y1=\"18.36\" x2=\"19.78\" y2=\"19.78\"/><line x1=\"1\" y1=\"12\" x2=\"3\" y2=\"12\"/><line x1=\"21\" y1=\"12\" x2=\"23\" y2=\"12\"/><line x1=\"4.22\" y1=\"19.78\" x2=\"5.64\" y2=\"18.36\"/><line x1=\"18.36\" y1=\"5.64\" x2=\"19.78\" y2=\"4.22\"/></svg>\n        </button>\n      </div>"

SCROLLBAR_MULTI = '::-webkit-scrollbar{width:6px}\n    ::-webkit-scrollbar-track{background:#f0f4fd}\n    ::-webkit-scrollbar-thumb{background:#c2d0ea;border-radius:999px}\n    ::-webkit-scrollbar-thumb:hover{background:#1E56B5}'

for filepath in files:
    print('Processing: ' + filepath)
    with open(filepath, 'r', encoding='utf-8') as fh:
        content = fh.read()
    original = content

    scr = SCROLLBAR if SCROLLBAR in content else (SCROLLBAR_MULTI if SCROLLBAR_MULTI in content else None)
    if scr and ':root{--bg-base' not in content:
        content = content.replace(scr, scr + chr(10) + DARK_CSS)
        print('  [1] CSS vars added')
    else:
        print('  [1] SKIP')

    before2 = content
    content = content.replace(',#f5f8fe}', ',var(--bg-raised)}')
    content = content.replace('.project-card{background:#fff;', '.project-card{background:var(--bg-card);')
    content = content.replace('.faq-wrap{border:1.5px solid #dde5f4;', '.faq-wrap{border:1.5px solid var(--bdr);')
    content = content.replace(
        "background:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.25rem 1.5rem;font-family:'Montserrat',sans-serif;font-weight:700;font-size:0.93rem;color:#0D1B3E;transition:background 0.14s ease}",
        "background:var(--bg-faq-btn);border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.25rem 1.5rem;font-family:'Montserrat',sans-serif;font-weight:700;font-size:0.93rem;color:var(--clr-h,#0D1B3E);transition:background 0.14s ease,color 0.14s ease}")
    content = content.replace('.faq-btn:hover{background:#f5f8fe}', '.faq-btn:hover{background:var(--bg-faq-hov)}')
    content = content.replace(
        'border-top:1px solid #edf2fb;font-size:0.875rem;color:#4a5870;line-height:1.75}',
        'border-top:1px solid var(--bdr-faq);font-size:0.875rem;color:#4a5870;line-height:1.75;transition:color 0.2s ease,border-top-color 0.2s ease}')
    print('  [2] CSS updated' if content != before2 else '  [2] WARNING: no CSS changes')

    import re
    dpat = ('(<div class='+chr(34)+'lang-toggle hidden sm:flex'+chr(34)+'>.*?</div>\s*\n)(\s*<a href='+chr(34)+'\.\./index\.html#kontakt'+chr(34)+' class='+chr(34)+'btn-primary hidden sm:inline-flex'+chr(34)+')')
    drep = '\1' + DARK_TOGGLE_DESKTOP + chr(10) + '\2'
    cn = re.sub(dpat, drep, content, flags=re.DOTALL)
    if cn != content:
        content = cn
        print('  [3] Desktop toggle added')
    else:
        print('  [3] WARNING: desktop pattern not matched')

    mpat = ('(<a href='+chr(34)+'\.\./index\.html#kontakt'+chr(34)+' class='+chr(34)+'btn-primary mt-2 w-full'+chr(34)+'[^>]*>[^<]*</a>)(\s*\n\s*</div>\s*\n\s*</div>\s*\n</header>)')
    mrep = '\1' + chr(10) + DARK_TOGGLE_MOBILE + '\2'
    cn = re.sub(mpat, mrep, content, flags=re.DOTALL)
    if cn != content:
        content = cn
        print('  [4] Mobile toggle added')
    else:
        print('  [4] WARNING: mobile pattern not matched')

    if 'function toggleDark' not in content:
        content = content.replace('function toggleMob()', DARK_JS + chr(10) + '  function toggleMob()')
        print('  [5] Dark JS added')
    else:
        print('  [5] SKIP dark JS')

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print('  => SAVED')
    else:
        print('  => WARNING: no changes saved')
    print()

print('Done!')
