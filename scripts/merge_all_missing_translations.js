const fs = require('fs');
const path = require('path');
const vm = require('vm');

const translationsPath = path.join('context', 'translations.ts');
const injectPath = path.join('scripts', 'inject_missing_translations.js');

function parseTranslationsTs(fileText) {
  const start = fileText.indexOf('export const translations');
  if (start === -1) throw new Error('translations export not found');
  const open = fileText.indexOf('{', start);
  const end = fileText.lastIndexOf('};');
  if (open === -1 || end === -1) throw new Error('translations object bounds not found');
  const objLiteral = fileText.slice(open, end + 1);
  return vm.runInNewContext('(' + objLiteral + ')');
}

function parseMissingInject(fileText) {
  const start = fileText.indexOf('const missing = ');
  if (start === -1) throw new Error('missing object start not found in inject script');
  const from = start + 'const missing = '.length;
  const open = fileText.indexOf('{', from);
  if (open === -1) throw new Error('missing object opening brace not found');

  let depth = 0;
  let close = -1;
  for (let i = open; i < fileText.length; i++) {
    const ch = fileText[i];
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close === -1) throw new Error('missing object closing brace not found');

  const expr = fileText.slice(open, close + 1);
  return vm.runInNewContext('(' + expr + ')');
}

function printObject(obj) {
  const langOrder = ['en', 'ta', 'ml', 'kn', 'te', 'hi'];
  const lines = [];
  lines.push('// Translation dictionary used by LanguageContext.');
  lines.push('// Missing keys gracefully fall back to the original English string.');
  lines.push('export const translations: Record<string, Record<string, string>> = {');

  for (const lang of langOrder) {
    const dict = obj[lang] || {};
    const keys = Object.keys(dict).sort((a, b) => a.localeCompare(b));
    lines.push(`\t${lang}: {`);
    for (const key of keys) {
      lines.push(`\t\t${JSON.stringify(key)}: ${JSON.stringify(dict[key])},`);
    }
    lines.push('\t},');
    lines.push('');
  }

  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

const currentText = fs.readFileSync(translationsPath, 'utf8');
const injectText = fs.readFileSync(injectPath, 'utf8');

const current = parseTranslationsTs(currentText);
const missing = parseMissingInject(injectText);

const languages = ['ta', 'ml', 'kn', 'te', 'hi'];
const addedStats = {};

for (const lang of languages) {
  current[lang] = current[lang] || {};
  const before = Object.keys(current[lang]).length;
  const missingDict = missing[lang] || {};
  for (const [k, v] of Object.entries(missingDict)) {
    if (!(k in current[lang])) {
      current[lang][k] = v;
    }
  }
  const after = Object.keys(current[lang]).length;
  addedStats[lang] = after - before;
}

// Keep English as source fallback entries for missing keys that exist only in other langs
current.en = current.en || {};
for (const lang of languages) {
  for (const key of Object.keys(current[lang])) {
    if (!(key in current.en)) current.en[key] = key;
  }
}

const output = printObject(current);
fs.writeFileSync(translationsPath, output, 'utf8');

console.log('Merged missing translation keys.');
for (const lang of languages) {
  console.log(`${lang}: +${addedStats[lang]} keys, total ${Object.keys(current[lang]).length}`);
}
console.log(`en total keys: ${Object.keys(current.en).length}`);
