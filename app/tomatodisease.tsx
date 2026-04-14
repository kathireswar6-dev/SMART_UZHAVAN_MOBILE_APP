import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Early Blight',
    organism: 'Alternaria solani',
    symptoms: ["Brown concentric spots ('target spots') on leaves.", 'Fruits develop sunken dark lesions.'],
    treatment: ['Fungicides: Mancozeb 0.25% or Chlorothalonil 0.2%.'],
    how: ['Spray every 10–15 days after appearance of first symptoms.'],
  },
  {
    name: 'Late Blight',
    organism: 'Phytophthora infestans',
    symptoms: [
      'Water-soaked spots turn brown; white fungal growth on leaf underside.',
      'Fruit rot may occur during storage.',
    ],
    treatment: ['Fungicides: Metalaxyl + Mancozeb 0.2% or Copper oxychloride 0.3%.'],
    how: ['Spray at early disease signs; repeat every 10 days (2–3 sprays).'],
  },
  {
    name: 'Bacterial Wilt',
    organism: 'Ralstonia solanacearum',
    symptoms: [
      'Sudden wilting of plants without yellowing.',
      'Bacterial ooze appears when stem cut is placed in water.',
    ],
    treatment: [
      'Soil drenching: Copper oxychloride 0.3% or bleaching powder @ 15 kg/ha.',
      'Biocontrol: Pseudomonas fluorescens 2.5 kg/ha.',
    ],
    how: ['Drench soil near roots twice at 10-day intervals.', 'Use resistant varieties and well-drained soil.'],
  },
  {
    name: 'Leaf Curl Virus',
    organism: 'Tomato leaf curl virus (ToLCV)',
    symptoms: [
      'Upward curling and crinkling of leaves.',
      'Plants are stunted and show little or no fruiting.',
      'Transmitted by whitefly.',
    ],
    treatment: ['Insecticides: Imidacloprid 0.05% or Thiamethoxam 0.03%.'],
    how: ['Spray every 15 days; control whiteflies early.', 'Promptly remove infected plants.'],
  },
];

export default function TomatoDisease() {
  return <CropDiseaseDetailsScreen title="Tomato Diseases" items={items} backTo="/diseases-diagnosis" />;
}
