#!/usr/bin/env python3
"""build.py — bundle web/ into a single self-contained HTML (phone/file://
delivery; hosted mode ships web/ as-is in Wave 5). Output: dist/nonafiksi.html"""
import base64, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = lambda *p: os.path.join(ROOT, 'web', *p)
SCRATCH = '/tmp/claude-0/-root-workspace-code/312ca707-457a-4887-a344-14e621543c0b/scratchpad'

SHEETS = {
    'house': 'TilesetHouse.png', 'nature': 'TilesetNature.png',
    'boy': 'char-boy-walk.png', 'v1': 'char-villager-walk.png',
    'v4': 'char-villager4-walk.png', 'woman': 'char-woman-walk.png',
    'old': 'char-oldwoman-sheet.png', 'cat': 'char-cat-sheet.png',
    'floor': 'TilesetInteriorFloor.png', 'intel': 'InteriorElements.png',
    'dog': 'char-dog-sheet.png', 'chicken': 'char-chicken-sheet.png',
}

def b64(path):
    return base64.b64encode(open(path, 'rb').read()).decode()

def utf8(path):  # explicit: Windows defaults to cp1252 and chokes on the ✦
    return open(path, encoding='utf-8').read()

def main():
    html = utf8(W('index.html'))
    engine = utf8(W('engine.js'))
    vendor = utf8(W('vendor', 'qrcodegen.js'))
    game = utf8(W('game.js'))
    catalog = json.loads(utf8(W('catalog.json')))
    scenes = json.loads(utf8(W('aksara', 'scenes.json')))
    assets = {k: 'data:image/png;base64,' + b64(W('assets', f))
              for k, f in SHEETS.items()}
    data = (f"const NF_ASSETS={json.dumps(assets)};"
            f"const NF_CATALOG={json.dumps(catalog)};"
            f"const NF_SCENES={json.dumps(scenes)};")
    html = html.replace('__SCRIPTS__',
        f'<script>{engine}</script>\n<script>{vendor}</script>\n'
        f'<script>{data}</script>\n<script>{game}</script>')
    fdir = W('fonts') if os.path.exists(W('fonts', 'ps2p.b64')) else SCRATCH
    html = html.replace('__PS2P__', utf8(os.path.join(fdir, 'ps2p.b64')).strip())
    html = html.replace('__VT323__', utf8(os.path.join(fdir, 'vt323.b64')).strip())
    leftover = re.sub(r'base64,[A-Za-z0-9+/=]+', '', html)
    assert '__' not in leftover.replace('__proto__', ''), 'placeholder left: ' + \
        ','.join(set(re.findall(r'__[A-Z0-9]+__', leftover)))
    os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
    out = os.path.join(ROOT, 'dist', 'nonafiksi.html')
    open(out, 'w', encoding='utf-8').write(html)
    print('OK', out, len(html), 'bytes')

if __name__ == '__main__':
    main()
