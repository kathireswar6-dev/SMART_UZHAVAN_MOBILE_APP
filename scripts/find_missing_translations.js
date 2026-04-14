const fs = require('fs');
const path = require('path');

const allStrings = new Set();

// Scan all app screens
const appFiles = fs.readdirSync('app').filter(f => f.endsWith('.tsx'));
for (const f of appFiles) {
  const content = fs.readFileSync(path.join('app', f), 'utf8');
  const re = /translate\(["']([^"']+)["']\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    if (!m[1].includes('${')) allStrings.add(m[1]);
  }
}

// Also scan components
const compFiles = fs.readdirSync('components').filter(f => f.endsWith('.tsx'));
for (const f of compFiles) {
  const content = fs.readFileSync(path.join('components', f), 'utf8');
  const re = /translate\(["']([^"']+)["']\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    if (!m[1].includes('${')) allStrings.add(m[1]);
  }
}

const ts = fs.readFileSync('context/translations.ts', 'utf8');

const langs = ['ta', 'ml', 'kn', 'te', 'hi'];
const results = {};

for (const lang of langs) {
  const startKey = `  ${lang}: {`;
  const start = ts.indexOf(startKey);
  if (start === -1) { results[lang] = [...allStrings]; continue; }
  // find end: next top-level key like "  xx: {"
  const after = ts.indexOf('\n  },\n', start);
  const section = ts.substring(start, after > -1 ? after : ts.length);
  const missing = [...allStrings].filter(s => {
    const key = JSON.stringify(s) + ':';
    return !section.includes(key);
  });
  results[lang] = missing;
}

const lines = ['\n=== MISSING TRANSLATIONS SUMMARY ==='];
for (const [lang, missing] of Object.entries(results)) {
  lines.push(`\n[${lang}] ${missing.length} missing:`);
  missing.forEach(s => lines.push('  - ' + s));
}
const out = lines.join('\n');
console.log(out);
fs.writeFileSync('scripts/missing_translations_report.txt', out, 'utf8');
console.log('\nReport saved to scripts/missing_translations_report.txt');
