import CropDiseaseDetailsScreen, {
    type DiseaseDetailsItem,
    type DiseaseDetailsSection,
} from '@/components/CropDiseaseDetailsScreen';

const redgram: DiseaseDetailsItem[] = [
  {
    name: 'Wilt (Redgram)',
    organism: 'Fusarium oxysporum f.sp. udum',
    symptoms: [
      'Yellowing and drooping of leaves followed by plant death.',
      'Vascular tissues inside the stem show black or dark-brown streaks.',
      'When split, stem base shows dark ring.',
    ],
    treatment: [
      'Seed treatment: Trichoderma viride or Pseudomonas fluorescens @ 4 g/kg of seed.',
      'Soil application: P. fluorescens @ 2.5 kg/ha mixed with 50 kg FYM.',
    ],
    how: ['Treat seeds before sowing.', 'Apply biocontrol agents to soil before planting.', 'Follow crop rotation; avoid redgram monocropping.'],
  },
  {
    name: 'Powdery Mildew (Redgram)',
    organism: 'Leveillula taurica',
    symptoms: ['White powdery patches appear on both leaf surfaces.', 'Infected leaves turn yellow, curl, and fall off prematurely.'],
    treatment: ['Wettable Sulphur @ 2 g/litre or Carbendazim @ 1 g/litre.'],
    how: ['Spray at first appearance of the disease.', 'Repeat the spray after 10–15 days if necessary.'],
  },
  {
    name: 'Leaf Spot (Redgram)',
    organism: 'Cercospora indica',
    symptoms: ['Small circular brown lesions with yellow halo on leaves.', 'Severe infection causes defoliation.'],
    treatment: ['Mancozeb @ 2 g/litre or Carbendazim @ 1 g/litre.'],
    how: ['Spray twice at 15-day intervals at symptom onset.'],
  },
  {
    name: 'Sterility Mosaic Disease (SMD)',
    organism: 'Pigeonpea Sterility Mosaic Virus',
    symptoms: [
      'Plants remain green and bushy with small pale leaves.',
      'Complete sterility occurs with no pod formation.',
      'Transmitted by eriophyid mite (Aceria cajani).',
    ],
    treatment: ['Chemical: Fenazaquin 1 ml/litre or Dicofol 2 ml/litre.'],
    how: ['Spray at 45 and 60 days after sowing to manage mite vector.', 'Rogue and destroy infected plants early.'],
  },
];

const chickpea: DiseaseDetailsItem[] = [
  {
    name: 'Blight (Chickpea)',
    organism: 'Ascochyta rabiei',
    symptoms: [
      'Brown circular spots with dark margins appear on leaves, stems, and pods.',
      'Tiny black pycnidia visible on lesions; leads to drying of plants.',
    ],
    treatment: [
      'Seed treatment: Trichoderma viride or Pseudomonas fluorescens @ 4 g/kg or Carbendazim @ 2 g/kg.',
      'Spray: Chlorothalonil @ 1 kg/ha or Carbendazim @ 500 g/ha.',
    ],
    how: ['Treat seeds before sowing.', 'Spray fungicide at first disease appearance.', 'Remove infected debris and avoid repeated cropping.'],
  },
  {
    name: 'Rust (Chickpea)',
    organism: 'Uromyces ciceris-arietini',
    symptoms: [
      'Orange pustules (uredosori) develop on leaves and stems, turning black later.',
      'Causes premature defoliation and poor pod filling.',
    ],
    treatment: ['Mancozeb @ 2 g/litre or Wettable Sulphur @ 2 g/litre.'],
    how: ['Spray at first sign of rust and repeat every 15 days if needed.'],
  },
  {
    name: 'Wilt (Chickpea)',
    organism: 'Fusarium oxysporum f.sp. ciceris',
    symptoms: ['Leaves yellow and dry from the bottom upward.', 'Brown discolouration occurs in stem and tap root.'],
    treatment: ['Seed treatment: Trichoderma viride or Pseudomonas fluorescens @ 4 g/kg of seed.'],
    how: ['Treat seed before sowing.', 'Avoid monocropping and enhance soil organic matter.'],
  },
];

