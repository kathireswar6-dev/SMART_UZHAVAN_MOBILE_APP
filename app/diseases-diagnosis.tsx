import { useLanguage } from "@/context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const crops = [
  { name: "Rice", img: require("../assets/images/croplogo/rice.jpg"), route: "/ricedisease" },
  { name: "Pearl Millet (Cumbu)", img: require("../assets/images/croplogo/pearmillet.jpg"), route: "/pearlmilletdisease" },
  { name: "Finger Millet (Ragi)", img: require("../assets/images/croplogo/finger-millet.jpg"), route: "/fingermilletdisease" },
  { name: "Maize", img: require("../assets/images/croplogo/maizeq.jpg"), route: "/maizedisease" },
  { name: "Pulses", img: require("../assets/images/croplogo/pulses.jpg"), route: "/pulsesdisease" },
  { name: "Cotton", img: require("../assets/images/croplogo/cotton.jpg"), route: "/cottondisease" },
  { name: "Sugarcane", img: require("../assets/images/croplogo/sugar.jpg"), route: "/sugarcanedisease" },
  { name: "Oilseeds", img: require("../assets/images/croplogo/oil.jpg"), route: "/oilseedsdisease" },
  { name: "Banana", img: require("../assets/images/croplogo/banana1.jpg"), route: "/bananadisease" },
  { name: "Apple", img: require("../assets/images/croplogo/apple.jpg"), route: "/appledisease" },
  { name: "Orange", img: require("../assets/images/croplogo/orange.jpg"), route: "/orangedisease" },
  { name: "Guava", img: require("../assets/images/croplogo/guava.jpg"), route: "/guavadisease" },
  { name: "Pomegranate", img: require("../assets/images/croplogo/pomo.jpg"), route: "/pomagranate-disease" },
  { name: "Lemon", img: require("../assets/images/croplogo/lemon.jpg"), route: "/lemondisease" },
  { name: "Mango", img: require("../assets/images/croplogo/mango.jpg"), route: "/mangodisease" },
  { name: "Potato", img: require("../assets/images/croplogo/potato.jpg"), route: "/potatodisease" },
  { name: "Tomato", img: require("../assets/images/croplogo/tomato.jpg"), route: "/tomatodisease" },
  { name: "Watermelon", img: require("../assets/images/croplogo/water.jpg"), route: "/watermelondisease" },
  { name: "Strawberry", img: require("../assets/images/croplogo/berry.jpg"), route: "/strawberrydisease" },
  { name: "Grapes", img: require("../assets/images/croplogo/grapes.jpg"), route: "/grapesdisease" },
];

