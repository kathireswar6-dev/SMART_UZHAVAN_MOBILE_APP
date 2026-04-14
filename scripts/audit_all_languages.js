const fs = require('fs');
const path = require('path');
const vm = require('vm');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function parseTranslations() {
  const src = read(path.join('context', 'translations.ts'));
  const start = src.indexOf('export const translations');
  const open = src.indexOf('{', start);
  const end = src.lastIndexOf('};');
  const obj = vm.runInNewContext('(' + src.slice(open, end + 1) + ')');
  return obj;
}

function collectTranslateKeys() {
  const roots = ['app', 'components'];
  const exts = new Set(['.ts', '.tsx']);
  const keys = new Set();
  const re = /translate\((['"`])([\s\S]*?)\1\)/g;

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const files = fs.readdirSync(root).filter((f) => exts.has(path.extname(f)));
    for (const f of files) {
      const src = read(path.join(root, f));
      let m;
      while ((m = re.exec(src)) !== null) {
        const key = m[2];
        if (!key.includes('${') && key.trim()) keys.add(key);
      }
    }
  }
  return Array.from(keys).sort((a, b) => a.localeCompare(b));
}

const translations = parseTranslations();
const keys = collectTranslateKeys();
const langs = ['ta', 'ml', 'kn', 'te', 'hi'];

const out = [];
out.push(`Total translate() keys: ${keys.length}`);

for (const lang of langs) {
  const dict = translations[lang] || {};
  const missing = keys.filter((k) => !(k in dict));
  out.push(`\n[${lang}] missing: ${missing.length}`);
  missing.forEach((k) => out.push(` - ${k}`));
}

const reportPath = path.join('scripts', 'audit_all_languages_report.txt');
fs.writeFileSync(reportPath, out.join('\n') + '\n', 'utf8');
console.log(`Report written: ${reportPath}`);
