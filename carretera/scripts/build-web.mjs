// Prepara www/: el juego HTML con three.js y las fuentes dentro, para que funcione sin conexión.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
const out = 'www';
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/fonts`, { recursive: true });
copyFileSync('node_modules/three/build/three.min.js', `${out}/three.min.js`);
const fonts = [
  ['Bungee', 400, '@fontsource/bungee/files/bungee-latin-400-normal.woff2'],
  ...[500, 600, 700, 800].map((w) => ['Barlow Condensed', w, `@fontsource/barlow-condensed/files/barlow-condensed-latin-${w}-normal.woff2`]),
];
let css = '';
for (const [fam, w, p] of fonts) {
  const name = p.split('/').pop();
  copyFileSync(`node_modules/${p}`, `${out}/fonts/${name}`);
  css += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/${name}) format('woff2')}\n`;
}
writeFileSync(`${out}/fonts/fonts.css`, css);
let html = readFileSync('src/index.html', 'utf8');
const n0 = html.length;
html = html
  .replace(/<link rel="preconnect"[^>]*>\s*/g, '')
  .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link href="fonts/fonts.css" rel="stylesheet">')
  .replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'three.min.js');
if (html.includes('googleapis') || html.includes('cdnjs')) throw new Error('Quedan recursos externos en el HTML');
writeFileSync(`${out}/index.html`, html);
console.log('www listo', n0, '->', html.length);
