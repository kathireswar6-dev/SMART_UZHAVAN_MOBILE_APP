import { useLanguage } from "@/context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const resources = [
  {
    name: "1. Beejamrit",
    ingredients: [
      "Water: 20 Litre",
      "Cow Dung: 5 Kg",
      "Cow Urine: 5 Litre",
      "Lime: 50 gram",
      "Rhizospheric Soil: Handful",
    ],
    preparation: [
      "Wrap 5 kg desi cow dung in cotton cloth and soak in 20 litres water for 12-16 hours.",
      "Dissolve 50g lime in 1 litre water, mix both preparations, add rhizospheric soil.",
      "Add 5 litres cow urine; leave for 8-12 hours.",
    ],
    usage: [
      "Coat seeds with Beejamrit, dry well, and sow.",
      "Quick dip for leguminous seeds.",
    ],
    benefits: ["Increases seed viability, prevents seed-borne diseases."],
  },
  {
    name: "2. Jeevamrit",
    ingredients: [
      "Water: 200 Litre",
      "Cow Dung: 10 Kg",
      "Cow Urine: 10 Litre",
      "Jaggery: 2 Kg",
      "Pulse Flour: 2 Kg",
      "Rhizospheric Soil: Handful",
    ],
    preparation: ["Mix all ingredients in barrel, stir thoroughly, cover, ferment for 48 hours under shade."],
    usage: [
      "Spray with water (5-10% solution for growth/yield enhancement), or apply with irrigation.",
    ],
    benefits: ["Boosts growth, flowering, soil fertility."],
  },
  {
    name: "3. Neemastra",
    ingredients: [
      "Neem Leaves: 5 Kg",
      "Cow Urine: 5 Litre",
      "Cow Dung: 1 Kg",
      "Water: 100 Litre",
    ],
    preparation: ["Crush neem, mix all ingredients, stir, cover for 48 hours, filter."],
    usage: [
      "Spray 2-3% solution with water on crops for management of sap-sucking insects and caterpillars.",
    ],
  },
  {
    name: "4. Agniastra",
    ingredients: [
      "Neem Leaves: 5 Kg",
      "Green Chilli: 0.5 Kg",
      "Garlic: 0.5 Kg",
      "Cow Urine: 20 Litre",
    ],
    preparation: ["Crush and mix all in cow urine, boil, cool for 48 hours, filter."],
    usage: [
      "Spray 2-3% solution for trunk/stalk insects, bollworms, and caterpillars.",
    ],
  },
];

export default function FarmingResourceScreen() {
  const { translate } = useLanguage();
  const [ui, setUi] = useState({
    title: "Organic Farming Resources",
    back: "Back",
    ingredients: "Ingredients",
    preparation: "Preparation",
    howToUse: "Usage",
    benefits: "Benefits",
  });

  React.useEffect(() => {
    (async () => {
      setUi({
        title: await translate("Organic Farming Resources"),
        back: await translate("Back"),
        ingredients: await translate("Ingredients"),
        preparation: await translate("Preparation"),
        howToUse: await translate("Usage"),
        benefits: await translate("Benefits"),
      });
    })();
  }, [translate]);

  return (
    <View style={styles.root}>
      <View style={styles.blobA} />
      <View style={styles.blobB} />

      <View style={styles.topRight}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1b5e20" />
          <Text style={styles.backText}>{ui.back}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{ui.title}</Text>

        {resources.map((res, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.heading}>{res.name}</Text>

            <Text style={styles.label}>{ui.ingredients}:</Text>
            {res.ingredients.map((ing, idx) => (
              <Text key={idx} style={styles.listItem}>• {ing}</Text>
            ))}

            <Text style={styles.label}>{ui.preparation}:</Text>
            {res.preparation.map((prep, idx) => (
              <Text key={idx} style={styles.listItem}>• {prep}</Text>
            ))}

            {res.usage && (
              <>
                <Text style={styles.label}>{ui.howToUse}:</Text>
                {res.usage.map((use, idx) => (
                  <Text key={idx} style={styles.listItem}>• {use}</Text>
                ))}
              </>
            )}

            {res.benefits && (
              <>
                <Text style={styles.label}>{ui.benefits}:</Text>
                {res.benefits.map((ben, idx) => (
                  <Text key={idx} style={styles.listItem}>• {ben}</Text>
                ))}
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f8f4",
    alignItems: "center",
    justifyContent: "center",
  },
  blobA: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#cfe9d8",
    top: -40,
    left: -40,
    opacity: 0.6,
  },
  blobB: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#d7efe0",
    bottom: -50,
    right: -30,
    opacity: 0.6,
  },
  topRight: {
    position: "absolute",
    top: 36,
    left: 30,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  backText: {
    color: "#1f8a4c",
    fontWeight: "600",
    fontSize: 16,
  },
  scroll: {
    paddingTop: 90,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f2418",
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e6eee8",
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f6b2f",
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    color: "#395e3c",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1b2920",
    marginLeft: 12,
    marginBottom: 3,
    lineHeight: 21,
  },
});
