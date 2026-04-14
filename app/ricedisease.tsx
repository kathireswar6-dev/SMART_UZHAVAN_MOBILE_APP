import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Blast',
    organism: 'Magnoporthe grisea',
    symptoms: [
      'Affects leaves, nodes, neck, and culm.',
      'Spindle-shaped (eye-shaped) spots with dark brown margins and grey centres.',
      'Spots may join, causing drying.',
      'Node infection: Black necrotic lesions; stem breakage.',
      'Neck infection: Neck turns black and brittle; grains chaffy or partially filled.',
    ],
    treatment: [
      'Chemicals: Carbendazim 50 WP / Tricyclozole 75 WP / Metominostrobin 20 SC / Azoxystrobin 25 SC @ 500 g–500 ml/ha.',
      'Biological: Pseudomonas fluorescens (Pf1) – seed, root, soil, foliar applications.',
    ],
    how: [
      'Remove weed hosts; use healthy seedlings.',
      'Avoid excess nitrogen.',
      'Split nitrogen: 50% basal + 25% tillering + 25% panicle initiation.',
      'Use resistant variety CO 47.',
      'Spray chemicals at first appearance; repeat after 15 days if needed.',
    ],
  },
  {
    name: 'Brown Leaf Spot',
    organism: 'Helminthosporium oryzae (Drechslera oryzae)',
    symptoms: ['Rectangular or oval brown spots with halo.', 'On grains, brown lesions causing discoloration.'],
    treatment: ['Chemical: Metominostrobin @ 500 ml/ha.'],
    how: ['Spray fungicide when spots appear.', 'Maintain proper field sanitation.'],
  },
  {
    name: 'Sheath Rot',
    organism: 'Sarocladium oryzae',
    symptoms: [
      'Dark brown patches on flag leaf sheath.',
      'Panicle fails to emerge fully.',
      'Grains discoloured.',
      'White mycelium inside sheath.',
    ],
    treatment: [
      'Chemical: Carbendazim 500 g/ha or Metominostrobin 500 ml/ha or Hexaconazole 100 mg/litre.',
      'Botanical: Neem oil 3%, Ipomoea leaf extract 25 kg/ha, Prosopis leaf extract 25 kg/ha.',
      'Biological: Pf1 seed/root/soil/foliar.',
    ],
    how: ['Apply Gypsum 500 kg/ha (2 splits).', 'First spray at boot leaf stage; second 15 days later.'],
  },
  {
    name: 'Sheath Blight',
    organism: 'Rhizoctonia solani',
    symptoms: [
      'Oval grey-green lesions near water level; coalescing lesions cause sheath blight.',
      'Brown sclerotia on sheath or culm.',
    ],
    treatment: [
      'Chemicals: Carbendazim 500 g/ha, Azoxystrobin 500 ml/ha, Hexaconazole 100 mg/litre.',
      'Botanical: Neem oil 3%.',
      'Biological: Pf1 applications.',
    ],
    how: ['Apply Neem cake 150 kg/ha at planting.', 'Spray fungicides twice (15-day interval).'],
  },
  {
    name: 'Stem Rot',
    organism: 'Sclerotium oryzae',
    symptoms: ['Black lesions at water level.', 'Sclerotia seen; stem lodging.'],
    treatment: ['Cultural: Avoid continuous waterlogging and high nitrogen.', 'Biological: Apply Pf1 in soil 500 ml/ha.'],
    how: ['Improve drainage.', 'Maintain moderate plant spacing.'],
  },
  {
    name: 'False Smut (Lakshmi Disease)',
    organism: 'Ustilaginoidea virens',
    symptoms: ['Few grains converted to green velvety balls.', 'Glumes unaffected.'],
    treatment: ['Chemical: Propiconazole 25 EC @ 500 ml/ha or Copper hydroxide 77 WP @ 1.25 kg/ha.'],
    how: ['Spray twice — at boot leaf and 50% flowering stages.'],
  },
  {
    name: 'Grain Discolouration',
    organism: 'Helminthosporium, Curvularia, Alternaria, Fusarium',
    symptoms: ['Grains turn red/yellow/orange/pink/black.', 'Fungal growth visible on grains under humidity.'],
    treatment: ['Chemical: Mix Carbendazim + Thiram + Mancozeb (1:1:1) @ 0.2%.'],
    how: ['Spray once at 50% flowering stage.'],
  },
  {
    name: 'Bacterial Leaf Blight',
    organism: 'Xanthomonas oryzae pv. oryzae',
    symptoms: ['Water-soaked streaks from leaf tip.', 'Straw-coloured blight.', 'Bacterial ooze visible.'],
    treatment: ['Chemical: Copper hydroxide 77 WP @ 1.25 kg/ha.', 'Botanical: Cow dung extract 20%, Neem oil 3%, NSKE 5%.'],
    how: ['Two sprays at 30 and 45 days after transplanting.'],
  },
  {
    name: 'Rice Tungro Disease (RTD)',
    organism: 'Rice tungro virus',
    symptoms: ['Yellow/orange leaves.', 'Stunting.', 'Rusty spots.', 'Ill-filled grains.'],
    treatment: ['Insecticide: Carbofuran 3G @ 3.5 kg (10 DAS) or Thiamethoxam/Imidacloprid sprays.'],
    how: ['Spray at 10 and 20 DAS to control vector (green leafhopper).'],
  },
  {
    name: 'Rice Yellow Dwarf',
    organism: 'Candidatus Phytoplasma',
    symptoms: ['Pale stunted plants.', 'Excessive tillers.', 'Sterile ears.'],
    treatment: [
      'Cultural: Plough stubbles post-harvest; light traps.',
      'Insecticide: Thiamethoxam 25 WDG 100 g/ha or Imidacloprid 17.8 SL 100 ml/ha.',
    ],
    how: ['Spray twice — 15 and 30 days after transplanting.'],
  },
];

export default function RiceDisease() {
  return <CropDiseaseDetailsScreen title="Rice Diseases" items={items} backTo="/diseases-diagnosis" />;
}
