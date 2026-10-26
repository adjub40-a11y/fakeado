// Genera www/ a partir del juego: motor 3D y tipografías locales (funciona sin conexión) + puente nativo.
import fs from 'node:fs'; import path from 'node:path'; import { buildSync } from 'esbuild';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'); const www = path.join(root, 'www');
fs.rmSync(www, { recursive: true, force: true }); fs.mkdirSync(path.join(www, 'fonts'), { recursive: true });
let html = fs.readFileSync(path.join(root, 'src/game.html'), 'utf8');
html = html.replace(/<link rel="preconnect"[^>]*>\n?/g, '').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts.css">');
html = html.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '<script src="three.min.js"></script>');
if (html.includes('cdnjs.cloudflare.com') || html.includes('fonts.googleapis.com')) throw new Error('Quedan recursos externos en el HTML');
html = html.replace('</body>', '<script src="app.js"></script>\n</body>');
fs.writeFileSync(path.join(www, 'index.html'), html);
fs.copyFileSync(path.join(root, 'node_modules/three/build/three.min.js'), path.join(www, 'three.min.js'));
const fonts = [['Bungee', 400, '@fontsource/bungee/files/bungee-latin-400-normal.woff2'], ...[500, 600, 700, 800].map(w => ['Barlow Condensed', w, `@fontsource/barlow-condensed/files/barlow-condensed-latin-${w}-normal.woff2`])];
let css = '';
for (const [fam, w, f] of fonts) { const name = path.basename(f); fs.copyFileSync(path.join(root, 'node_modules', f), path.join(www, 'fonts', name)); css += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/${name}) format('woff2')}\n`; }
fs.writeFileSync(path.join(www, 'fonts.css'), css);
buildSync({ entryPoints: [path.join(root, 'src/app.js')], bundle: true, format: 'iife', target: 'es2019', minify: true, outfile: path.join(www, 'app.js') });
console.log('www listo:', fs.readdirSync(www).join(', '));
