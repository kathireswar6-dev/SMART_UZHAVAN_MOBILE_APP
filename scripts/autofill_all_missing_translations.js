const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { translate } = require('@vitalets/google-translate-api');

const LANGS = ['ta', 'ml', 'kn', 'te', 'hi'];

function parseTranslations(tsPath) {
  const src = fs.readFileSync(tsPath, 'utf8');
  const start = src.indexOf('export const translations');
  const open = src.indexOf('{', start);
  const end = src.lastIndexOf('};');
  if (start === -1 || open === -1 || end === -1) throw new Error('Unable to parse translations.ts');
  return vm.runInNewContext('(' + src.slice(open, end + 1) + ')');
}

function collectTranslateKeys() {
  const roots = ['app', 'components'];
  const keySet = new Set();
  const re = /translate\((['"`])([\s\S]*?)\1\)/g;

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const file of fs.readdirSync(root)) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
      const full = path.join(root, file);
      const src = fs.readFileSync(full, 'utf8');
      let m;
      while ((m = re.exec(src)) !== null) {
        const key = m[2];
        if (!key.includes('${') && key.trim()) keySet.add(key);
      }
    }
  }

  return Array.from(keySet).sort((a, b) => a.localeCompare(b));
}

function stringifyTranslations(obj) {
  const order = ['en', 'ta', 'ml', 'kn', 'te', 'hi'];
  const lines = [];
  lines.push('// Translation dictionary used by LanguageContext.');
  lines.push('// Missing keys gracefully fall back to the original English string.');
  lines.push('export const translations: Record<string, Record<string, string>> = {');

  for (const lang of order) {
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

async function run() {
  const tsPath = path.join('context', 'translations.ts');
  const data = parseTranslations(tsPath);
  const keys = collectTranslateKeys();

  data.en = data.en || {};
  for (const key of keys) {
    if (!(key in data.en)) data.en[key] = key;
  }

  const missingByLang = {};
  for (const lang of LANGS) {
    data[lang] = data[lang] || {};
    missingByLang[lang] = keys.filter((k) => !(k in data[lang]));
  }

  const totalMissing = LANGS.reduce((n, l) => n + missingByLang[l].length, 0);
  console.log('Total translate keys:', keys.length);
  console.log('Total missing across target langs:', totalMissing);

  for (const lang of LANGS) {
    const missing = missingByLang[lang];
    console.log(`\n[${lang}] filling ${missing.length} keys...`);
    for (let i = 0; i < missing.length; i++) {
      const key = missing[i];
      try {
        const res = await translate(key, { to: lang, from: 'en' });
        data[lang][key] = (res.text || key).trim() || key;
      } catch {
        data[lang][key] = key;
      }
      if ((i + 1) % 20 === 0 || i === missing.length - 1) {
        console.log(`[${lang}] ${i + 1}/${missing.length}`);
      }
    }
  }

  fs.writeFileSync(tsPath, stringifyTranslations(data), 'utf8');

  console.log('\nDone. Updated context/translations.ts');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
