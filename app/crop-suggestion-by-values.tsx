import { useLoader } from "@/components/Loader";
import Screen from "@/components/Screen";
import { Button, Input } from "@/components/ui";
import { useLanguage } from "@/context/LanguageContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { recommendCrop } from "./api";

export default function CropSuggestionByValuesScreen() {
  const { translate } = useLanguage();
  const { show, hide } = useLoader();
  const [form, setForm] = useState({
    N: "",
    P: "",
    K: "",
    ph: "",
    temperature: "",
    humidity: "",
    rainfall: "",
  });

  const [ui, setUi] = useState({
    title: "Enter the soil values",
    n: "N (Nitrogen content):",
    p: "P (Phosphorous content):",
    k: "K (Potassium content):",
    ph: "pH (Soil pH value):",
    temp: "Temperature (°C):",
    humidity: "Humidity (%):",
    rainfall: "Rainfall (mm):",
    getSuggestion: "Get Suggestion",
    incompleteData: "Incomplete Data",
    fillAllValues: "Please fill in all values before proceeding.",
  });

  useEffect(() => {
    (async () => {
      setUi({
        title: await translate("Enter the soil values"),
        n: await translate("N (Nitrogen content):"),
        p: await translate("P (Phosphorous content):"),
        k: await translate("K (Potassium content):"),
        ph: await translate("pH (Soil pH value):"),
        temp: await translate("Temperature (°C):"),
        humidity: await translate("Humidity (%):"),
        rainfall: await translate("Rainfall (mm):"),
        getSuggestion: await translate("Get Suggestion"),
        incompleteData: await translate("Incomplete Data"),
        fillAllValues: await translate("Please fill in all values before proceeding."),
      });
    })();
  }, [translate]);

  const handleChange = (key: string, value: string) => setForm((s) => ({ ...s, [key]: value }));

  const handleSubmit = async () => {
    if (!form.N || !form.P || !form.K || !form.ph || !form.temperature || !form.humidity || !form.rainfall) {
      Alert.alert(ui.incompleteData, ui.fillAllValues);
      return;
    }

    try {
      show();
      const payload = {
        N: parseFloat(form.N),
        P: parseFloat(form.P),
        K: parseFloat(form.K),
        ph: parseFloat(form.ph),
        temperature: parseFloat(form.temperature),
        humidity: parseFloat(form.humidity),
        rainfall: parseFloat(form.rainfall),
      };

      console.log('Sending payload:', payload);

      // Send to backend for crop suggestion
      const result = await recommendCrop(payload);

      console.log('Crop suggestion result:', result);

      if (result.error) {
        Alert.alert(await translate('Error'), await translate(result.error));
        return;
      }

      // Pass result to suggestion-result page
      const resultString = JSON.stringify(result);
      const formDataString = JSON.stringify(payload);
      
      console.log('Navigating with result:', resultString);
      console.log('Form data:', formDataString);

      router.push({
        pathname: '/suggestion-result',
        params: {
          result: resultString,
          formData: formDataString,
        },
      } as any);
    } catch (error) {
      console.error('Error getting crop suggestion:', error);
      Alert.alert(await translate('Error'), `${await translate('Failed to get response')}: ${error}`);
    } finally {
      hide();
    }
  };

  return (
    <Screen title={ui.title}>
      <KeyboardAvoidingView style={{ width: "100%" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: 6 }}>
          <Input placeholder={ui.n} keyboardType="numeric" value={form.N} onChangeText={(t) => handleChange("N", t)} />
          <Input placeholder={ui.p} keyboardType="numeric" value={form.P} onChangeText={(t) => handleChange("P", t)} />
          <Input placeholder={ui.k} keyboardType="numeric" value={form.K} onChangeText={(t) => handleChange("K", t)} />
          <Input placeholder={ui.ph} keyboardType="decimal-pad" value={form.ph} onChangeText={(t) => handleChange("ph", t)} />
          <Input placeholder={ui.temp} keyboardType="decimal-pad" value={form.temperature} onChangeText={(t) => handleChange("temperature", t)} />
          <Input placeholder={ui.humidity} keyboardType="decimal-pad" value={form.humidity} onChangeText={(t) => handleChange("humidity", t)} />
          <Input placeholder={ui.rainfall} keyboardType="decimal-pad" value={form.rainfall} onChangeText={(t) => handleChange("rainfall", t)} />

          <Button title={ui.getSuggestion} onPress={handleSubmit} style={{ marginTop: 12 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// no local styles required for this screen
