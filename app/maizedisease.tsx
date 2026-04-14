import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Downy Mildew / Crazy Top',
    organism: 'Peronosclerospora sorghi',
    symptoms: [
      'Chlorotic streaks appear on leaves; white fungal growth seen on both surfaces.',
      'Infected plants become stunted and bushy as internodes shorten.',
      'Tassel shows leafy growth and proliferation of axillary buds.',
    ],
    treatment: [
      'Seed treatment: Metalaxyl @ 3 g/kg of seed.',
      'Fungicide spray: Metalaxyl + Mancozeb @ 1 kg/ha or Mancozeb @ 1 kg/ha at 20 days after sowing.',
      'Resistant variety: TNAU Maize Hybrid CO-6.',
    ],
    how: [
      'Use resistant variety and disease-free seed.',
      'Rogue out infected plants as soon as symptoms are observed.',
      'Spray recommended fungicide at 20 days after sowing.',
    ],
  },
  {
    name: 'Rust',
    organism: 'Puccinia sorghi',
    symptoms: [
      'Brown pustules (uredosori) appear on both upper and lower leaf surfaces.',
      'Severe infection causes premature leaf drying.',
      'Alternate host: Oxalis corniculata.',
    ],
    treatment: ['Fungicide: Mancozeb @ 2–4 g/litre of water.'],
    how: [
      'Spray at the first appearance of pustules; repeat every 10 days if needed.',
      'Remove infected debris and manage field humidity.',
    ],
  },
  {
    name: 'Leaf Blight',
    organism: 'Exserohilum turcicum and Helminthosporium maydis',
    symptoms: [
      'Turcicum Leaf Blight: Oval water-soaked cigar-shaped tan lesions (3–15 cm long); severe infection may cause leaf blight.',
      'Maydis Leaf Blight: Small yellowish spots that enlarge into straw-coloured lesions with reddish-brown margins.',
    ],
    treatment: ['Fungicides: Mancozeb or Zineb @ 2–4 g/litre of water.'],
    how: [
      'Spray fungicide when symptoms first appear.',
      'Repeat applications at 10-day intervals during wet conditions.',
      'Use treated seed and follow proper crop rotation practices.',
    ],
  },
  {
    name: 'Charcoal Rot / Post-Flowering Stalk Rot (PFSR)',
    organism: 'Macrophomina phaseolina',
    symptoms: [
      'Disease appears after flowering stage.',
      'Greyish streaks develop on the stalk; pith becomes shredded with numerous black sclerotia.',
      'Plants break easily at the crown region.',
      'Roots rot and turn dark.',
    ],
    treatment: [
      'Apply bioagents: Pseudomonas fluorescens or Trichoderma viride @ 2.5 kg/ha mixed with 50 kg FYM or sand at 30 DAS.',
      'In endemic zones: Apply Potash @ 80 kg/ha.',
    ],
    how: [
      'Follow proper crop rotation to avoid buildup of inoculum.',
      'Prevent both water and nutrient stress, especially around flowering.',
      'Incorporate biocontrol agents into the soil during early growth stages.',
    ],
  },
  {
    name: 'Bacterial Stalk Rot',
    organism: 'Erwinia dissolvens',
    symptoms: [
      'Basal internodes turn soft and water-soaked, emitting a sweet fermenting smell.',
      'Leaves wilt and the plant topples over.',
      'Ears fail to develop completely.',
    ],
    treatment: ['Cultural control: Maintain proper drainage; avoid over-irrigation and mechanical injury.'],
    how: [
      'Use only healthy, treated seeds.',
      'Avoid overuse of nitrogen and ensure proper field sanitation.',
      'Destroy infected crop residues and rotate with non-host crops.',
    ],
  },
];

export default function MaizeDisease() {
  return (
    <CropDiseaseDetailsScreen
      title="Maize Diseases"
      items={items}
      backTo="/diseases-diagnosis"
    />
  );
}
