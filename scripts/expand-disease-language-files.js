const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..', 'assets', 'data', 'diseases-treatment.json');
const langs = ['ta', 'te', 'ml', 'kn', 'hi'];

const langFiles = {
  ta: path.join(__dirname, '..', 'assets', 'data', 'diseases-treatment.ta.json'),
  te: path.join(__dirname, '..', 'assets', 'data', 'diseases-treatment.te.json'),
  ml: path.join(__dirname, '..', 'assets', 'data', 'diseases-treatment.ml.json'),
  kn: path.join(__dirname, '..', 'assets', 'data', 'diseases-treatment.kn.json'),
  hi: path.join(__dirname, '..', 'assets', 'data', 'diseases-treatment.hi.json'),
};

const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));

const nameMap = {
  ta: {
    'Healthy': 'ஆரோக்கியம்',
    'Diseased': 'நோயுற்றது',
    'Rust': 'ரஸ்ட்',
    'Scab': 'ஸ்காப்',
    'Mosaic': 'மொசைக்',
    'Mosaic virus': 'மொசைக் வைரஸ்',
    'Bacterial blight': 'பாக்டீரியா இலை எரிச்சல்',
    'Brown spot': 'பழுப்பு புள்ளி',
    'Powdery mildew': 'தூள் பூஞ்சை',
    'Downy mildew': 'டவுனி மில்டியூ',
    'Early blight': 'ஆரம்ப பிளைட்',
    'Late blight': 'தாமத பிளைட்',
    'Leaf blast': 'இலை பிளாஸ்ட்',
    'Neck blast': 'கழுத்து பிளாஸ்ட்',
    'Leaf blight': 'இலை கருகல்',
    'Anthracnose': 'ஆந்த்ராக்னோஸ்',
    'Whitefly': 'வெள்ளை ஈ',
    'Aphid': 'ஆபிட்',
    'Caterpillar': 'புழு',
    'Stem fly': 'தண்டு ஈ',
    'Fruit fly': 'பழ ஈ',
    'banana': 'வாழை நோய்',
    'Sunflower': 'சூரியகாந்தி',
    'Black rot': 'கருப்பு அழுகல்',
    'Yellow rust': 'மஞ்சள் ரஸ்ட்',
    'Black rust': 'கருப்பு ரஸ்ட்',
    'Brown rust': 'பழுப்பு ரஸ்ட்',
  },
  te: {
    'Healthy': 'ఆరోగ్యంగా',
    'Diseased': 'రోగగ్రస్తం',
    'Rust': 'రస్ట్',
    'Scab': 'స్క్యాబ్',
    'Mosaic': 'మొజాయిక్',
    'Mosaic virus': 'మొజాయిక్ వైరస్',
    'Bacterial blight': 'బాక్టీరియల్ బ్లైట్',
    'Brown spot': 'బ్రౌన్ స్పాట్',
    'Powdery mildew': 'పౌడరీ మిల్డ్యూ',
    'Downy mildew': 'డౌనీ మిల్డ్యూ',
    'Early blight': 'ఎర్లీ బ్లైట్',
    'Late blight': 'లేట్ బ్లైట్',
    'Leaf blast': 'ఆకు బ్లాస్ట్',
    'Neck blast': 'నెక్ బ్లాస్ట్',
    'Leaf blight': 'ఆకు బ్లైట్',
    'Anthracnose': 'ఆంత్రాక్నోస్',
    'Whitefly': 'వైట్ ఫ్లై',
    'Aphid': 'ఏఫిడ్',
    'Caterpillar': 'పిల్లిపురుగు',
    'Stem fly': 'కాండం ఈగ',
    'Fruit fly': 'పండ్ల ఈగ',
    'banana': 'అరటి వ్యాధి',
    'Sunflower': 'సూర్యకాంతి',
    'Black rot': 'బ్లాక్ రాట్',
    'Yellow rust': 'యెల్లో రస్ట్',
    'Black rust': 'బ్లాక్ రస్ట్',
    'Brown rust': 'బ్రౌన్ రస్ట్',
  },
  ml: {
    'Healthy': 'ആരോഗ്യം',
    'Diseased': 'രോഗബാധിതം',
    'Rust': 'റസ്റ്റ്',
    'Scab': 'സ്കാബ്',
    'Mosaic': 'മോസായിക്',
    'Mosaic virus': 'മോസായിക് വൈറസ്',
    'Bacterial blight': 'ബാക്ടീരിയൽ ബ്ലൈറ്റ്',
    'Brown spot': 'ബ്രൗൺ സ്പോട്ട്',
    'Powdery mildew': 'പൗഡറി മിൽഡ്യൂ',
    'Downy mildew': 'ഡൗണി മിൽഡ്യൂ',
    'Early blight': 'എർളി ബ്ലൈറ്റ്',
    'Late blight': 'ലേറ്റ് ബ്ലൈറ്റ്',
    'Leaf blast': 'ഇല ബ്ലാസ്റ്റ്',
    'Neck blast': 'നെക്ക് ബ്ലാസ്റ്റ്',
    'Leaf blight': 'ഇല ബ്ലൈറ്റ്',
    'Anthracnose': 'ആന്ത്രാക്നോസ്',
    'Whitefly': 'വൈറ്റ് ഫ്ലൈ',
    'Aphid': 'ആഫിഡ്',
    'Caterpillar': 'പുഴു',
    'Stem fly': 'തണ്ട് ഈച്ച',
    'Fruit fly': 'ഫ്രൂട്ട് ഫ്ലൈ',
    'banana': 'വാഴ രോഗം',
    'Sunflower': 'സൺഫ്ലവർ',
    'Black rot': 'ബ്ലാക്ക് റോട്',
    'Yellow rust': 'യെല്ലോ റസ്റ്റ്',
    'Black rust': 'ബ്ലാക്ക് റസ്റ്റ്',
    'Brown rust': 'ബ്രൗൺ റസ്റ്റ്',
  },
  kn: {
    'Healthy': 'ಆರೋಗ್ಯಕರ',
    'Diseased': 'ರೋಗಬಾಧಿತ',
    'Rust': 'ರಸ್ಟ್',
    'Scab': 'ಸ್ಕ್ಯಾಬ್',
    'Mosaic': 'ಮೊಸಾಯಿಕ್',
    'Mosaic virus': 'ಮೊಸಾಯಿಕ್ ವೈರಸ್',
    'Bacterial blight': 'ಬ್ಯಾಕ್ಟೀರಿಯಲ್ ಬ್ಲೈಟ್',
    'Brown spot': 'ಬ್ರೌನ್ ಸ್ಪಾಟ್',
    'Powdery mildew': 'ಪೌಡರಿ ಮಿಲ್ಡ್ಯೂ',
    'Downy mildew': 'ಡೌನಿ ಮಿಲ್ಡ್ಯೂ',
    'Early blight': 'ಅರ್ಲಿ ಬ್ಲೈಟ್',
    'Late blight': 'ಲೇಟ್ ಬ್ಲೈಟ್',
    'Leaf blast': 'ಎಲೆ ಬ್ಲಾಸ್ಟ್',
    'Neck blast': 'ನೆಕ್ ಬ್ಲಾಸ್ಟ್',
    'Leaf blight': 'ಎಲೆ ಬ್ಲೈಟ್',
    'Anthracnose': 'ಆಂತ್ರಾಕ್ನೋಸ್',
    'Whitefly': 'ವೈಟ್ ಫ್ಲೈ',
    'Aphid': 'ಆಫಿಡ್',
    'Caterpillar': 'ಹುಳು',
    'Stem fly': 'ಕಾಂಡ ಈಗೆ',
    'Fruit fly': 'ಹಣ್ಣಿನ ಈಗೆ',
    'banana': 'ಬಾಳೆ ರೋಗ',
    'Sunflower': 'ಸೂರ್ಯಕಾಂತಿ',
    'Black rot': 'ಬ್ಲ್ಯಾಕ್ ರಾಟ್',
    'Yellow rust': 'ಯೆಲ್ಲೋ ರಸ್ಟ್',
    'Black rust': 'ಬ್ಲ್ಯಾಕ್ ರಸ್ಟ್',
    'Brown rust': 'ಬ್ರೌನ್ ರಸ್ಟ್',
  },
  hi: {
    'Healthy': 'स्वस्थ',
    'Diseased': 'रोगग्रस्त',
    'Rust': 'रस्ट',
    'Scab': 'स्कैब',
    'Mosaic': 'मोज़ेक',
    'Mosaic virus': 'मोज़ेक वायरस',
    'Bacterial blight': 'बैक्टीरियल ब्लाइट',
    'Brown spot': 'भूरा धब्बा',
    'Powdery mildew': 'पाउडरी मिल्ड्यू',
    'Downy mildew': 'डाउनि मिल्ड्यू',
    'Early blight': 'अर्ली ब्लाइट',
    'Late blight': 'लेट ब्लाइट',
    'Leaf blast': 'लीफ ब्लास्ट',
    'Neck blast': 'नेक ब्लास्ट',
    'Leaf blight': 'लीफ ब्लाइट',
    'Anthracnose': 'एन्थ्रेक्नोज',
    'Whitefly': 'व्हाइटफ्लाई',
    'Aphid': 'एफिड',
    'Caterpillar': 'इल्ली',
    'Stem fly': 'स्टेम फ्लाई',
    'Fruit fly': 'फ्रूट फ्लाई',
    'banana': 'केला रोग',
    'Sunflower': 'सूरजमुखी',
    'Black rot': 'ब्लैक रॉट',
    'Yellow rust': 'येलो रस्ट',
    'Black rust': 'ब्लैक रस्ट',
    'Brown rust': 'ब्राउन रस्ट',
  },
};