const blackgramGreengram: DiseaseDetailsItem[] = [
  {
    name: 'Root Rot (Blackgram & Greengram)',
    organism: 'Rhizoctonia bataticola',
    symptoms: ['Leaves yellow and dry prematurely.', 'Roots turn black, decayed, and plants wilt.'],
    treatment: [
      'Seed treatment: Trichoderma viride @ 4 g/kg or Pseudomonas fluorescens @ 10 g/kg.',
      'Soil application: P. fluorescens or T. viride @ 2.5 kg/ha with FYM.',
    ],
    how: ['Treat seeds before sowing and mix bioagents with soil before planting.'],
  },
  {
    name: 'Powdery Mildew (Blackgram & Greengram)',
    organism: 'Erysiphe polygoni',
    symptoms: [
      'White powdery growth on both sides of leaves, stems, and pods.',
      'Leads to yellowing and drying of leaves.',
    ],
    treatment: ['Wettable Sulphur @ 2 g/litre or Carbendazim @ 1 g/litre.'],
    how: ['Spray on first appearance.', 'Repeat spray after 10–15 days if required.'],
  },
  {
    name: 'Leaf Spot (Blackgram & Greengram)',
    organism: 'Cercospora canescens',
    symptoms: [
      'Brown circular or irregular spots with yellow border on leaves.',
      'Spots coalesce into large necrotic patches causing leaf drop.',
    ],
    treatment: ['Mancozeb @ 2 g/litre or Carbendazim @ 1 g/litre.'],
    how: ['Spray twice at 15-day intervals after noticing symptoms.'],
  },
  {
    name: 'Rust (Blackgram & Greengram)',
    organism: 'Uromyces phaseoli typica',
    symptoms: ['Small, round, reddish-brown pustules on leaves and pods.', 'Leads to drying and defoliation of leaves.'],
    treatment: ['Wettable Sulphur @ 2 g/litre.'],
    how: ['Spray twice at 10-day intervals after first appearance.'],
  },
  {
    name: 'Yellow Mosaic Virus (YMV)',
    organism: 'Mungbean Yellow Mosaic Virus (MYMV)',
    symptoms: [
      'Yellow patches appear on leaves, which enlarge and cover the entire leaf area.',
      'Plants become stunted with reduced pod formation.',
      'Transmitted by whitefly (Bemisia tabaci).',
    ],
    treatment: [
      'Resistant varieties: VBN 4, VBN 6, and VBN 7.',
      'Insecticides: Imidacloprid 17.8 SL @ 100 ml/ha or Dimethoate 30 EC @ 500 ml/ha.',
    ],
    how: [
      'Rogue infected plants early.',
      'Use yellow sticky traps in the field.',
      'Spray insecticides at 20 and 40 DAS to manage vector population.',
    ],
  },
  {
    name: 'Leaf Crinkle (Urdbean)',
    organism: 'Urdbean Leaf Crinkle Virus (ULCV)',
    symptoms: [
      'Leaves become enlarged, twisted, thick, and leathery.',
      'Flowers malformed and yield reduced due to poor pod set.',
    ],
    treatment: ['Cultural practices: Early removal of infected plants and vector control.'],
    how: ['Use virus-free seeds and resistant varieties.', 'Spray Dimethoate or Imidacloprid to control vectors.'],
  },
];

const sections: DiseaseDetailsSection[] = [
  { title: 'Redgram (Pigeonpea)', items: redgram },
  { title: 'Bengalgram (Chickpea)', items: chickpea },
  { title: 'Blackgram & Greengram', items: blackgramGreengram },
];

export default function PulsesDisease() {
  return <CropDiseaseDetailsScreen title="Pulses Diseases" sections={sections} backTo="/diseases-diagnosis" />;
}
