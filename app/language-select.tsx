import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/context/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" },
  { code: "ml", label: "മലയാളം" },
  { code: "hi", label: "हिन्दी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "te", label: "తెలుగు" },
];

const confirmationCopy: Record<string, { title: string; message: string }> = {
  en: {
    title: "Continue in English?",
    message: "Do you want to continue in the selected language?",
  },
  ta: {
    title: "தமிழில் தொடரவா?",
    message: "தேர்ந்தெடுத்த மொழியில் தொடர விரும்புகிறீர்களா?",
  },
  ml: {
    title: "മലയാളത്തിൽ തുടരണമോ?",
    message: "തിരഞ്ഞെടുത്ത ഭാഷയിൽ തുടരാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?",
  },
  hi: {
    title: "क्या हिन्दी में जारी रखना है?",
    message: "क्या आप चुनी हुई भाषा में जारी रखना चाहते हैं?",
  },
  kn: {
    title: "ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರೆಯಬೇಕೆ?",
    message: "ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಭಾಷೆಯಲ್ಲಿ ಮುಂದುವರೆಯಲು ಬಯಸುವಿರಾ?",
  },
  te: {
    title: "తెలుగులో కొనసాగాలా?",
    message: "మీరు ఎంచుకున్న భాషలో కొనసాగాలనుకుంటున్నారా?",
  },
};

function translateForLanguage(code: string, text: string) {
  if (code === "en") return text;
  return translations[code]?.[text] || text;
}

export default function LanguageSelectScreen() {
  const { translate, setLanguage } = useLanguage();
  const [ui, setUi] = React.useState({
    title: "SMART UZHAVAN",
    subtitle: "Advanced AI-Powered Farming Assistant",
    selectLanguage: "Select Language",
  });

  React.useEffect(() => {
    (async () => {
      setUi({
        title: await translate("SMART UZHAVAN"),
        subtitle: await translate("Advanced AI-Powered Farming Assistant"),
        selectLanguage: await translate("Select Language"),
      });
    })();
  }, [translate]);

  const handleSelect = async (code: string) => {
    const copy = confirmationCopy[code] || confirmationCopy.en;
    const yesText = translateForLanguage(code, "Yes");
    const noText = translateForLanguage(code, "No");

    Alert.alert(copy.title, copy.message, [
      {
        text: noText,
        style: "cancel",
      },
      {
        text: yesText,
        onPress: async () => {
          try {
            await AsyncStorage.setItem("preferredLanguage", code);
            await setLanguage(code);
            await AsyncStorage.setItem("hasSeenOnboarding", "true");
            const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
            if (isLoggedIn === "true") {
              router.replace({ pathname: "/home", params: { lang: code } });
            } else {
              router.replace({ pathname: "/login", params: { lang: code } });
            }
          } catch (err) {
            console.warn("Failed to store language selection", err);
            const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
            if (isLoggedIn === "true") {
              router.replace("/home");
            } else {
              router.replace("/login");
            }
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../assets/images/applogo.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>{ui.title}</Text>
        <Text style={styles.subtitle}>{ui.subtitle}</Text>

        <Text style={styles.languageTitle}>{ui.selectLanguage}</Text>

        <View style={styles.buttonContainer}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={styles.langButton}
              onPress={() => handleSelect(lang.code)}
            >
              <Text style={styles.langText}>{lang.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#6B9E4A",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.25,
    marginBottom: 12,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 28,
    width: "95%",
    lineHeight: 15,
  },
  languageTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    width: "94%",
    maxWidth: 520,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 5,
  },
  langButton: {
    width: "100%",
    backgroundColor: "#F0F7EE",
    paddingVertical: 14,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#6B9E4A",
  },
  langText: {
    color: "#6B9E4A",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});
