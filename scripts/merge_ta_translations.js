const fs = require('fs');
const path = require('path');
const vm = require('vm');

const tsPath = path.join('context', 'translations.ts');
const injectPath = path.join('scripts', 'inject_missing_translations.js');

const ts = fs.readFileSync(tsPath, 'utf8');
const injectSrc = fs.readFileSync(injectPath, 'utf8');

const start = injectSrc.indexOf('const missing = ');
const end = injectSrc.indexOf('\n\n// ── Inject into translations.ts');
if (start === -1 || end === -1) {
  throw new Error('Cannot find missing dictionary block in inject_missing_translations.js');
}

const expr = injectSrc
  .slice(start + 'const missing = '.length, end)
  .trim()
  .replace(/;\s*$/, '');

const missing = vm.runInNewContext('(' + expr + ')');
const taMissing = missing.ta || {};

const taStart = ts.indexOf('\n\tta: {') !== -1 ? ts.indexOf('\n\tta: {') + 1 : ts.indexOf('\nta: {') + 1;
if (taStart <= 0) throw new Error('ta block start not found');

const afterTaStart = ts.indexOf('{', taStart) + 1;
const mlStart = ts.indexOf('\n\tml: {', afterTaStart) !== -1 ? ts.indexOf('\n\tml: {', afterTaStart) : ts.indexOf('\nml: {', afterTaStart);
if (mlStart === -1) throw new Error('ml block start not found');

const taBlock = ts.slice(taStart, mlStart);
const existing = new Set();
for (const m of taBlock.matchAll(/"([^"]+)"\s*:/g)) {
  existing.add(m[1]);
}

const lines = [];
for (const [k, v] of Object.entries(taMissing)) {
  if (!existing.has(k)) {
    lines.push(`\t\t${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  }
}

if (lines.length === 0) {
  console.log('No new Tamil keys to add.');
  process.exit(0);
}

const insertPos = taBlock.lastIndexOf('\n\t},');
if (insertPos === -1) throw new Error('Could not find ta block closing');

const taAbsoluteInsert = taStart + insertPos;
const updated = ts.slice(0, taAbsoluteInsert) + '\n\t\t// Added missing Tamil UI keys\n' + lines.join('\n') + ts.slice(taAbsoluteInsert);

fs.writeFileSync(tsPath, updated, 'utf8');
console.log(`Added ${lines.length} Tamil translations.`);
