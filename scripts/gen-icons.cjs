// Génère les icônes PWA de Diaranguel — vert & blanc (pirogue sur le fleuve)
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const GREEN_DARK = "#14532D";
const GREEN_MID = "#166534";
const WHITE = "#FFFFFF";
const GOLD = "#E9B949";

// Logo : pirogue halpulaar sur des vagues, soleil d'hiver, cadre arrondi
function logoSvg({ pad = 0, rounded = 0 }) {
  const S = 512;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${S}" height="${S}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GREEN_DARK}"/>
      <stop offset="1" stop-color="${GREEN_MID}"/>
    </linearGradient>
  </defs>
  <rect x="${pad}" y="${pad}" width="${S - 2 * pad}" height="${S - 2 * pad}" rx="${rounded}" fill="url(#sky)"/>
  <g transform="translate(${pad * (1 - 1)},${pad * (1 - 1)})">
    <!-- Soleil (disque doré) -->
    <circle cx="256" cy="150" r="46" fill="${GOLD}"/>
    <!-- Pirogue -->
    <g fill="${WHITE}">
      <path d="M 116 292
               C 150 292 190 296 256 296
               C 322 296 362 292 396 292
               L 356 348
               C 330 362 282 368 256 368
               C 230 368 182 362 156 348
               Z"/>
      <!-- Pirogue côté creux -->
      <path d="M 156 316 C 190 328 322 328 356 316 L 344 340 C 318 350 194 350 168 340 Z" fill="${GREEN_MID}"/>
      <!-- Pagayeur -->
      <circle cx="256" cy="248" r="18"/>
      <path d="M 238 268 C 240 258 272 258 274 268 L 270 296 L 242 296 Z"/>
      <!-- Pagaie -->
      <rect x="286" y="216" width="9" height="88" rx="4.5" transform="rotate(18 290 260)"/>
    </g>
    <!-- Vagues du fleuve -->
    <g fill="${WHITE}" opacity="0.95">
      <path d="M 96 402 C 136 386 176 418 216 402 C 256 386 296 418 336 402 C 376 386 408 410 416 404 L 416 440 L 96 440 Z"/>
    </g>
    <g fill="${WHITE}" opacity="0.55">
      <path d="M 116 448 C 156 434 196 462 236 448 C 276 434 316 462 356 448 C 380 440 396 448 398 446 L 398 476 L 116 476 Z"/>
    </g>
    <!-- Tiges de riz -->
    <g stroke="${WHITE}" stroke-width="10" stroke-linecap="round" fill="none">
      <path d="M 128 360 C 122 330 118 300 122 272"/>
      <path d="M 384 360 C 390 330 394 300 390 272"/>
    </g>
    <g fill="${GOLD}">
      <ellipse cx="118" cy="262" rx="9" ry="14" transform="rotate(-18 118 262)"/>
      <ellipse cx="134" cy="286" rx="9" ry="14" transform="rotate(12 134 286)"/>
      <ellipse cx="394" cy="262" rx="9" ry="14" transform="rotate(18 394 262)"/>
      <ellipse cx="378" cy="286" rx="9" ry="14" transform="rotate(-12 378 286)"/>
    </g>
  </g>
</svg>`;
}

async function main() {
  const outDir = path.join(__dirname, "..", "public", "icons");
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = [
    { file: "icon-192.png", size: 192, pad: 0, rounded: 96 },
    { file: "icon-512.png", size: 512, pad: 0, rounded: 116 },
    { file: "icon-64.png", size: 64, pad: 0, rounded: 14 },
    // maskable : zone de sécurité → padding 15 % et fond plein
    { file: "icon-192-maskable.png", size: 192, pad: 29, rounded: 0 },
    { file: "icon-512-maskable.png", size: 512, pad: 77, rounded: 0 },
    { file: "apple-touch-icon.png", size: 180, pad: 0, rounded: 0 },
  ];

  for (const job of jobs) {
    const svg = Buffer.from(logoSvg({ pad: (job.pad / job.size) * 512, rounded: (job.rounded / job.size) * 512 }));
    await sharp(svg)
      .resize(job.size, job.size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(outDir, job.file));
    console.log("OK", job.file);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
