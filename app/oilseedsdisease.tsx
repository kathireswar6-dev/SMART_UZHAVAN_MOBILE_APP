import CropDiseaseDetailsScreen, {
    type DiseaseDetailsItem,
    type DiseaseDetailsSection,
} from '@/components/CropDiseaseDetailsScreen';

const groundnut: DiseaseDetailsItem[] = [
  {
    name: 'Early & Late Leaf Spot',
    organism: 'Cercospora arachidicola & Phaeoisariopsis personata',
    symptoms: [
      'Early leaf spot: Brown circular lesions with yellow halo.',
      'Late leaf spot: Blackish-brown spots on both sides of leaves.',
      'Leads to defoliation and poor pod formation.',
    ],
    treatment: [
      'Seed treatment: Thiram/Carbendazim @ 2 g/kg or Trichoderma viride @ 4 g/kg.',
      'Fungicide spray: Mancozeb/Chlorothalonil @ 1 kg/ha.',
    ],
    how: ['Spray at 30, 45, and 60 DAS; rotate fungicides.'],
  },
  {
    name: 'Rust',
    organism: 'Puccinia arachidis',
    symptoms: ['Orange-brown pustules on leaves; later turn black and powdery.', 'Premature leaf fall; yield reduction.'],
    treatment: ['Fungicide: Wettable sulphur @ 2 g/litre or Mancozeb @ 1 g/litre.'],
    how: ['Spray twice at 15-day intervals.'],
  },
  {
    name: 'Collar Rot',
    organism: 'Aspergillus niger',
    symptoms: ['Seedlings wilt at ground level; stem shows black rot at collar region.'],
    treatment: ['Seed treatment: Trichoderma viride or Pseudomonas fluorescens @ 4 g/kg.'],
    how: ['Treat seed before sowing; avoid waterlogging.'],
  },
  {
    name: 'Root Rot',
    organism: 'Macrophomina phaseolina',
    symptoms: ['Roots become dark and brittle; plant dries suddenly.'],
    treatment: ['Bioagent: P. fluorescens @ 2.5 kg/ha + FYM.'],
    how: ['Apply bioagent to soil before sowing.'],
  },
  {
    name: 'Bud Necrosis Virus',
    organism: 'Tomato Spotted Wilt Virus (thrips vector)',
    symptoms: ['Terminal buds turn necrotic; chlorotic rings on young leaves.', 'Stunted plant growth.'],
    treatment: ['Vector control: Monocrotophos @ 500 ml/ha or Imidacloprid 100 ml/ha.'],
    how: ['Rogue infected plants early and control thrips population.'],
  },
];

const sunflower: DiseaseDetailsItem[] = [
  {
    name: 'Leaf Blight',
    organism: 'Alternaria helianthi',
    symptoms: ['Brown circular spots with concentric rings; blight spreads via spot coalescence.'],
    treatment: ['Seed treatment: Trichoderma viride @ 4 g/kg or Thiram @ 4 g/kg.', 'Spray: Mancozeb @ 1 kg/ha.'],
    how: ['Spray at early stage; repeat if wet weather persists.'],
  },
  {
    name: 'Rust',
    organism: 'Puccinia helianthi',
    symptoms: ['Small reddish pustules on leaves; severe cases cause premature drying.'],
    treatment: ['Wettable sulphur 2 g/litre or Mancozeb 2 g/litre.'],
    how: ['Spray twice at 10-day intervals.'],
  },
  {
    name: 'Head Rot',
    organism: 'Rhizopus sp.',
    symptoms: ['Head rots outward from centre; black fungal growth and foul odor.'],
    treatment: ['Fungicide: Mancozeb @ 1 kg/ha.'],
    how: ['Spray at head formation stage; ensure proper drainage.'],
  },
  {
    name: 'Charcoal Rot',
    organism: 'Macrophomina phaseolina',
    symptoms: ['Dry rot of stem and roots; plant lodges and dies.'],
    treatment: ['Bioagent: T. viride or P. fluorescens @ 2.5 kg/ha + FYM.'],
    how: ['Apply bioagents to soil before sowing.'],
  },
  {
    name: 'Necrosis Virus',
    organism: 'Tobacco Streak Virus (TSV)',
    symptoms: ['Necrotic rings on leaves; tips dry; malformed heads.'],
    treatment: ['Seed treatment: Imidacloprid @ 2 g/kg.', 'Spray: Imidacloprid @ 0.05% at 30 and 45 DAS.'],
    how: ['Grow border crops (e.g. sorghum/maize) to reduce vector entry.'],
  },
];

const sesame: DiseaseDetailsItem[] = [
  {
    name: 'Root Rot',
    organism: 'Macrophomina phaseolina',
    symptoms: ['Sudden wilting; dark brown roots; shredding of bark.'],
    treatment: [
      'Seed treatment: Trichoderma viride or Pseudomonas fluorescens @ 4 g/kg.',
      'Soil application: T. viride or P. fluorescens @ 2.5 kg/ha + FYM.',
    ],
    how: ['Apply bioagents before sowing; maintain proper drainage.'],
  },
  {
    name: 'Leaf Blight',
    organism: 'Alternaria sesami',
    symptoms: ['Brown circular spots with concentric rings; severe infection causes blight.'],
    treatment: ['Mancozeb @ 1 kg/ha.'],
    how: ['Spray twice at 15-day intervals when symptoms appear.'],
  },
  {
    name: 'Powdery Mildew',
    organism: 'Erysiphe cichoracearum',
    symptoms: ['White powdery patches on leaves, stems, capsules; yellowing and leaf drop.'],
    treatment: ['Sulphur dust @ 25 kg/ha.', 'Spray: Wettable sulphur @ 2 g/litre.'],
    how: ['Apply at early symptom stage; repeat as needed.'],
  },
  {
    name: 'Phyllody',
    organism: 'Candidatus Phytoplasma',
    symptoms: ['Flowers turn into green leafy structures (phyllody); no pods; stunted bushy plants.'],
    treatment: ['Insecticide: Monocrotophos or Dimethoate @ 500 ml/ha.'],
    how: ['Rogue affected plants.', 'Intercrop sesame with redgram (6:1) to reduce vectors.'],
  },
];

const sections: DiseaseDetailsSection[] = [
  { title: 'Groundnut', items: groundnut },
  { title: 'Sunflower', items: sunflower },
  { title: 'Sesame', items: sesame },
];

export default function OilseedsDisease() {
  return (
    <CropDiseaseDetailsScreen
      title="Oilseeds Diseases"
      sections={sections}
      backTo="/diseases-diagnosis"
    />
  );
}
