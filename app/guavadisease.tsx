import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Wilt',
    organism: 'Fusarium oxysporum, Macrophomina phaseolina, Rhizoctonia solani',
    symptoms: [
      'Yellowing, drying, and wilting of branches.',
      'Bark near root zone cracks and peels; brown discoloration inside stem.',
      'Fruit yield drastically reduced.',
    ],
    treatment: [
      'Soil drenching: Carbendazim 0.1% or Copper oxychloride 0.25%.',
      'Biocontrol: Trichoderma viride @ 2.5 kg/ha + FYM.',
    ],
    how: [
      'Drench soil around base twice at 15-day intervals.',
      'Apply Trichoderma-enriched FYM before monsoon.',
      'Ensure good drainage and avoid root injury.',
    ],
  },
  {
    name: 'Anthracnose / Fruit Rot',
    organism: 'Colletotrichum gloeosporioides',
    symptoms: [
      'Circular sunken dark spots on fruits and leaves.',
      'Spots enlarge and merge, causing rotting of fruits.',
    ],
    treatment: ['Fungicides: Mancozeb 0.25% or Carbendazim 0.1%.'],
    how: [
      'Spray twice — at fruit set and 15 days before harvest.',
      'Collect and destroy infected fruits.',
    ],
  },
  {
    name: 'Algal Leaf Spot (Red Rust)',
    organism: 'Cephaleuros virescens',
    symptoms: [
      'Orange to rust-coloured velvety spots on leaves and twigs.',
      'Twigs become rough and cracked.',
    ],
    treatment: ['Fungicide: Copper oxychloride 0.25%.'],
    how: ['Spray twice at 15-day interval; prune infected twigs before spraying.'],
  },
  {
    name: 'Fruit Canker',
    organism: 'Pestalotiopsis psidii',
    symptoms: ['Brown corky raised lesions on fruits and leaves.', 'Fruit surface rough and unattractive.'],
    treatment: ['Fungicide: Copper oxychloride 0.3%.'],
    how: ['Spray two to three times at 15-day intervals during fruit development.'],
  },
];

export default function GuavaDisease() {
  return (
    <CropDiseaseDetailsScreen
      title="Guava Diseases"
      items={items}
      backTo="/diseases-diagnosis"
    />
  );
}
