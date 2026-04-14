import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Canker',
    organism: 'Xanthomonas axonopodis pv. citri',
    symptoms: [
      'Brown raised corky lesions on leaves and fruits.',
      'Yellow halo around lesions; blemished fruits drop early.',
    ],
    treatment: ['Bactericides: Copper oxychloride 0.3% + Streptomycin 200 ppm.'],
    how: [
      'Spray 3 times — at new flush, flowering, and fruit set stages.',
      'Remove and burn affected twigs.',
    ],
  },
  {
    name: 'Gummosis / Foot Rot',
    organism: 'Phytophthora palmivora',
    symptoms: ['Gum exudation from trunk base.', 'Bark peels off, exposing wood; tree shows decline.'],
    treatment: ['Fungicide: Metalaxyl 0.2% or Bordeaux paste (1:1:10).'],
    how: [
      'Scrape diseased bark and apply Bordeaux paste.',
      'Drench soil near trunk with Metalaxyl twice, 15 days apart.',
    ],
  },
  {
    name: 'Citrus Greening (Huanglongbing)',
    organism: 'Candidatus Liberibacter asiaticus',
    symptoms: ['Yellow mottling of leaves, lopsided fruits, and fruit drop.', 'Trees are stunted and declining.'],
    treatment: ['Vector control: Imidacloprid 0.05% or Thiamethoxam 0.03%.'],
    how: ['Spray every 15–20 days during new flush.', 'Remove and destroy affected trees.'],
  },
];

export default function LemonDisease() {
  return <CropDiseaseDetailsScreen title="Lemon Diseases" items={items} backTo="/diseases-diagnosis" />;
}
