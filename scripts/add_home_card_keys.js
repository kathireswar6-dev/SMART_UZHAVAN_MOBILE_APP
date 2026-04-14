const fs = require('fs');
const path = require('path');
const vm = require('vm');

const p = path.join('context', 'translations.ts');
const text = fs.readFileSync(p, 'utf8');
const start = text.indexOf('export const translations');
const open = text.indexOf('{', start);
const end = text.lastIndexOf('};');
const obj = vm.runInNewContext('(' + text.slice(open, end + 1) + ')');

const add = {
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

for (const lang of Object.keys(add)) {
  obj[lang] = obj[lang] || {};
  Object.assign(obj[lang], add[lang]);
}

const langOrder = ['en', 'ta', 'ml', 'kn', 'te', 'hi'];
const lines = [];
lines.push('// Translation dictionary used by LanguageContext.');
lines.push('// Missing keys gracefully fall back to the original English string.');
lines.push('export const translations: Record<string, Record<string, string>> = {');
for (const lang of langOrder) {
  const dict = obj[lang] || {};
  const keys = Object.keys(dict).sort((a,b)=>a.localeCompare(b));
  lines.push(`\t${lang}: {`);
  for (const k of keys) lines.push(`\t\t${JSON.stringify(k)}: ${JSON.stringify(dict[k])},`);
  lines.push('\t},');
  lines.push('');
}
lines.push('};');
lines.push('');

fs.writeFileSync(p, lines.join('\n'), 'utf8');
console.log('Added home card subtitle/user translation keys.');
