import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Powdery Mildew',
    organism: 'Podosphaera aphanis (Sphaerotheca macularis)',
    symptoms: [
      'White powdery coating on upper leaf surface, petioles, and fruit.',
      'Leaves curl upward; fruits deform and remain small.',
    ],
    treatment: ['Fungicide: Wettable sulphur 0.3% or Hexaconazole 0.1%.'],
    how: ['Spray every 10–15 days starting before flowering.', 'Avoid overcrowded planting and high humidity.'],
  },
  {
    name: 'Grey Mould / Botrytis Rot',
    organism: 'Botrytis cinerea',
    symptoms: [
      'Brown soft rot on fruits covered with grey mould.',
      'Common in cool, humid weather; starts at the flower stage.',
    ],
    treatment: ['Fungicide: Carbendazim 0.1% or Captan 0.2%.'],
    how: ['Spray at flowering and repeat at 10-day intervals.', 'Remove and destroy infected fruits and debris.'],
  },
  {
    name: 'Leaf Spot',
    organism: 'Mycosphaerella fragariae (Ramularia tulasnei)',
    symptoms: [
      'Small circular purple spots on upper leaf surface; centres become white.',
      'Severe infection causes premature defoliation.',
    ],
    treatment: ['Fungicide: Mancozeb 0.25% or Chlorothalonil 0.2%.'],
    how: ['Spray 2–3 times during growing season at 15-day intervals.', 'Use disease-free runners.'],
  },
  {
    name: 'Verticillium Wilt',
    organism: 'Verticillium albo-atrum',
    symptoms: ['Wilting and yellowing of outer leaves.', 'Vascular browning in crown and roots.'],
    treatment: ['Soil management: Apply Trichoderma viride 2.5 kg/ha + FYM.'],
    how: ['Drench soil before planting and maintain rotation with non-host crops.'],
  },
];

export default function StrawberryDisease() {
  return (
    <CropDiseaseDetailsScreen
      title="Strawberry Diseases"
      items={items}
      backTo="/diseases-diagnosis"
    />
  );
}
