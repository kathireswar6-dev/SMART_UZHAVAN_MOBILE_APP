import Screen from "@/components/Screen";
import { Button } from "@/components/ui";
import { useLanguage } from "@/context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CropSuggestionScreen() {
  const { translate } = useLanguage();
  const [ui, setUi] = useState({
    back: "Back",
    title: "Crop Suggestion Assistant",
    sub: "Do you know the following soil and weather values?",
    yes: "Yes",
    no: "No",
    values: [
      "N – Nitrogen content in soil",
      "P – Phosphorous content in soil",
      "K – Potassium content in soil",
      "pH – Soil pH value",
      "Temperature – in °C",
      "Humidity – in %",
      "Rainfall – in mm",
    ],
  });

  useEffect(() => {
    (async () => {
      setUi({
        back: await translate("Back"),
        title: await translate("Crop Suggestion Assistant"),
        sub: await translate("Do you know the following soil and weather values?"),
        yes: await translate("Yes"),
        no: await translate("No"),
        values: await Promise.all([
          translate("N – Nitrogen content in soil"),
          translate("P – Phosphorous content in soil"),
          translate("K – Potassium content in soil"),
          translate("pH – Soil pH value"),
          translate("Temperature – in °C"),
          translate("Humidity – in %"),
          translate("Rainfall – in mm"),
        ]),
      });
    })();
  }, [translate]);

  return (
    <Screen title={ui.title} subtitle={ui.sub}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1b5e20" />
        <Text style={styles.backText}>{ui.back}</Text>
      </TouchableOpacity>
      
      <View style={{ width: "100%" }}>
        <View style={styles.valuesList}>
          <ScrollView contentContainerStyle={{ paddingVertical: 8 }} showsVerticalScrollIndicator={false}>
            {ui.values.map((v, i) => (
              <Text key={i} style={styles.valueItem}>• {v}</Text>
            ))}
          </ScrollView>
        </View>

        <View style={styles.btnRow}>
          <Button
            title={ui.yes}
            onPress={() => router.push("/crop-suggestion-by-values" as any)}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title={ui.no}
            onPress={() => router.push("/crop-suggestion-by-soil" as any)}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  valuesList: {
    backgroundColor: "#F8FAFB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#E1E8ED",
  },
  valueItem: { fontSize: 15, color: "#546E7A", lineHeight: 24 },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 18, gap: 12 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: '#1b5e20',
    fontWeight: '600',
  },
});
