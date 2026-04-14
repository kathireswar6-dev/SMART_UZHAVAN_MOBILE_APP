import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const diseases: DiseaseDetailsItem[] = [
  {
    name: 'Panama Wilt (Fusarium Wilt)',
    organism: 'Fusarium oxysporum f.sp. cubense',
    symptoms: [
      'Yellowing of lower leaves, progressively moving upward.',
      'Leaves collapse along the midrib, forming a skirt-like appearance.',
      'Internal vascular tissues of pseudostem turn brown.',
      'Affected plants yield small, deformed bunches or none.',
    ],
    treatment: [
      'Fungicides: Carbendazim 0.1% or Tridemorph 0.1%.',
      'Biocontrol: Trichoderma viride @ 10 g/plant or Pseudomonas fluorescens @ 10 g/plant.',
    ],
    how: [
      'Drench soil near rhizome with Carbendazim 0.1%.',
      'Apply Trichoderma-enriched FYM (1 kg FYM + 10 g Trichoderma) around plant base.',
      'Avoid water stagnation and rotate with non-host crops (e.g. paddy, maize).',
    ],
  },
  {
    name: 'Sigatoka Leaf Spot (Yellow Leaf Spot / Leaf Blotch)',
    organism: 'Mycosphaerella musicola / Pseudocercospora musae',
    symptoms: [
      'Small yellow streaks enlarge into brown spots with grey centre.',
      'Lesions merge, drying leaves prematurely.',
      'Severe infection leads to reduced bunch size and poor fruit quality.',
    ],
    treatment: ['Fungicides: Mancozeb 0.25%, Propiconazole 0.1%, Chlorothalonil 0.2%.'],
    how: [
      'Spray at appearance of symptoms; repeat every 15–20 days.',
      'Remove and destroy affected leaves before spraying.',
      'Use disease-free suckers for new plantings.',
    ],
  },
  {
    name: 'Bunchy Top Disease (BBTV)',
    organism: 'Banana bunchy top virus (BBTV)',
    symptoms: [
      'Plants stay stunted with narrow, erect, bunchy leaves.',
      'Dark green streaks show on petioles and midribs.',
      'Bunch becomes very small, malformed or absent.',
    ],
    treatment: ['Vector control: Apply Dimethoate 2 ml/litre or Imidacloprid 0.05%.'],
    how: [
      'Rogue and destroy infected plants promptly.',
      'Regular sprays of insecticide at 15-day intervals to control aphids.',
      'Use virus-free tissue-cultured planting material.',
    ],
  },
  {
    name: 'Banana Mosaic',
    organism: 'Cucumber Mosaic Virus (CMV)',
    symptoms: [
      'Distinct light and dark green mosaic patterns on leaves.',
      'Stunted growth, twisted leaf margins, and deformed bunches.',
    ],
    treatment: ['Vector control: Imidacloprid 0.05%, Thiamethoxam 0.03%.'],
    how: [
      'Spray insecticide every 10–15 days; remove infected plants immediately.',
      'Avoid intercropping banana with cucurbits or other virus hosts.',
    ],
  },
];

export default function BananaDisease() {
  return <CropDiseaseDetailsScreen title="Banana Diseases" items={diseases} backTo="/diseases-diagnosis" />;
}
