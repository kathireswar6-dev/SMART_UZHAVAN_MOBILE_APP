import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Downy Mildew / Green Ear',
    organism: 'Sclerospora graminicola',
    symptoms: [
      'White downy patches on the lower leaf surface; later the entire lamina turns yellow.',
      'In advanced stage, earheads are transformed into leafy green structures partially or fully.',
      'Two stages occur: Downy mildew and green ear stages.',
      'Oospores serve as the primary inoculum.',
    ],
    treatment: [
      'Seed treatment: Metalaxyl @ 6 g/kg or Thiram @ 2 g/kg of seed.',
      'Spray: Metalaxyl + Mancozeb @ 500 g/ha or Mancozeb @ 1 kg/ha.',
      'Use resistant varieties such as CO7, WCC 75, CO(Cu)9, and TNAU Cumbu Hybrid CO9.',
    ],
    how: [
      'Use disease-free and resistant seed.',
      'Transplant healthy seedlings; remove infected ones up to 45 days after sowing.',
      'Spray fungicides at 15-day intervals when symptoms appear.',
    ],
  },
  {
    name: 'Rust',
    organism: 'Puccinia penniseti',
    symptoms: [
      'Brownish-yellow pustules appear on both sides of the leaf surface.',
      'In advanced stages, black teliospores develop on leaves and sheath.',
      'Brinjal and other Solanum species act as alternate hosts.',
    ],
    treatment: ['Spray: Wettable sulphur @ 2.5 kg/ha or Mancozeb @ 1 kg/ha.'],
    how: [
      'Apply fungicide at the first sign of rust.',
      'Repeat the spray after 10 days if necessary.',
      'Avoid sowing pearl millet near brinjal crops.',
    ],
  },
  {
    name: 'Smut',
    organism: 'Tolyposporium penicillariae',
    symptoms: [
      'Some grains in the earhead are replaced by green-to-black sori (spore balls).',
      'Sori are larger than normal grains and enclose black spore masses.',
    ],
    treatment: ['Cultural: Practice crop rotation and use clean seed.'],
    how: [
      'Remove and destroy infected earheads before harvest.',
      'Avoid continuous cropping of pearl millet in the same field.',
    ],
  },
  {
    name: 'Ergot / Sugary Disease',
    organism: 'Claviceps fusiformis',
    symptoms: [
      'Pinkish sticky fluid (honeydew) oozes from infected spikelets.',
      'Spikelets become black and sticky; dark patches form on earheads.',
      'Grain formation is inhibited; ovaries replaced by black sclerotia.',
    ],
    treatment: [
      'Seed cleaning: Floatation in salt water to remove ergot sclerotia.',
      'Spray: Carbendazim 500 g/ha or Mancozeb 1 kg/ha.',
    ],
    how: [
      'Spray fungicides twice — first at 5–10% flowering and again at 50% flowering.',
      'Remove infected panicles early to reduce inoculum spread.',
    ],
  },
];

export default function PearlMilletDisease() {
  return (
    <CropDiseaseDetailsScreen
      title="Pearlmillet Diseases (Kambu)"
      items={items}
      backTo="/diseases-diagnosis"
    />
  );
}
