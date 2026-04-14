import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Bacterial Blight',
    organism: 'Xanthomonas axonopodis pv. punicae',
    symptoms: [
      'Small water-soaked spots on leaves and fruits.',
      'Spots enlarge and turn brown with yellow halo.',
      'On fruits: irregular brown spots that crack open.',
    ],
    treatment: ['Bactericides: Streptomycin sulphate 200 ppm + Copper oxychloride 0.3%.'],
    how: [
      'Spray every 15 days during new flush and fruiting.',
      'Prune and burn infected twigs.',
      'Avoid overhead irrigation and maintain field sanitation.',
    ],
  },
  {
    name: 'Fruit Rot / Anthracnose',
    organism: 'Colletotrichum gloeosporioides',
    symptoms: [
      'Circular, sunken, black spots on fruits.',
      'Fruit surface shrivels and becomes unmarketable.',
      'Leaves show small necrotic patches.',
    ],
    treatment: ['Fungicides: Carbendazim 0.1% or Mancozeb 0.25%.'],
    how: ['Spray at fruit set and again 15 days before harvest.', 'Collect and destroy affected fruits.'],
  },
  {
    name: 'Wilt',
    organism: 'Fusarium oxysporum, Ceratocystis fimbriata',
    symptoms: ['Yellowing and drying of leaves from base upward.', 'Black streaks in xylem; plant wilts completely.'],
    treatment: [
      'Soil drenching: Carbendazim 0.1% or Copper oxychloride 0.25%.',
      'Biocontrol: Trichoderma viride @ 2.5 kg/ha + FYM.',
    ],
    how: ['Drench soil twice at 15-day intervals.', 'Apply Trichoderma-enriched FYM before monsoon.'],
  },
];

export default function PomegranateDisease() {
  return (
    <CropDiseaseDetailsScreen
      title="Pomogranate Diseases"
      items={items}
      backTo="/diseases-diagnosis"
    />
  );
}
