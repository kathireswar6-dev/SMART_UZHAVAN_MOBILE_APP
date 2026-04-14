import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Anthracnose',
    organism: 'Colletotrichum gloeosporioides',
    symptoms: [
      'Brown to black spots on leaves, panicles, and fruits.',
      'Black lesions on fruits cause rotting after harvest.',
    ],
    treatment: ['Fungicides: Carbendazim 0.1%, Mancozeb 0.25%, or Thiophanate methyl 0.1%.'],
    how: [
      'Spray at flowering, fruit set, and pre-harvest stages (15-day intervals).',
      'Destroy infected leaves and panicles.',
    ],
  },
  {
    name: 'Powdery Mildew',
    organism: 'Oidium mangiferae',
    symptoms: [
      'White powdery coating on inflorescences, young leaves, and fruits.',
      'Flowers shed; fruits drop prematurely.',
    ],
    treatment: ['Fungicide: Wettable sulphur 0.3% or Carbendazim 0.1%.'],
    how: ['Spray before and after flowering (2–3 sprays at 15-day intervals).'],
  },
  {
    name: 'Bacterial Canker / Black Spot',
    organism: 'Xanthomonas campestris pv. mangiferae-indicae',
    symptoms: ['Angular, dark brown raised lesions on leaves and fruits.', 'Gummy exudation on fruits.'],
    treatment: ['Bactericide: Streptomycin sulphate 200 ppm + Copper oxychloride 0.3%.'],
    how: ['Spray 3 times — new flush, flowering, and fruit set.', 'Remove affected fruits and twigs.'],
  },
  {
    name: 'Mango Malformation',
    organism: 'Fusarium moniliforme var. subglutinans',
    symptoms: ["Abnormal flower clusters ('bunchy top'), no fruiting.", 'Vegetative shoots deformed and thick.'],
    treatment: ['Plant growth regulation: NAA 200 ppm + Carbendazim 0.1%.'],
    how: ['Prune malformed panicles and burn them.', 'Spray NAA + fungicide before flowering.'],
  },
];

export default function MangoDisease() {
  return <CropDiseaseDetailsScreen title="Mango Diseases" items={items} backTo="/diseases-diagnosis" />;
}
