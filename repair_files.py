# Repair script
import re, sys
sys.stdout.reconfigure(encoding='utf-8')

LANG_TOGGLE_BLOCK = "      <div class=\"lang-toggle hidden sm:flex\">\n        <button id=\"lang-de\" class=\"lang-btn active\" onclick=\"setLang('de')\">DE</button><div class=\"lang-divider\"></div><button id=\"lang-en\" class=\"lang-btn\" onclick=\"setLang('en')\">EN</button>\n      </div>\n"

DESKTOP_CTA_PREFIX = "      <a href=\"../index.html#kontakt\" class=\"btn-primary hidden sm:inline-flex\""

MOBILE_CTA_BASE = "      <a href=\"../index.html#kontakt\" class=\"btn-primary mt-2 w-full\" style=\"font-size:0.88rem;padding:0.75rem 1rem\" onclick=\"toggleMob()\""

MOBILE_CLOSE = '\n    </div>\n  </div>\n</header' + '>'

def repair(filepath):
    print('Repairing: ' + filepath)
    with open(filepath, 'r', encoding='utf-8') as fh: c = fh.read()
    if chr(1) not in c and chr(2) not in c: print('  Already clean'); return

    c = c.replace(chr(1) + '      <button id=', LANG_TOGGLE_BLOCK + '      <button id=')
    c = c.replace(chr(2) + ' style=', DESKTOP_CTA_PREFIX + ' style=')
    uses_dot = 'data-t=' in c
    dt_mob = 'mob.cta' if uses_dot else 'mob-cta'
    cta_txt = 'Kostenlos pr' + chr(252) + 'fen ' + chr(8594) + '</a>'
    mob_cta_full = MOBILE_CTA_BASE + ' data-t=' + chr(34) + dt_mob + chr(34) + chr(62) + cta_txt
    c = c.replace(chr(1) + chr(10), mob_cta_full + chr(10))
    c = c.replace('</div>' + chr(2) + chr(10), '</div>' + MOBILE_CLOSE + chr(10))

    remaining = [(i, ord(ch)) for i, ch in enumerate(c) if ord(ch) < 32 and ch not in (chr(9), chr(10), chr(13))]
    if remaining: print('  WARNING: control chars: ' + str(remaining[:5]))
    else: print('  Control chars fixed')
    with open(filepath, 'w', encoding='utf-8') as fh: fh.write(c)
    print('  Saved')

files = [
    r'c:\Users\maxno\OneDrive\Desktop\Ai automation\webseite\branchen\software-it.html',
    r'c:\Users\maxno\OneDrive\Desktop\Ai automation\webseite\branchen\maschinenbau.html',
    r'c:\Users\maxno\OneDrive\Desktop\Ai automation\webseite\branchen\pharma.html',
    r'c:\Users\maxno\OneDrive\Desktop\Ai automation\webseite\branchen\automotive.html',
]
for f in files: repair(f)
print('Done!')
