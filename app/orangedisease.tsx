import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Citrus Canker',
    organism: 'Xanthomonas axonopodis pv. citri',
    symptoms: [
      'Brown, raised, corky lesions with yellow halo on leaves, fruits, and stems.',
      'Severe infection causes leaf drop and blemished fruits.',
    ],
    treatment: ['Bactericides: Copper oxychloride 0.3% + Streptomycin 200 ppm.'],
    how: [
      'Spray at new flush, flowering, and fruit set stages (3 sprays in total).',
      'Remove infected twigs; always disinfect pruning tools.',
    ],
  },
  {
    name: 'Gummosis / Phytophthora Foot Rot',
    organism: 'Phytophthora palmivora / P. nicotianae',
    symptoms: ['Bark at tree base cracks and oozes gum.', 'Leaves turn yellow and drop; roots may decay.'],
    treatment: ['Fungicides: Metalaxyl 0.2% or Bordeaux paste (1:1:10).'],
    how: [
      'Scrape affected bark and apply Bordeaux paste.',
      'Drench soil near trunk with Metalaxyl 0.2% twice at 15-day intervals.',
    ],
  },
  {
    name: 'Citrus Greening (Huanglongbing)',
    organism: 'Candidatus Liberibacter asiaticus',
    symptoms: ['Yellow mottling of leaves; small, lopsided fruits.', 'Premature fruit drop and twig dieback.'],
    treatment: ['Vector control: Imidacloprid 0.05% or Thiamethoxam 0.03%.'],
    how: [
      'Spray every 15–20 days during new flush to control psyllid vector.',
      'Remove and destroy infected trees.',
      'Use disease-free budded seedlings for planting.',
    ],
  },
  {
    name: 'Sooty Mold',
    organism: 'Capnodium citri (associated with aphid/scales honeydew)',
    symptoms: ['Black sooty coating forms on leaves and fruits.', 'Reduces photosynthesis and fruit quality.'],
    treatment: ['Insecticides: Imidacloprid 0.05% or Neem oil 3%.'],
    how: [
      'Spray insecticide to kill honeydew-producing insects.',
      'Wash leaves with water or mild soap solution if needed.',
    ],
  },
];

export default function OrangeDisease() {
  return <CropDiseaseDetailsScreen title="Orange Diseases" items={items} backTo="/diseases-diagnosis" />;
}
