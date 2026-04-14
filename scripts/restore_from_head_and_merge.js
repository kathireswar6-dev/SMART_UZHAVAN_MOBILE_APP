const fs = require('fs');
const vm = require('vm');

function parseTsObject(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const start = src.indexOf('export const translations');
  const open = src.indexOf('{', start);
  const end = src.lastIndexOf('};');
  if (start === -1 || open === -1 || end === -1) {
    throw new Error('Could not parse translations object in ' + filePath);
  }
  return vm.runInNewContext('(' + src.slice(open, end + 1) + ')');
}

const current = parseTsObject('context/translations.ts');
const head = parseTsObject('scripts/translations_from_head.ts');

const langs = ['en', 'ta', 'ml', 'kn', 'te', 'hi'];
for (const lang of langs) {
  current[lang] = current[lang] || {};
  head[lang] = head[lang] || {};
}

for (const lang of ['ta','ml','kn','te','hi']) {
  for (const [k, v] of Object.entries(head[lang])) {
    if (!(k in current[lang])) {
      current[lang][k] = v;
    }
  }
}

for (const lang of ['ta','ml','kn','te','hi']) {
  for (const k of Object.keys(current[lang])) {
    if (!(k in current.en)) current.en[k] = k;
  }
}

const customAdd = {
  en: {
    'Diagnose crop diseases': 'Diagnose crop diseases',
    'Get crop suggestions': 'Get crop suggestions',
    'AI farming tips': 'AI farming tips',
    'Disease diagnosis': 'Disease diagnosis',
    'User': 'User',
  },
  ta: {
    'Diagnose crop diseases': 'பயிர் நோய்களை கண்டறி',
    'Get crop suggestions': 'பயிர் பரிந்துரைகளை பெறுங்கள்',
    'AI farming tips': 'AI விவசாய குறிப்புகள்',
    'Disease diagnosis': 'நோய் கண்டறிதல்',
    'User': 'பயனர்',
  },
  ml: {
    'Diagnose crop diseases': 'വിള രോഗങ്ങൾ നിർണയിക്കുക',
    'Get crop suggestions': 'വിള നിർദ്ദേശങ്ങൾ നേടുക',
    'AI farming tips': 'AI കാർഷിക നിർദ്ദേശങ്ങൾ',
    'Disease diagnosis': 'രോഗ നിർണയം',
    'User': 'ഉപയോക്താവ്',
  },
  kn: {
    'Diagnose crop diseases': 'ಫಸಲು ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ',
    'Get crop suggestions': 'ಫಸಲು ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ',
    'AI farming tips': 'AI ಕೃಷಿ ಸಲಹೆಗಳು',
    'Disease diagnosis': 'ರೋಗ ನಿರ್ಣಯ',
    'User': 'ಬಳಕೆದಾರ',
  },
  te: {
    'Diagnose crop diseases': 'పంట వ్యాధులను గుర్తించండి',
    'Get crop suggestions': 'పంట సూచనలు పొందండి',
    'AI farming tips': 'AI వ్యవసాయ సూచనలు',
    'Disease diagnosis': 'వ్యాధి నిర్ధారణ',
    'User': 'వినియోగదారు',
  },
  hi: {
    'Diagnose crop diseases': 'फसल रोग पहचानें',
    'Get crop suggestions': 'फसल सुझाव प्राप्त करें',
    'AI farming tips': 'AI खेती सुझाव',
    'Disease diagnosis': 'रोग निदान',
    'User': 'उपयोगकर्ता',
  },
};

for (const lang of langs) {
  Object.assign(current[lang], customAdd[lang] || {});
}

const lines = [];
lines.push('// Translation dictionary used by LanguageContext.');
lines.push('// Missing keys gracefully fall back to the original English string.');
lines.push('export const translations: Record<string, Record<string, string>> = {');
for (const lang of langs) {
  lines.push(`\t${lang}: {`);
  const keys = Object.keys(current[lang]).sort((a,b)=>a.localeCompare(b));
  for (const k of keys) {
    lines.push(`\t\t${JSON.stringify(k)}: ${JSON.stringify(current[lang][k])},`);
  }
  lines.push('\t},');
  lines.push('');
}
lines.push('};');
lines.push('');

fs.writeFileSync('context/translations.ts', lines.join('\n'), 'utf8');

console.log('Restored + merged translations complete.');
for (const lang of langs) {
  console.log(`${lang}: ${Object.keys(current[lang]).length}`);
}
