import fs from 'node:fs';
const h = fs.readFileSync(new URL('../www/index.html', import.meta.url), 'utf8');
for (const must of ['three.min.js', 'fonts.css', 'app.js', 'lcem:over', 'lcem:back']) if (!h.includes(must)) { console.error('Falta', must); process.exit(1); }
if (/https:\/\/(cdnjs|fonts\.googleapis)/.test(h)) { console.error('Recursos externos'); process.exit(1); }
console.log('check ok');
