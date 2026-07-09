// Растеризует public/favicon.svg (щит с «!») в PNG-иконки для PWA-манифеста.
// Без зависимостей: путь разложен в полигон, заливка — суперсэмплингом,
// PNG собирается вручную поверх встроенного zlib.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const OUT_DIR = process.argv[2] ?? 'public'

// ---------- геометрия из favicon.svg (viewBox 0 0 32 32) ----------

function cubic(p0, p1, p2, p3, steps = 24) {
  const pts = []
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps
    const u = 1 - t
    pts.push([
      u * u * u * p0[0] +
        3 * u * u * t * p1[0] +
        3 * u * t * t * p2[0] +
        t * t * t * p3[0],
      u * u * u * p0[1] +
        3 * u * u * t * p1[1] +
        3 * u * t * t * p2[1] +
        t * t * t * p3[1],
    ])
  }
  return pts
}

// M16 2 L4 6 v9 c0 7 5.1 12.3 12 15 c6.9-2.7 12-8 12-15 V6 z
const SHIELD = [
  [16, 2],
  [4, 6],
  [4, 15],
  ...cubic([4, 15], [4, 22], [9.1, 27.3], [16, 30]),
  ...cubic([16, 30], [22.9, 27.3], [28, 22], [28, 15]),
  [28, 6],
]

// Восклицательный знак: клин + точка.
const MARK_BAR = [
  [14.6, 8],
  [17.4, 8],
  [16.9, 15],
  [15.1, 15],
]
const MARK_DOT = [
  [14.7, 17.4],
  [17.3, 17.4],
  [17.3, 20],
  [14.7, 20],
]

/** Чётно-нечётное правило: луч вправо, считаем пересечения. */
function inside(poly, x, y) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      hit = !hit
  }
  return hit
}

// ---------- цвета ----------

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]
const BG = hex('#0b0f17')
const GRAD_TOP = hex('#38bdf8')
const GRAD_BOTTOM = hex('#0ea5e9')
const MARK = hex('#0b0f17')

const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const blend = (dst, src, a) =>
  dst.map((v, i) => Math.round(v + (src[i] - v) * a))

// ---------- PNG ----------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

/** rgb: Buffer размера size*size*3 (без альфы — иконки непрозрачные). */
function encodePng(size, rgb) {
  const raw = Buffer.alloc(size * (size * 3 + 1))
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 3 + 1)] = 0 // фильтр None
    rgb.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // бит на канал
  ihdr[9] = 2 // truecolor RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---------- рендер ----------

const SS = 4 // суперсэмплинг: 4×4 подпикселя

function render(size, artScale) {
  const rgb = Buffer.alloc(size * size * 3)
  const art = size * artScale
  const off = (size - art) / 2
  const unit = art / 32 // пикселей на единицу viewBox

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let shield = 0
      let mark = 0
      let gradAcc = 0
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const x = (px + (sx + 0.5) / SS - off) / unit
          const y = (py + (sy + 0.5) / SS - off) / unit
          if (inside(SHIELD, x, y)) {
            shield += 1
            gradAcc += Math.min(1, Math.max(0, (y - 2) / 28))
          }
          if (inside(MARK_BAR, x, y) || inside(MARK_DOT, x, y)) mark += 1
        }
      }
      const total = SS * SS
      let color = BG
      if (shield > 0) {
        const t = gradAcc / shield
        color = blend(color, lerp(GRAD_TOP, GRAD_BOTTOM, t), shield / total)
      }
      if (mark > 0) color = blend(color, MARK, mark / total)

      const i = (py * size + px) * 3
      rgb[i] = color[0]
      rgb[i + 1] = color[1]
      rgb[i + 2] = color[2]
    }
  }
  return encodePng(size, rgb)
}

// Обычные иконки — щит крупно. Maskable обрезается системой по кругу/скруглению,
// поэтому там щит мельче: он должен уместиться в «безопасную зону» 80%.
const ICONS = [
  ['pwa-192x192.png', 192, 0.8],
  ['pwa-512x512.png', 512, 0.8],
  ['pwa-maskable-512x512.png', 512, 0.56],
  ['apple-touch-icon-180x180.png', 180, 0.78],
]

for (const [name, size, scale] of ICONS) {
  const png = render(size, scale)
  writeFileSync(`${OUT_DIR}/${name}`, png)
  console.log(
    `${name.padEnd(30)} ${size}×${size}  ${(png.length / 1024).toFixed(1)} КБ`,
  )
}
