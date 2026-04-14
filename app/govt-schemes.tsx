import { useLanguage } from "@/context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const centralSchemes = [
  {
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description:
      "Objective: Provide direct income support to small and marginal farmers.\nBenefit: ₹6,000 annually in three installments.\nEligibility: Farmers with ≤ 2 hectares cultivable land.\nApply: Online via PM-KISAN portal or CSC centres.",
  },
  {
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    description:
      "Objective: Crop insurance for calamities, pests, diseases.\nBenefit: Premiums – 2 % Kharif, 1.5 % Rabi, 5 % horticulture.\nEligibility: Farmers growing notified crops.\nApply: Through state agency, bank, or PMFBY portal.",
  },
  {
    name: "Kisan Credit Card (KCC) Scheme",
    description:
      "Objective: Short-term crop credit.\nBenefit: Low-interest loans, flexible repayment.\nEligibility: Crop, livestock, fisheries farmers.\nApply: Nationalized / co-operative / rural banks with ID + land records.",
  },
  {
    name: "PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)",
    description:
      "Objective: Expand irrigation & water-use efficiency.\nBenefit: Subsidy for irrigation & micro-systems.\nApply: State Agriculture or Irrigation Dept.",
  },
  {
    name: "Soil Health Card Scheme",
    description:
      "Objective: Soil testing & balanced fertilizer use.\nBenefit: Personalized soil-health cards.\nApply: State Agriculture Dept / local offices.",
  },
  {
    name: "Agriculture Infrastructure Fund (AIF)",
    description:
      "Objective: Build post-harvest infra like storage, cold chains.\nBenefit: Interest subvention + credit guarantee.\nEligibility: Farmers, FPOs, entrepreneurs.\nApply: AIF portal / designated banks.",
  },
];

const tnSchemes = [
  {
    name: "Agricultural Mechanization Scheme",
    description:
      "Objective: Boost mechanization.\nBenefit: Subsidy for tillers, transplanters, weeders; hire centres.\nApply: District Agri Office / Mechanization Wing.",
  },
  {
    name: "Chief Minister’s Farmers’ Welfare Service Centres",
    description:
      "Objective: Grass-root support.\nBenefit: Seeds, fertilizers, training.\nApply: Nearest Welfare Centre / DAO office.",
  },
  {
    name: "Horticulture Loan Scheme",
    description:
      "Objective: Promote horticulture.\nBenefit: ₹25 000–₹2 lakh per 0.4 ha; 11–12 % interest.\nApply: Primary Co-op Agri Bank / District Horticulture Office.",
  },
  {
    name: "Solar Pump Subsidy Scheme",
    description:
      "Objective: Adopt renewables.\nBenefit: Up to 70 % subsidy on solar pumps.\nApply: District Agri Office / TEDA.",
  },
  {
    name: "Uzhavar Sandhai (Farmers’ Market)",
    description:
      "Objective: Direct marketing of produce.\nBenefit: Eliminates middlemen, farmer profit.\nApply: TN Marketing Board / local Sandhai.",
  },
];

export default function GovtSchemesScreen() {
  const { translate } = useLanguage();
  const [central] = useState(centralSchemes);
  const [tn] = useState(tnSchemes);
  
  const [ui, setUi] = useState({
    mainTitle: "Government Agricultural Schemes",
    centralTitle: "🇮🇳 Central Government Schemes",
    tnTitle: "🌾 Tamil Nadu State Schemes",
    back: "Back",
  });

  React.useEffect(() => {
    (async () => {
      setUi({
        mainTitle: await translate("Government Agricultural Schemes"),
        centralTitle: `🇮🇳 ${await translate("Central Government Schemes")}`,
        tnTitle: `🌾 ${await translate("Tamil Nadu State Schemes")}`,
        back: await translate("Back"),
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
        <Text style={styles.mainTitle}>{ui.mainTitle}</Text>

        <Text style={styles.sectionTitle}>{ui.centralTitle}</Text>
        {central.map((sch, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.schemeName}>
              {i + 1}. {sch.name}
            </Text>
            <Text style={styles.desc}>{sch.description}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{ui.tnTitle}</Text>
        {tn.map((sch, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.schemeName}>
              {i + 1}. {sch.name}
            </Text>
            <Text style={styles.desc}>{sch.description}</Text>
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
    top: 40,
    left: 25,
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
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f2418",
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f6b2f",
    backgroundColor: "#eaf4ea",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginVertical: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e6eee8",
  },
  schemeName: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#1f6b2f",
    marginBottom: 6,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1b2920",
  },
});
