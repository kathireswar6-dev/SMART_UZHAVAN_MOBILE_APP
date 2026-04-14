const fs = require('fs');
const path = require('path');
const vm = require('vm');

function extractMissingDict() {
  const src = fs.readFileSync(path.join('scripts', 'inject_missing_translations.js'), 'utf8');
  const start = src.indexOf('const missing = ');
  const end = src.indexOf('\n\n// ── Inject into translations.ts');
  if (start === -1 || end === -1) {
    throw new Error('Could not find missing dictionary block in inject_missing_translations.js');
  }
  const expr = src.substring(start + 'const missing = '.length, end).trim().replace(/;\s*$/, '');
  return vm.runInNewContext('(' + expr + ')');
}

function collectTranslateKeys() {
  const keys = new Set();
  const folders = ['app', 'components'];
  const re = /translate\((["'`])([\s\S]*?)\1\)/g;

  for (const folder of folders) {
    const files = fs.readdirSync(folder).filter((f) => f.endsWith('.tsx'));
    for (const file of files) {
      const full = path.join(folder, file);
      const text = fs.readFileSync(full, 'utf8');
      let m;
      while ((m = re.exec(text)) !== null) {
        const key = m[2];
        if (!key.includes('${') && key.trim()) {
          keys.add(key);
        }
      }
    }
  }

  return Array.from(keys).sort((a, b) => a.localeCompare(b));
}

const missing = extractMissingDict();
const keys = collectTranslateKeys();
const langs = ['en', 'ta', 'ml', 'kn', 'te', 'hi'];

const translations = {};
for (const lang of langs) {
  translations[lang] = {};
  for (const key of keys) {
    if (lang === 'en') {
      translations[lang][key] = key;
    } else {
      translations[lang][key] = missing[lang]?.[key] || key;
    }
  }
}

const lines = [];
lines.push('// Auto-generated from translate() usage and known language overrides.');
lines.push('export const translations: Record<string, Record<string, string>> = {');

for (const lang of langs) {
  lines.push(`  ${lang}: {`);
  for (const key of keys) {
    lines.push(`    ${JSON.stringify(key)}: ${JSON.stringify(translations[lang][key])},`);
  }
  lines.push('  },');
  lines.push('');
}

lines.push('};');
lines.push('');

fs.writeFileSync(path.join('context', 'translations.ts'), lines.join('\n'), 'utf8');
console.log(`Rebuilt context/translations.ts with ${keys.length} keys across ${langs.length} languages.`);
