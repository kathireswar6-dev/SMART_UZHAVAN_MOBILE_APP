import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const diseases: DiseaseDetailsItem[] = [
  {
    name: 'Apple Scab',
    organism: 'Venturia inaequalis',
    symptoms: [
      'Olive-green velvety patches on young leaves and fruits.',
      'Fruit spots become corky, cracked, and deformed.',
      'Premature leaf fall in severe infection.',
    ],
    treatment: ['Fungicides: Mancozeb 0.25%, Captan 0.2%, or Dodine 0.06%.'],
    how: [
      'Spray first at green-tip stage.',
      'Repeat sprays at pink-bud, petal-fall, and fruit development stages (3–4 sprays total).',
    ],
  },
  {
    name: 'Powdery Mildew',
    organism: 'Podosphaera leucotricha',
    symptoms: [
      'White powdery coating on young shoots, leaves, and blossoms.',
      'Leaves curl upward and dry; fruit set is reduced.',
    ],
    treatment: ['Fungicide: Wettable sulphur 0.3% or Hexaconazole 0.1%.'],
    how: ['Spray before flowering and again after fruit set.', 'Prune and burn infected shoots during dormancy.'],
  },
  {
    name: 'Fire Blight',
    organism: 'Erwinia amylovora',
    symptoms: [
      'Blossoms and twigs turn black and appear scorched.',
      'Bacterial ooze visible on infected parts.',
      'Entire branches may wilt suddenly.',
    ],
    treatment: ['Bactericides: Streptomycin sulphate 200 ppm + Copper oxychloride 0.3%.'],
    how: ['Spray during flowering and repeat after 10 days.', 'Prune and destroy infected branches.', 'Disinfect tools with formalin.'],
  },
  {
    name: 'Bitter Rot',
    organism: 'Colletotrichum gloeosporioides',
    symptoms: [
      'Circular brown sunken lesions on fruit with concentric rings of spores.',
      'Fruit becomes shrivelled and mummified.',
    ],
    treatment: ['Fungicides: Carbendazim 0.1% or Mancozeb 0.25%.'],
    how: ['Spray twice at fruit development and pre-harvest stages.', 'Collect and destroy mummified fruits.'],
  },
];

export default function AppleDisease() {
  return <CropDiseaseDetailsScreen title="Apple Diseases" items={diseases} backTo="/diseases-diagnosis" />;
}
