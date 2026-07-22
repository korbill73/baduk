import os
import struct
import zlib

def make_png(width, height, path):
    # Create PNG header
    png_magic = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>2I5B', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    ihdr = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)

    # Generate raw pixel data (RGB with background #0f172a and glowing circle/stones)
    raw_data = bytearray()
    cx, cy = width / 2.0, height / 2.0
    radius = width * 0.42
    stone_r = width * 0.16
    for y in range(height):
        raw_data.append(0) # Filter byte 0 (None)
        for x in range(width):
            dx = x - cx
            dy = y - cy
            dist = (dx*dx + dy*dy) ** 0.5
            
            # Black and White stone positions
            bx, by = cx - width*0.14, cy - height*0.14
            wx, wy = cx + width*0.14, cy + height*0.14
            bdist = ((x-bx)**2 + (y-by)**2)**0.5
            wdist = ((x-wx)**2 + (y-wy)**2)**0.5
            
            if dist > radius + 4:
                # Background #0f172a
                r, g, b = 15, 23, 42
            elif dist > radius:
                # Border ring #38bdf8
                r, g, b = 56, 189, 248
            elif bdist < stone_r:
                # Black stone with shine
                ratio = bdist / stone_r
                val = int(20 + (1-ratio)*60)
                r, g, b = val, val + 10, val + 25
            elif wdist < stone_r:
                # White stone with shine
                ratio = wdist / stone_r
                val = int(220 + (1-ratio)*35)
                val = min(255, val)
                r, g, b = val, val, val
            else:
                # Board center / dark slate
                r, g, b = 30, 41, 59
            raw_data.extend([r, g, b])

    idat_data = zlib.compress(raw_data, 9)
    idat_crc = zlib.crc32(b'IDAT' + idat_data) & 0xffffffff
    idat = struct.pack('>I', len(idat_data)) + b'IDAT' + idat_data + struct.pack('>I', idat_crc)

    iend_data = b''
    iend_crc = zlib.crc32(b'IEND' + iend_data) & 0xffffffff
    iend = struct.pack('>I', len(iend_data)) + b'IEND' + iend_data + struct.pack('>I', iend_crc)

    with open(path, 'wb') as f:
        f.write(png_magic + ihdr + idat + iend)
    print(f"Generated PNG: {path}")

pub_dir = os.path.join(os.path.dirname(__file__), 'public')
if not os.path.exists(pub_dir):
    os.makedirs(pub_dir)

make_png(192, 192, os.path.join(pub_dir, 'icon-192.png'))
make_png(512, 512, os.path.join(pub_dir, 'icon-512.png'))
