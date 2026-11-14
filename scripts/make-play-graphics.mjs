// Renders the Google Play store graphics into docs/play-store/:
//   icon-512.png      512 x 512 app icon (Play's "App icon")
//   feature-1024x500.png  the banner Play shows at the top of the listing ("Feature graphic")
// Run after changing the icon:  node scripts/make-play-graphics.mjs
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const at = (p) => fileURLToPath(new URL(p, import.meta.url));
const icon = await readFile(at('../public/icon.svg'));

await sharp(icon, { density: 300 }).resize(512, 512).png().toFile(at('../docs/play-store/icon-512.png'));
console.log('wrote docs/play-store/icon-512.png');

// The icon artwork sits on the left; the name and three selling points on the right.
// Text stays inside the middle of the banner, since Play may crop the edges on some screens.
// Rounded corners and a soft shadow so the square icon sits on the gradient like an app tile.
const roundMask = Buffer.from('<svg width="300" height="300"><rect width="300" height="300" rx="66" fill="#fff"/></svg>');
const iconPng = await sharp(icon, { density: 300 }).resize(300, 300)
  .composite([{ input: roundMask, blend: 'dest-in' }]).png().toBuffer();
const banner = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1257A8"/>
      <stop offset="1" stop-color="#0B3D78"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#g)"/>
  <rect x="94" y="112" width="300" height="300" rx="66" fill="#061f40" opacity="0.35"/>
  <g fill="#ffffff" opacity="0.07">
    <circle cx="930" cy="70" r="120"/>
    <circle cx="990" cy="460" r="90"/>
  </g>
  <g font-family="Segoe UI, Roboto, Arial, sans-serif" fill="#ffffff">
    <text x="440" y="190" font-size="76" font-weight="800">ChemCSEC</text>
    <text x="442" y="245" font-size="30" font-weight="600" fill="#CFE3FA">CSEC Chemistry, made doable</text>
    <text x="442" y="318" font-size="26">• Lessons, practice and spaced review</text>
    <text x="442" y="360" font-size="26">• Virtual lab and full periodic table</text>
    <text x="442" y="402" font-size="26">• Mock exams that change every time</text>
  </g>
</svg>`;
await sharp(Buffer.from(banner))
  .composite([{ input: iconPng, left: 90, top: 100 }])
  .png()
  .toFile(at('../docs/play-store/feature-1024x500.png'));
console.log('wrote docs/play-store/feature-1024x500.png');