const cropNameFallbackByLanguage: Record<string, Record<string, string>> = {
  ta: {
    "Rice": "அரிசி",
    "Pearl Millet (Cumbu)": "கம்பு",
    "Finger Millet (Ragi)": "கேழ்வரகு",
    "Maize": "மக்காச்சோளம்",
    "Pulses": "பருப்பு வகைகள்",
    "Cotton": "பருத்தி",
    "Sugarcane": "கரும்பு",
    "Oilseeds": "எண்ணெய் விதைகள்",
    "Banana": "வாழை",
    "Apple": "ஆப்பிள்",
    "Orange": "ஆரஞ்சு",
    "Guava": "கொய்யா",
    "Pomegranate": "மாதுளை",
    "Lemon": "எலுமிச்சை",
    "Mango": "மாம்பழம்",
    "Potato": "உருளைக்கிழங்கு",
    "Tomato": "தக்காளி",
    "Watermelon": "தர்பூசணி",
    "Strawberry": "ஸ்ட்ராபெரி",
    "Grapes": "திராட்சை",
  },
  ml: {
    "Rice": "അരി",
    "Pearl Millet (Cumbu)": "കംബ്",
    "Finger Millet (Ragi)": "റാഗി",
    "Maize": "മക്കച്ചോളം",
    "Pulses": "പയർവർഗങ്ങൾ",
    "Cotton": "പരുത്തി",
    "Sugarcane": "കരിമ്പ്",
    "Oilseeds": "എണ്ണവിത്തുകൾ",
    "Banana": "വാഴപ്പഴം",
    "Apple": "ആപ്പിൾ",
    "Orange": "ഓറഞ്ച്",
    "Guava": "പേരയ്ക്ക",
    "Pomegranate": "മാതളനാരകം",
    "Lemon": "നാരങ്ങ",
    "Mango": "മാങ്ങ",
    "Potato": "ഉരുളക്കിഴങ്ങ്",
    "Tomato": "തക്കാളി",
    "Watermelon": "തണ്ണിമത്തൻ",
    "Strawberry": "സ്ട്രോബെറി",
    "Grapes": "മുന്തിരി",
  },
  kn: {
    "Rice": "ಅಕ್ಕಿ",
    "Pearl Millet (Cumbu)": "ಸಜ್ಜೆ",
    "Finger Millet (Ragi)": "ರಾಗಿ",
    "Maize": "ಮೆಕ್ಕೆಜೋಳ",
    "Pulses": "ಕಾಳುಗಳು",
    "Cotton": "ಹತ್ತಿ",
    "Sugarcane": "ಕಬ್ಬು",
    "Oilseeds": "ಎಣ್ಣೆಬೀಜಗಳು",
    "Banana": "ಬಾಳೆಹಣ್ಣು",
    "Apple": "ಸೇಬು",
    "Orange": "ಕಿತ್ತಳೆ",
    "Guava": "ಸೀಬೆಹಣ್ಣು",
    "Pomegranate": "ದಾಳಿಂಬೆ",
    "Lemon": "ನಿಂಬೆ",
    "Mango": "ಮಾವು",
    "Potato": "ಆಲೂಗಡ್ಡೆ",
    "Tomato": "ಟೊಮೇಟೊ",
    "Watermelon": "ಕಲ್ಲಂಗಡಿ",
    "Strawberry": "ಸ್ಟ್ರಾಬೆರಿ",
    "Grapes": "ದ್ರಾಕ್ಷಿ",
  },
  te: {
    "Rice": "బియ్యం",
    "Pearl Millet (Cumbu)": "సజ్జలు",
    "Finger Millet (Ragi)": "రాగి",
    "Maize": "మొక్కజొన్న",
    "Pulses": "పప్పుధాన్యాలు",
    "Cotton": "పత్తి",
    "Sugarcane": "చెరకు",
    "Oilseeds": "నూనె గింజలు",
    "Banana": "అరటి",
    "Apple": "ఆపిల్",
    "Orange": "నారింజ",
    "Guava": "జామ",
    "Pomegranate": "దానిమ్మ",
    "Lemon": "నిమ్మకాయ",
    "Mango": "మామిడి",
    "Potato": "బంగాళాదుంప",
    "Tomato": "టమాటా",
    "Watermelon": "పుచ్చకాయ",
    "Strawberry": "స్ట్రాబెర్రీ",
    "Grapes": "ద్రాక్ష",
  },
  hi: {
    "Rice": "चावल",
    "Pearl Millet (Cumbu)": "बाजरा",
    "Finger Millet (Ragi)": "रागी",
    "Maize": "मक्का",
    "Pulses": "दलहन",
    "Cotton": "कपास",
    "Sugarcane": "गन्ना",
    "Oilseeds": "तिलहन",
    "Banana": "केला",
    "Apple": "सेब",
    "Orange": "संतरा",
    "Guava": "अमरूद",
    "Pomegranate": "अनार",
    "Lemon": "नींबू",
    "Mango": "आम",
    "Potato": "आलू",
    "Tomato": "टमाटर",
    "Watermelon": "तरबूज",
    "Strawberry": "स्ट्रॉबेरी",
    "Grapes": "अंगूर",
  },
};

export default function DiseasesDiagnosisScreen() {
  const { translate, language } = useLanguage();
  const [ui, setUi] = useState({
    back: "Back",
    pageTitle: "Crop Diseases and Diagnosis",
    subtitle: "Select the crop",
  });
  const [translatedCropNames, setTranslatedCropNames] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const cropNameEntries = await Promise.all(
        crops.map(async (crop) => {
          const translatedName = await translate(crop.name);
          const fallbackName = cropNameFallbackByLanguage[language]?.[crop.name];
          return [crop.name, translatedName !== crop.name ? translatedName : (fallbackName || crop.name)] as const;
        })
      );

      setUi({
        back: await translate("Back"),
        pageTitle: await translate("Crop Diseases and Diagnosis"),
        subtitle: await translate("Select the crop"),
      });

      setTranslatedCropNames(Object.fromEntries(cropNameEntries));
    })();
  }, [translate, language]);

  return (
    <View style={styles.safe}>
      <View style={styles.decorativeBlobLarge} />
      <View style={styles.decorativeBlobSmall} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/")}>
          <Ionicons name="arrow-back" size={24} color="#1b5e20" />
          <Text style={styles.backText}>{ui.back}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{ui.pageTitle}</Text>
        <Text style={styles.subtitle}>{ui.subtitle}</Text>

        <View style={styles.grid}>
          {crops.map((crop) => (
            <TouchableOpacity key={crop.route} style={styles.cropCard} onPress={() => router.push(crop.route as any)}>
              <Image source={crop.img} style={styles.cropImg} resizeMode="cover" />
              <Text style={styles.cropTitle}>{translatedCropNames[crop.name] || crop.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = (width - 64) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFB' },
  container: { flexGrow: 1, alignItems: 'center', paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20 },
  decorativeBlobLarge: {
    position: 'absolute',
    top: -120,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 180,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
  },
  decorativeBlobSmall: {
    position: 'absolute',
    top: 60,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 140,
    backgroundColor: '#F1F8FF',
    opacity: 0.8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#4A6B3A', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#546E7A', marginBottom: 20, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  cropCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    width: CARD_WIDTH,
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  cropImg: { width: 110, height: 110, borderRadius: 14, marginBottom: 12, backgroundColor: '#F5F7FA' },
  cropTitle: { fontWeight: '700', color: '#4A6B3A', fontSize: 15, textAlign: 'center' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#1b5e20',
    fontWeight: '600',
  },
});
