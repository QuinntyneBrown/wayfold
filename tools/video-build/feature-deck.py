# Feature walkthrough deck generator.
# python tools/video-build/feature-deck.py <folder>/deck.py <folder>   (run from the repo root, after screenshotting the mocks)
# spec defines NUM, TITLE, SUB, PARTS (list), SLIDES (list of dicts) and SHOTS {img: (dir, mockname, crop_y or None)}.
# Slide kinds:
#   {'k':'shot','img':..,'tag':..,'h':..,'p':..,'cue':..,'part':n}
#   {'k':'phone','img':..,'tag':..,'h':..,'p':..,'cue':..,'part':n}
#   {'k':'strip','h':..,'items':[(img, caption),...],'cue':..,'part':n}
#   {'k':'text','h':..,'lead':..,'cue':..,'part':n}
#   {'k':'recap','items':[...],'cue':..,'part':n}
#   {'k':'next','h':..,'lead':..,'cue':..,'part':n}
import sys, os, shutil, subprocess, runpy
spec = runpy.run_path(sys.argv[1]); folder = sys.argv[2]
root = os.getcwd()
img = os.path.join(folder, 'img'); os.makedirs(img, exist_ok=True)
for name, (d, mock, crop) in spec['SHOTS'].items():
    src = os.path.join(root, 'docs/mocks/.cache', d, f'{mock}--' + ('360x800' if d == 'video-phone' else '1408x792') + '--light.png')
    dst = os.path.join(img, name)
    if crop is None:
        shutil.copyfile(src, dst)
    else:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f'crop=1408:792:0:{crop}', dst], check=True)

def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('"', '&quot;')
out = []
num, title = spec['NUM'], spec['TITLE']
out.append(f'''<section id="title" data-part="0">
  <img class="mark" src="../assets/mark.svg" alt="">
  <div class="kicker">Wayfold · Video {num}</div>
  <h1>{esc(title)}</h1>
  <p class="lead">{esc(spec['SUB'])}</p>
</section>''')
for i, s in enumerate(spec['SLIDES']):
    a = f'id="s{i + 1}" data-part="{s["part"]}" data-cue="{esc(s["cue"])}"'
    k = s['k']
    if k in ('shot', 'phone'):
        cls = 'clip' if k == 'shot' else 'clip phone'
        out.append(f'''<section {a}>
  <img class="{cls}" src="img/{s['img']}" alt="">
  <aside class="clip-notes"><span class="tag">{esc(s['tag'])}</span><h3>{esc(s['h'])}</h3><p class="muted">{esc(s['p'])}</p></aside>
</section>''')
    elif k == 'strip':
        n = len(s['items'])
        cells = ''.join(f'<figure style="margin:0;display:grid;gap:14px"><img src="img/{im}" alt="" style="width:100%;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.16)"><figcaption style="font-size:32px;font-weight:700">{esc(c)}</figcaption></figure>' for im, c in s['items'])
        out.append(f'''<section {a}>
  <h2>{esc(s['h'])}</h2>
  <div class="cols" style="grid-template-columns:repeat({n},1fr);gap:40px">{cells}</div>
</section>''')
    elif k == 'text':
        out.append(f'<section {a}>\n  <h2>{esc(s["h"])}</h2>\n  <p class="lead">{esc(s["lead"])}</p>\n</section>')
    elif k == 'recap':
        lis = ''.join(f'<li>{esc(x)}</li>' for x in s['items'])
        out.append(f'<section {a}>\n  <h2>Things to remember</h2>\n  <ul class="recap">{lis}</ul>\n</section>')
    elif k == 'next':
        out.append(f'<section {a}>\n  <img class="mark" src="../assets/mark.svg" alt="" style="width:140px;height:140px">\n  <h2>{esc(s["h"])}</h2><p class="lead">{esc(s["lead"])}</p>\n</section>')
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Video {num} Slides</title>
<link rel="stylesheet" href="../assets/slides.css">
</head>
<body data-video-number="{num}" data-video-title="{esc(title)}" data-parts="{'|'.join(spec['PARTS'])}">

<!-- Screens are mock screenshots from docs/mocks (light theme, 1408x792 or 360x800); see README. -->

''' + '\n\n'.join(out) + '\n\n<script src="../assets/slides.js"></script>\n</body>\n</html>\n'
open(os.path.join(folder, 'slides.html'), 'w', encoding='utf-8', newline='\n').write(html)
print(len(out), 'slides')
