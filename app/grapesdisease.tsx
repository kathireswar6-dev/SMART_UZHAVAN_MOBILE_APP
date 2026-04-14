import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const diseases: DiseaseDetailsItem[] = [
  {
    name: 'Downy Mildew',
    organism: 'Plasmopara viticola',
    symptoms: [
      'Yellow oil-like spots appear on upper leaf surface.',
      'White downy growth forms on lower leaf surface.',
      'Berries shrivel and drop prematurely.',
    ],
    treatment: ['Fungicides: Metalaxyl + Mancozeb 0.2% or Copper oxychloride 0.3%.'],
    how: ['Spray 3–4 times at 10-day intervals during humid weather.', 'Avoid overhead irrigation and prune infected plant parts.'],
  },
  {
    name: 'Powdery Mildew',
    organism: 'Uncinula necator',
    symptoms: ['Greyish-white powder covers both leaf surfaces and berries.', 'Leaves curl; fruits crack and dry.'],
    treatment: ['Fungicide: Wettable sulphur 0.3% or Hexaconazole 0.1%.'],
    how: [
      'First spray before flowering; repeat at fruit set and berry development stages.',
      'Maintain good air circulation in the vineyard.',
    ],
  },
  {
    name: 'Anthracnose (Bird’s Eye Spot)',
    organism: 'Elsinoë ampelina',
    symptoms: [
      'Small circular grey spots with dark margins on leaves and berries (‘bird’s-eye’ pattern).',
      'Twigs show sunken lesions that may crack.',
    ],
    treatment: ['Fungicides: Carbendazim 0.1% or Mancozeb 0.25%.'],
    how: ['Spray after pruning and again during fruit development.', 'Destroy infected pruned material.'],
  },
  {
    name: 'Bacterial Leaf Spot / Canker',
    organism: 'Xanthomonas campestris pv. viticola',
    symptoms: ['Angular water-soaked spots on leaves.', 'Stem cankers and cracking of fruits under severe infection.'],
    treatment: ['Bactericides: Streptomycin sulphate 200 ppm + Copper oxychloride 0.3%.'],
    how: ['Spray twice at 15-day intervals at early symptom stage.', 'Avoid overhead irrigation and excess nitrogen.'],
  },
];

export default function GrapesDisease() {
  return <CropDiseaseDetailsScreen title="Grapes Diseases" items={diseases} backTo="/diseases-diagnosis" />;
}
