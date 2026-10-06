// Compila src/data/raw/*.txt -> src/data/questions.json y valida cada pregunta.
// Uso: node scripts/build-questions.ts
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { matchesTruth, normalize, isOffensive } from '../src/engine/text.ts';
import { CATEGORIES } from '../src/data/categories.ts';

const RAW = join(import.meta.dirname, '../src/data/raw');
const OUT = join(import.meta.dirname, '../src/data/questions.json');



const isNum = (s: string) => /^[\d.,]+$/.test(s.trim());
const errors: string[] = [];
const all: any[] = [];
const seenQ = new Set<string>();

for (const file of readdirSync(RAW).filter((f) => f.endsWith('.txt')).sort()) {
  const cat = file.replace('.txt', '');
  const meta = CATEGORIES[cat];
  if (!meta) {
    errors.push(`${file}: categoría desconocida`);
    continue;
  }
  const lines = readFileSync(join(RAW, file), 'utf8').split('\n');
  let n = 0;
  const perLvl: Record<number, number> = {};
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    let f = t.split('|').map((x) => x.trim());
    if (f.length === 8 && f[5] === '-' && f[6] === '-') f = [...f.slice(0, 5), '-', f[7]];
    const where = `${file}:${i + 1}`;
    if (f.length !== 7) return errors.push(`${where}: ${f.length} campos (deben ser 7)`);
    const [lv, q, a, alias, house, kids, fact] = f;
    const lvl = Number(lv);
    if (![1, 2, 3].includes(lvl)) errors.push(`${where}: nivel inválido`);
    if (!q.includes('___')) errors.push(`${where}: falta ___ en la pregunta`);
    if (q.split('___').length !== 2) errors.push(`${where}: más de un hueco`);
    if (!a) errors.push(`${where}: sin respuesta`);
    if (a.split(' ').length > 4) errors.push(`${where}: respuesta demasiado larga "${a}"`);
    const aliasL = alias === '-' || !alias ? [] : alias.split(';').map((x) => x.trim()).filter(Boolean);
    const houseL = house.split(';').map((x) => x.trim()).filter(Boolean);
    const kidsL = kids === '-' || !kids ? [] : kids.split(';').map((x) => x.trim()).filter(Boolean);
    if (houseL.length < 2) errors.push(`${where}: necesita al menos 2 mentiras de la casa`);
    if (lvl === 1 && kidsL.length !== 3) errors.push(`${where}: nivel 1 necesita 3 mentiras peques (${kidsL.length})`);
    if (!fact || fact === '-') errors.push(`${where}: falta dato curioso`);
    for (const l of [...houseL, ...kidsL]) {
      if (matchesTruth(l, a, aliasL)) errors.push(`${where}: la mentira "${l}" coincide con la verdad`);
      if (isOffensive(l)) errors.push(`${where}: mentira malsonante "${l}"`);
    }
    if (isNum(a) !== houseL.every(isNum)) errors.push(`${where}: formato número/palabra distinto entre verdad "${a}" y casa ${houseL.join(',')}`);
    if (new Set(houseL.map(normalize)).size !== houseL.length) errors.push(`${where}: casa repetida`);
    const key = normalize(q);
    if (seenQ.has(key)) errors.push(`${where}: pregunta repetida`);
    seenQ.add(key);
    n++;
    perLvl[lvl] = (perLvl[lvl] ?? 0) + 1;
    all.push({
      id: `${meta.prefix}-${String(n).padStart(3, '0')}`,
      cat,
      lvl,
      q,
      a,
      alias: aliasL,
      house: houseL,
      kids: kidsL,
      fact,
      // ~1 de cada 3 por nivel gratis
      free: perLvl[lvl] % 3 === 1,
    });
  });
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} errores`);
  process.exit(1);
}
writeFileSync(OUT, JSON.stringify(all));
const by = (k: string) => all.reduce((m: any, q: any) => ((m[q[k]] = (m[q[k]] ?? 0) + 1), m), {});
console.log(`${all.length} preguntas · gratis ${all.filter((q) => q.free).length}`);
console.log('por nivel', by('lvl'));
console.log('por categoría', by('cat'));
