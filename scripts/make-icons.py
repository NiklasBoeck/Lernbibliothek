# Erzeugt App-Symbol und Startbildschirm (Bücherregal mit Haken) für Web, Android und iOS.
import os
from PIL import Image, ImageDraw

PETROL, PAPER = (31, 95, 122), (238, 240, 235)
SPINES = [((242, 243, 238), 0.20, 0.62, 0), ((245, 220, 60), 0.38, 0.70, 0), ((92, 194, 131), 0.56, 0.56, -14)]

def art(size, bg=True, pad=0.0):
    s = size * 4
    img = Image.new('RGBA', (s, s), PETROL + (255,) if bg else (0, 0, 0, 0))
    inner = s * (1 - 2 * pad)
    off = s * pad
    base = off + inner * 0.80
    for color, x, h, angle in SPINES:
        w, hh = inner * 0.15, inner * h
        spine = Image.new('RGBA', (int(w), int(hh)), (0, 0, 0, 0))
        d = ImageDraw.Draw(spine)
        d.rounded_rectangle([0, 0, w - 1, hh - 1], radius=w * 0.18, fill=color + (255,))
        d.rectangle([w * 0.18, hh * 0.16, w * 0.82, hh * 0.21], fill=PETROL + (90,))
        d.rectangle([w * 0.18, hh * 0.78, w * 0.82, hh * 0.83], fill=PETROL + (90,))
        if angle:
            spine = spine.rotate(angle, expand=True, resample=Image.BICUBIC)
        px = off + inner * x if not angle else off + inner * x + inner * 0.02
        img.alpha_composite(spine, (int(px), int(base - spine.size[1])))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([off + inner * 0.14, base, off + inner * 0.86, base + inner * 0.05], radius=inner * 0.02, fill=(242, 243, 238, 255))
    return img.resize((size, size), Image.LANCZOS)

def rounded(img, r=0.22):
    m = Image.new('L', img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], radius=img.size[0] * r, fill=255)
    out = Image.new('RGBA', img.size, (0, 0, 0, 0)); out.paste(img, (0, 0), m); return out

def save(img, path, rgb=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    (img.convert('RGB') if rgb else img).save(path)

# Web
save(rounded(art(192, pad=0.06)), 'assets/icon-192.png')
save(rounded(art(512, pad=0.06)), 'assets/icon-512.png')
save(art(512, pad=0.16), 'assets/icon-maskable-512.png', rgb=True)
save(art(180, pad=0.06), 'assets/apple-touch-icon.png', rgb=True)
# iOS (volle Fläche, iOS rundet selbst)
save(art(1024, pad=0.06), 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', rgb=True)
# Android
res = 'android/app/src/main/res'
for name, px in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    save(rounded(art(px, pad=0.06), 0.18), f'{res}/mipmap-{name}/ic_launcher.png')
    c = art(px, pad=0.06)
    m = Image.new('L', c.size, 0); ImageDraw.Draw(m).ellipse([0, 0, px - 1, px - 1], fill=255)
    rc = Image.new('RGBA', c.size, (0, 0, 0, 0)); rc.paste(c, (0, 0), m)
    save(rc, f'{res}/mipmap-{name}/ic_launcher_round.png')
    fg = int(px * 108 / 48)
    save(art(fg, bg=False, pad=0.25), f'{res}/mipmap-{name}/ic_launcher_foreground.png')
# Startbildschirm: Papierfarbe mit Symbol in der Mitte
def splash(w, h, path):
    img = Image.new('RGB', (w, h), PAPER)
    ic = rounded(art(int(min(w, h) * 0.28), pad=0.06))
    img.paste(ic, ((w - ic.size[0]) // 2, (h - ic.size[1]) // 2), ic)
    save(img, path)
for root, dirs, files in os.walk(res):
    for f in files:
        if f == 'splash.png':
            p = os.path.join(root, f); w, h = Image.open(p).size; splash(w, h, p)
for f in os.listdir('ios/App/App/Assets.xcassets/Splash.imageset'):
    if f.endswith('.png'):
        splash(2732, 2732, f'ios/App/App/Assets.xcassets/Splash.imageset/{f}')
print('Symbole erzeugt')
