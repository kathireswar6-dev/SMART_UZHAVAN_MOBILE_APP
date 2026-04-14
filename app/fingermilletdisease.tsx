import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const diseases: DiseaseDetailsItem[] = [
  {
    name: 'Blast',
    organism: 'Pyricularia grisea',
    symptoms: [
      'Affects plants from seedling to maturity stage.',
      'Spindle-shaped spots with brown margins and grey centres appear on leaves.',
      'Nodes on stems turn black and weaken, causing breakage.',
      'Earheads show black discolouration on neck or rachis, leading to poor grain filling.',
    ],
    treatment: [
      'Edifenphos @ 500 ml/ha.',
      'Carbendazim @ 500 g/ha.',
      'Iprobenphos (IBP) @ 500 ml/ha.',
      'Aureofungin sol 100 ppm at 50% earhead emergence, followed by Mancozeb 1 kg/ha or Pseudomonas fluorescens @ 0.2%.',
    ],
    how: [
      'Apply fungicide at the first appearance of blast symptoms.',
      'Repeat two sprays during flowering at 15-day intervals for neck and finger infections.',
      'Use resistant or healthy seed and ensure proper spacing with balanced fertilizer application.',
    ],
  },
  {
    name: 'Seedling Blight / Leaf Spot',
    organism: 'Helminthosporium nodulosum',
    symptoms: [
      'Small oval or elongated brown spots appear on leaves, which later enlarge and merge.',
      'Lesions can spread to culm, sheath, neck, and panicle areas.',
    ],
    treatment: [
      'Seed treatment: Thiram 4 g/kg or Captan 4 g/kg or Carbendazim 2 g/kg or Pseudomonas fluorescens 10 g/kg.',
    ],
    how: [
      'Treat seed before sowing to prevent early infection.',
      'Maintain good field sanitation and proper plant spacing to reduce humidity and spread.',
    ],
  },
  {
    name: 'Mosaic / Mottle Streak',
    organism: 'Finger Millet Mosaic Virus / Finger Millet Mottle Streak Virus',
    symptoms: [
      'Leaves display yellow or light green chlorotic streaks.',
      'Infected plants become pale, stunted, and produce small, ill-filled earheads.',
      'The disease is transmitted by jassid (leafhopper) vectors.',
    ],
    treatment: ['Insecticides: Monocrotophos 36 WSC @ 700 ml/ha or Methyl demeton 25 EC @ 500 ml/ha.'],
    how: [
      'Remove and destroy infected plants early to prevent spread.',
      'Spray insecticides at the first symptom appearance, repeating twice at 20-day intervals to control vectors.',
      'Keep the field free from weeds and alternate hosts.',
    ],
  },
];

export default function FingerMilletDisease() {
  return <CropDiseaseDetailsScreen title="Fingermillet Diseases (Ragi)" items={diseases} backTo="/diseases-diagnosis" />;
}
