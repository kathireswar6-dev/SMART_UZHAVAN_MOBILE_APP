import { useLoader } from "@/components/Loader";
import { useLanguage } from "@/context/LanguageContext";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { recommendCrop } from "./api";

import soilDefaults from "@/assets/data/soil_defaults.json";
import statesList from "@/assets/data/states.json";

const soilTypes = [...new Set((soilDefaults as any[]).map((s: any) => s.soilType))];

export default function SuggestionBySoilScreen() {
  const { translate } = useLanguage();
  const { show, hide } = useLoader();
  const [selectedState, setSelectedState] = useState((statesList as any[])[0].name);
  const [soilType, setSoilType] = useState(soilTypes[0]);
  const [weather, setWeather] = useState({ temperature: "", rainfall: "" });
  const [inputValues, setInputValues] = useState({
    N: "",
    P: "",
    K: "",
    ph: "",
    humidity: "",
    temperature: "",
    rainfall: "",
  });
  const [translatedStates, setTranslatedStates] = useState<Record<string, string>>({});
  const [translatedSoilTypes, setTranslatedSoilTypes] = useState<Record<string, string>>({});

  const [ui, setUi] = useState({
    formTitle: "Suggestion by Soil and State",
    state: "State",
    soilType: "Soil Type",
    nitrogen: "N (Nitrogen)",
    phosphorus: "P (Phosphorous)",
    potassium: "K (Potassium)",
    ph: "pH",
    humidity: "Humidity (%)",
    temperature: "Temperature (°C)",
    rainfall: "Rainfall (mm)",
    getSuggestion: "Get Suggestion",
    invalidValues: "Invalid Data",
    enterValidNumbers: "Please enter valid numeric values.",
  });

  useEffect(() => {
    (async () => {
      setUi({
        formTitle: await translate("Suggestion by Soil and State"),
        state: await translate("State"),
        soilType: await translate("Soil Type"),
        nitrogen: await translate("N (Nitrogen)"),
        phosphorus: await translate("P (Phosphorous)"),
        potassium: await translate("K (Potassium)"),
        ph: await translate("pH"),
        humidity: await translate("Humidity (%)"),
        temperature: await translate("Temperature (°C)"),
        rainfall: await translate("Rainfall (mm)"),
        getSuggestion: await translate("Get Suggestion"),
        invalidValues: await translate("Invalid Data"),
        enterValidNumbers: await translate("Please enter valid numeric values."),
      });

      const stateEntries = await Promise.all(
        (statesList as any[]).map(async (stateItem: any) => [stateItem.name, await translate(stateItem.name)] as const)
      );
      setTranslatedStates(Object.fromEntries(stateEntries));

      const soilEntries = await Promise.all(
        soilTypes.map(async (soil) => [soil, await translate(soil)] as const)
      );
      setTranslatedSoilTypes(Object.fromEntries(soilEntries));
    })();
  }, [translate]);

  const stateObj: any = (statesList as any[]).find((s: any) => s.name === selectedState);
  const soilVals: any = (soilDefaults as any[]).find((s: any) => s.soilType === soilType) || {};

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const hour = now.getHours();
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation&start_date=${dateStr}&end_date=${dateStr}&timezone=Asia%2FKolkata`;
      const res = await fetch(url);
      const data = await res.json();
      setWeather({
        temperature: data.hourly?.temperature_2m?.[hour]?.toString() || "",
        rainfall: data.hourly?.precipitation?.[hour]?.toString() || "",
      });
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setWeather({ temperature: "", rainfall: "" });
    }
  };

  useEffect(() => {
    if (stateObj?.lat && stateObj?.lon) fetchWeather(stateObj.lat, stateObj.lon);
  }, [stateObj?.lat, stateObj?.lon]);

  useEffect(() => {
    setInputValues({
      N: String(soilVals.N ?? ""),
      P: String(soilVals.P ?? ""),
      K: String(soilVals.K ?? ""),
      ph: String(soilVals.ph ?? ""),
      humidity: String(soilVals.humidity ?? ""),
      temperature: String(weather.temperature || soilVals.temperature || ""),
      rainfall: String(weather.rainfall || soilVals.rainfall || ""),
    });
  }, [soilType, weather.temperature, weather.rainfall]);

  const handleChange = (key: keyof typeof inputValues, value: string) => {
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      show();

      const parsed = {
        N: parseFloat(inputValues.N),
        P: parseFloat(inputValues.P),
        K: parseFloat(inputValues.K),
        ph: parseFloat(inputValues.ph),
        temperature: parseFloat(inputValues.temperature),
        humidity: parseFloat(inputValues.humidity),
        rainfall: parseFloat(inputValues.rainfall),
      };

      if (Object.values(parsed).some((v) => Number.isNaN(v))) {
        Alert.alert(ui.invalidValues, ui.enterValidNumbers);
        return;
      }

      const payload = {
        N: parsed.N,
        P: parsed.P,
        K: parsed.K,
        ph: parsed.ph,
        temperature: parsed.temperature,
        humidity: parsed.humidity,
        rainfall: parsed.rainfall,
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 18, paddingVertical: 20 }}>
        <View>
          <Text style={styles.headerTitle}>{ui.formTitle}</Text>
          <View style={styles.form}>
            <View style={styles.col}>
              <Text style={styles.label}>{ui.state}</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={selectedState} onValueChange={(val) => setSelectedState(val)}>
                  {(statesList as any[]).map((st: any) => (
                    <Picker.Item key={st.name} label={translatedStates[st.name] || st.name} value={st.name} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>{ui.soilType}</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={soilType} onValueChange={(val) => setSoilType(val)}>
                  {soilTypes.map((t: any) => (
                    <Picker.Item key={t} label={translatedSoilTypes[t] || t} value={t} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>{ui.nitrogen}</Text>
              <TextInput
                style={styles.input}
                value={inputValues.N}
                keyboardType="decimal-pad"
                onChangeText={(t) => handleChange("N", t)}
              />

              <Text style={styles.label}>{ui.phosphorus}</Text>
              <TextInput
                style={styles.input}
                value={inputValues.P}
                keyboardType="decimal-pad"
                onChangeText={(t) => handleChange("P", t)}
              />

              <Text style={styles.label}>{ui.potassium}</Text>
              <TextInput
                style={styles.input}
                value={inputValues.K}
                keyboardType="decimal-pad"
                onChangeText={(t) => handleChange("K", t)}
              />

              <Text style={styles.label}>{ui.ph}</Text>
              <TextInput
                style={styles.input}
                value={inputValues.ph}
                keyboardType="decimal-pad"
                onChangeText={(t) => handleChange("ph", t)}
              />

              <Text style={styles.label}>{ui.humidity}</Text>
              <TextInput
                style={styles.input}
                value={inputValues.humidity}
                keyboardType="decimal-pad"
                onChangeText={(t) => handleChange("humidity", t)}
              />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>{ui.temperature}</Text>
              <TextInput
                style={styles.input}
                value={inputValues.temperature}
                keyboardType="decimal-pad"
                onChangeText={(t) => handleChange("temperature", t)}
              />

              <Text style={styles.label}>{ui.rainfall}</Text>
              <TextInput
                style={styles.input}
                value={inputValues.rainfall}
                keyboardType="decimal-pad"
                onChangeText={(t) => handleChange("rainfall", t)}
              />
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>{ui.getSuggestion}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#123824", marginBottom: 16 },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#1c3b2a",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e6efe6",
  },
  col: {
    flexDirection: "column",
    marginBottom: 10,
  },
  label: {
    fontWeight: "700",
    color: "#2f5f40",
    fontSize: 13,
    marginBottom: 4,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#e6efe6",
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6efe6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#f6f9f5",
    marginBottom: 6,
    color: "#1c2b21",
  },
  submitBtn: {
    backgroundColor: "#1f8a4c",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#1b5c38",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.25,
  },
});
