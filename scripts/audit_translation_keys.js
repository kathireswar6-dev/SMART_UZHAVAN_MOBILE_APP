const fs = require('fs');
const path = require('path');

const roots = ['app', 'components'];
const keySet = new Set();
const re = /translate\((['"`])([\s\S]*?)\1\)/g;

for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of fs.readdirSync(root)) {
    if (!file.endsWith('.tsx')) continue;
    const full = path.join(root, file);
    const src = fs.readFileSync(full, 'utf8');
    let m;
    while ((m = re.exec(src)) !== null) {
      const key = m[2];
      if (!key.includes('${') && key.trim()) keySet.add(key);
    }
  }
}

const { translations } = require('../context/translations.ts');
const langs = ['ta', 'ml', 'kn', 'te', 'hi'];

const keys = Array.from(keySet).sort((a,b)=>a.localeCompare(b));
console.log('Total translate() keys in UI:', keys.length);
for (const lang of langs) {
  const dict = translations[lang] || {};
  const missing = keys.filter((k) => !(k in dict));
  console.log(`\n[${lang}] missing: ${missing.length}`);
  missing.slice(0, 30).forEach((k)=>console.log(' - ' + k));
  if (missing.length > 30) console.log(` ... and ${missing.length - 30} more`);
}
