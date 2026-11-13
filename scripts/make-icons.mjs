// Renders public/icon.svg to the PNG sizes phones need to install the app.
// Run after changing the icon:  node scripts/make-icons.mjs
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = await readFile(new URL('../public/icon.svg', import.meta.url));
const sizes = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180 };

for (const [name, size] of Object.entries(sizes)) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(new URL(`../public/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/%20/g, ' '));
  console.log(`wrote public/${name} (${size}px)`);
}
