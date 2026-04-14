import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const items: DiseaseDetailsItem[] = [
  {
    name: 'Late Blight',
    organism: 'Phytophthora infestans',
    symptoms: [
      'Water-soaked lesions on leaves and stems turning brown to black.',
      'White downy growth on underside of leaves.',
      'Tuber surface becomes dark with dry or wet rot.',
    ],
    treatment: ['Fungicides: Mancozeb 0.25% or Metalaxyl + Mancozeb 0.2%.'],
    how: ['Spray first at disease appearance; repeat every 7–10 days (3–4 sprays).'],
  },
  {
    name: 'Early Blight',
    organism: 'Alternaria solani',
    symptoms: ["Small brown spots with concentric rings ('target spot').", 'Older leaves affected first, leading to defoliation.'],
    treatment: ['Fungicides: Mancozeb 0.25% or Chlorothalonil 0.2%.'],
    how: ['Start spraying after 30 DAS; repeat every 10–15 days.'],
  },
  {
    name: 'Black Scurf / Stem Canker',
    organism: 'Rhizoctonia solani',
    symptoms: ['Black sclerotia on surface of tubers.', 'Stems develop canker-like lesions; stunted growth.'],
    treatment: ['Seed treatment: Carboxin 0.25% or Trichoderma viride 4 g/kg seed.'],
    how: ['Treat seed tubers before planting.', 'Avoid excess irrigation during early growth stages.'],
  },
  {
    name: 'Common Scab',
    organism: 'Streptomyces scabies',
    symptoms: ['Shallow to deep corky patches on tubers.', 'Tubers lose market value.'],
    treatment: ['Soil management: Maintain soil pH below 5.5; avoid alkaline soils.'],
    how: ['Apply organic manure; rotate with non-host crops.'],
  },
];

export default function PotatoDisease() {
  return <CropDiseaseDetailsScreen title="Potato Diseases" items={items} backTo="/diseases-diagnosis" />;
}