function autoName(lang, diseaseKey) {
  const mapped = nameMap[lang][diseaseKey];
  if (mapped) return mapped;

  if (diseaseKey.includes('Healthy')) {
    return diseaseKey.replace('Healthy', nameMap[lang]['Healthy']);
  }
  if (diseaseKey.includes('Rust')) {
    return diseaseKey.replace('Rust', nameMap[lang]['Rust']);
  }
  if (diseaseKey.includes('blight')) {
    return diseaseKey
      .replace('Early blight', nameMap[lang]['Early blight'])
      .replace('Late blight', nameMap[lang]['Late blight'])
      .replace('Leaf blight', nameMap[lang]['Leaf blight'])
      .replace('Bacterial blight', nameMap[lang]['Bacterial blight']);
  }
  if (diseaseKey.includes('Mosaic')) {
    return diseaseKey
      .replace('Mosaic virus', nameMap[lang]['Mosaic virus'])
      .replace('Mosaic', nameMap[lang]['Mosaic']);
  }

  return undefined;
}

for (const lang of langs) {
  const existing = fs.existsSync(langFiles[lang])
    ? JSON.parse(fs.readFileSync(langFiles[lang], 'utf8'))
    : {};

  const out = {};

  for (const crop of Object.keys(base)) {
    out[crop] = out[crop] || {};
    for (const disease of Object.keys(base[crop])) {
      const existingEntry = existing?.[crop]?.[disease] || {};
      const auto = autoName(lang, disease);
      out[crop][disease] = {
        ...existingEntry,
      };

      if (!out[crop][disease]._name && auto) {
        out[crop][disease]._name = auto;
      }
    }
  }

  fs.writeFileSync(langFiles[lang], `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  console.log(`Expanded ${langFiles[lang]}`);
}
