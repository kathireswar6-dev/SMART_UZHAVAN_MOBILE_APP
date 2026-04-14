import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Anthracnose',
    organism: 'Colletotrichum lagenarium (C. orbiculare)',
    symptoms: [
      'Circular, sunken, dark brown to black spots on leaves, stems, and fruits.',
      'Fruit lesions enlarge, crack, and ooze pinkish spore mass.',
      'Leaves show yellowing and defoliation.',
    ],
    treatment: ['Fungicides: Mancozeb 0.25% or Carbendazim 0.1%.'],
    how: [
      'Spray 2–3 times at 15-day intervals after first symptom.',
      'Destroy infected plant debris.',
      'Use resistant varieties and follow crop rotation.',
    ],
  },
  {
    name: 'Downy Mildew',
    organism: 'Pseudoperonospora cubensis',
    symptoms: [
      'Angular yellow spots on upper leaf surface; greyish-purple mould beneath.',
      'Leaves curl, dry, and die prematurely.',
    ],
    treatment: ['Fungicides: Metalaxyl + Mancozeb 0.2% or Chlorothalonil 0.2%.'],
    how: [
      'Two sprays at 10-day intervals after first appearance.',
      'Avoid overhead irrigation during humid periods.',
    ],
  },
  {
    name: 'Fusarium Wilt',
    organism: 'Fusarium oxysporum f.sp. niveum',
    symptoms: [
      'Yellowing of leaves starting from the base.',
      'Vines wilt suddenly during fruiting.',
      'Brown vascular discoloration in stems.',
    ],
    treatment: ['Soil drenching: Carbendazim 0.1% or Trichoderma viride 2.5 kg/ha + FYM.'],
    how: [
      'Apply drench around roots twice (10 days apart).',
      'Ensure proper drainage and practice crop rotation.',
    ],
  },
  {
    name: 'Gummy Stem Blight',
    organism: 'Didymella bryoniae',
    symptoms: [
      'Brown cankers on stems exuding gummy ooze.',
      'Water-soaked leaf spots that become necrotic.',
      'Fruits rot at blossom end.',
    ],
    treatment: ['Fungicide: Chlorothalonil 0.2% or Carbendazim 0.1%.'],
    how: [
      'Spray 2–3 times at 10–15 day intervals.',
      'Remove infected vines after harvest.',
    ],
  },
];

export default function WatermelonDisease() {
  return <CropDiseaseDetailsScreen title="Watermelon Diseases" items={items} backTo="/diseases-diagnosis" />;
}
