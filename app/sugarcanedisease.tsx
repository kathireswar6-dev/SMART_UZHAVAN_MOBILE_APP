import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Red Rot',
    organism: 'Colletotrichum falcatum',
    symptoms: [
      'Red discolouration of internal tissues interspersed with white patches across the nodes.',
      'Top leaves dry out and stalks may bend or lodge.',
      'Affected parts emit a sour smell.',
    ],
    treatment: ['Sett treatment: Carbendazim @ 0.1% for 15 min or hot water at 50°C for 30 min.'],
    how: [
      'Plant only healthy setts; use resistant varieties (e.g. Co 86249, CoSi 95071).',
      'Do not ratoon fields where disease is present.',
    ],
  },
  {
    name: 'Sett Rot (Pineapple Disease)',
    organism: 'Ceratocystis paradoxa',
    symptoms: [
      'Setts fail to sprout; buds rot and turn black.',
      'Internal tissues exhibit pineapple-like odor and discoloration.',
    ],
    treatment: ['Sett treatment: Carbendazim @ 0.05–0.1% for 15 min.'],
    how: ['Immediately plant fresh, healthy setts following treatment.'],
  },
  {
    name: 'Whip Smut',
    organism: 'Ustilago scitaminea',
    symptoms: [
      'Whip-like black structure emerges from top of young shoots.',
      'Infected plants produce thin canes and grassy tillers; stunted growth.',
    ],
    treatment: ['Sett treatment: Hot water at 52°C for 30 min or aerated steam at 52°C for 1 hr.'],
    how: ['Remove and burn infected clumps.', 'Use resistant sugarcane varieties.'],
  },
  {
    name: 'Mosaic',
    organism: 'Sugarcane Mosaic Virus (SCMV)',
    symptoms: ['Leaves display alternate patches of green and yellow (mosaic patterns).', 'Plant growth is stunted and yields decrease.'],
    treatment: ['Early rogueing of infected plants.', 'Control aphid vectors.'],
    how: ['Use disease-free planting material.', 'Maintain a weed-free field.'],
  },
  {
    name: 'Grassy Shoot Disease (GSD)',
    organism: 'Candidatus Phytoplasma',
    symptoms: [
      'Thin, grassy, pale green shoots grow from the base of the plant.',
      'No cane formation; affected plants remain sterile.',
    ],
    treatment: ['Sett treatment: Hot water at 50°C for 30 min.'],
    how: ['Use healthy seed setts.', 'Rogue and destroy affected clumps early.'],
  },
  {
    name: 'Phanerogamic Parasite (Striga)',
    organism: 'Striga asiatica',
    symptoms: [
      'Purple-flowered parasitic weed attaches to cane roots.',
      'Sugarcane growth is stunted due to nutrient drain by the weed.',
    ],
    treatment: ['Herbicide: Fernoxone (2,4-D) @ 450 g per 500 litres of water.'],
    how: ['Spray over infested cane area.', 'Rotate with non-host crops such as rice.'],
  },
];

export default function SugarcaneDisease() {
  return <CropDiseaseDetailsScreen title="Sugarcane Diseases" items={items} backTo="/diseases-diagnosis" />;
}
