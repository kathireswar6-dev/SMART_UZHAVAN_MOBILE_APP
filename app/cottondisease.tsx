import CropDiseaseDetailsScreen, { type DiseaseDetailsItem } from '@/components/CropDiseaseDetailsScreen';

const diseases: DiseaseDetailsItem[] = [
  {
    name: 'Fusarium Wilt',
    organism: 'Fusarium oxysporum f.sp. vasinfectum',
    symptoms: [
      'Yellowing of lower leaves; drooping and defoliation.',
      'Dark brown discolouration of vascular tissues.',
      'Wilting of the entire plant in field patches.',
    ],
    treatment: [
      'Seed treatment: Carboxin or Carbendazim @ 2 g/kg.',
      'Soil application: Trichoderma viride or Pseudomonas fluorescens @ 2.5 kg/ha + 50 kg FYM.',
    ],
    how: [
      'Use disease-free seeds and resistant varieties.',
      'Practice crop rotation with non-host crops.',
      'Apply biocontrol agents to soil prior to sowing.',
    ],
  },
  {
    name: 'Verticillium Wilt',
    organism: 'Verticillium dahliae',
    symptoms: [
      'Yellowing in areas between leaf veins; leaf curl and premature defoliation.',
      'Dark streaks visible in xylem when stem is split.',
      'Symptoms are more common in cooler months.',
    ],
    treatment: ['Soil application: Trichoderma viride or Pseudomonas fluorescens @ 2.5 kg/ha + FYM.'],
    how: ['Rotate crops regularly; avoid continuous cotton planting.', 'Keep the field clean and free of infected debris.'],
  },
  {
    name: 'Root Rot',
    organism: 'Rhizoctonia solani',
    symptoms: ['Sudden wilting of plants in patches.', 'Taproots turn black and become rotten.'],
    treatment: [
      'Seed treatment: Carboxin or Carbendazim @ 2 g/kg.',
      'Soil application: P. fluorescens or T. viride @ 2.5 kg/ha + FYM.',
    ],
    how: ['Ensure proper field drainage; do not over-irrigate.'],
  },
  {
    name: 'Alternaria Leaf Blight',
    organism: 'Alternaria macrospora',
    symptoms: [
      'Circular brown spots with concentric rings are visible on leaves.',
      'Severe cases lead to leaf drop and lowered yield.',
    ],
    treatment: ['Mancozeb @ 1 kg/ha or Copper oxychloride @ 1.25 kg/ha.'],
    how: ['Apply fungicide twice at 15-day intervals after symptoms appear.'],
  },
  {
    name: 'Myrothecium Leaf Spot',
    organism: 'Myrothecium roridum',
    symptoms: [
      'Irregular brownish lesions with green margins develop on leaves.',
      'Small black pycnidia appear at the lesion centers.',
    ],
    treatment: ['Copper oxychloride @ 1.25 kg/ha.'],
    how: ['Spray at initial symptom appearance; repeat after 10 days if needed.'],
  },
  {
    name: 'Areolate Mildew',
    organism: 'Ramularia areola',
    symptoms: [
      'Minute greyish-white spots appear on the underside of leaves.',
      'Yellow patches can be seen on the upper surface, causing early leaf fall.',
    ],
    treatment: ['Wettable sulphur 2 g/litre or Mancozeb 2 g/litre.'],
    how: ['Spray at early stage of infection; repeat if high humidity persists.'],
  },
  {
    name: 'Angular Leaf Spot / Black Arm',
    organism: 'Xanthomonas axonopodis pv. malvacearum',
    symptoms: [
      'Water-soaked angular lesions on leaves turn dark brown.',
      'Vein blight and black streaks are seen on stem and petiole.',
      'Bolls may rot or fall off early.',
    ],
    treatment: ['Streptomycin sulphate 100 ppm + Copper oxychloride 0.3% spray.'],
    how: ['Spray twice at 15-day intervals.', 'Use disease-free seeds and avoid mechanical damage during production.'],
  },
  {
    name: 'Boll Rot',
    organism: 'Aspergillus, Fusarium, Rhizopus, Alternaria spp.',
    symptoms: ['Bolls develop brown, soft rot; lint becomes discoloured.'],
    treatment: ['Carbendazim or Mancozeb @ 1 g/litre.'],
    how: ['Spray fungicide twice at 50% boll opening and again after 10 days.'],
  },
];

export default function CottonDisease() {
  return <CropDiseaseDetailsScreen title="Cotton Diseases" items={diseases} backTo="/diseases-diagnosis" />;
}
