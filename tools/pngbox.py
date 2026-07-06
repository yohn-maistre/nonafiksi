#!/usr/bin/env python3
"""pngbox.py <sheet.png> [min_area] — exact bounding boxes of sprites on a
spritesheet, via pure-stdlib PNG decode (no PIL on this host). Finds connected
non-transparent components; prints x,y,w,h sorted by area. Use to get catalog
crop coords instead of eyeballing (see docs/PLAN.md Wave 1)."""
import sys, zlib, struct
from collections import deque

def decode(path):
    d = open(path, 'rb').read()
    assert d[:8] == b'\x89PNG\r\n\x1a\n', 'not a PNG'
    pos, idat, w, h, ct, bd = 8, b'', 0, 0, None, None
    while pos < len(d):
        ln, typ = struct.unpack('>I4s', d[pos:pos+8]); pos += 8
        chunk = d[pos:pos+ln]; pos += ln + 4
        if typ == b'IHDR':
            w, h, bd, ct = struct.unpack('>IIBB', chunk[:10])
            assert bd == 8 and ct in (6, 2), f'unsupported: depth={bd} color={ct}'
        elif typ == b'IDAT': idat += chunk
        elif typ == b'IEND': break
    raw = zlib.decompress(idat)
    bpp = 4 if ct == 6 else 3
    stride = w * bpp
    out = bytearray(h * stride)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p+stride]); p += stride
        if f == 1:
            for i in range(bpp, stride): line[i] = (line[i] + line[i-bpp]) & 255
        elif f == 2:
            for i in range(stride): line[i] = (line[i] + prev[i]) & 255
        elif f == 3:
            for i in range(stride):
                a = line[i-bpp] if i >= bpp else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif f == 4:
            for i in range(stride):
                a = line[i-bpp] if i >= bpp else 0
                b = prev[i]; c = prev[i-bpp] if i >= bpp else 0
                pa, pb, pc = abs(b-c), abs(a-c), abs(a+b-2*c)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 255
        out[y*stride:(y+1)*stride] = line
        prev = line
    alpha = [[(out[y*stride+x*bpp+3] > 20) if ct == 6 else True
              for x in range(w)] for y in range(h)]
    return w, h, alpha

def boxes(w, h, alpha, min_area):
    seen = [[False]*w for _ in range(h)]
    out = []
    for y0 in range(h):
        for x0 in range(w):
            if alpha[y0][x0] and not seen[y0][x0]:
                q = deque([(x0, y0)]); seen[y0][x0] = True
                x1 = x2 = x0; y1 = y2 = y0; n = 0
                while q:
                    x, y = q.popleft(); n += 1
                    x1, x2 = min(x1, x), max(x2, x); y1, y2 = min(y1, y), max(y2, y)
                    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)):
                        nx, ny = x+dx, y+dy
                        if 0 <= nx < w and 0 <= ny < h and alpha[ny][nx] and not seen[ny][nx]:
                            seen[ny][nx] = True; q.append((nx, ny))
                bw, bh = x2-x1+1, y2-y1+1
                if bw*bh >= min_area: out.append((bw*bh, x1, y1, bw, bh))
    return sorted(out, reverse=True)

if __name__ == '__main__':
    w, h, alpha = decode(sys.argv[1])
    min_area = int(sys.argv[2]) if len(sys.argv) > 2 else 200
    print(f'# {sys.argv[1]}  {w}x{h}')
    for area, x, y, bw, bh in boxes(w, h, alpha, min_area)[:40]:
        print(f'x={x:4} y={y:4} w={bw:3} h={bh:3}  (area {area})')
