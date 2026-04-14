import CompactLanguageSelector from '@/components/CompactLanguageSelector';
import { Button } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSpeechAudioUrl } from './api';

interface CropResult {
  crop?: string;
  prediction?: string;
  confidence?: number;
  recommended_crops?: string[];
  rationale?: string;
  [key: string]: any;
}

export default function SuggestionResult() {
  const { translate, language, prepareLanguageModel } = useLanguage();
  const { result: resultParam, formData: formDataParam } = useLocalSearchParams();
  const spokenResultKeyRef = useRef('');
  const [result, setResult] = useState<CropResult | null>(null);
  const [formData, setFormData] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUiReady, setIsUiReady] = useState(false);
  
  const [ui, setUi] = useState({
    error: "Error",
    success: "Success",
    reportTitle: "Crop Suggestion Report",
    recommendedCrop: "Recommended Crop",
    confidence: "Confidence",
    whyThisCrop: "Why This Crop?",
    alternativeCrops: "Alternative Crops",
    inputValues: "Input Values",
    noResultsTitle: "No Results",
    unknownCrop: "Unknown Crop",
    generatingPDF: "Generating PDF...",
    back: "Back",
    goHome: "Go Home",
    soilValues: "Soil Values",
    environmentalConditions: "Environmental Conditions",
    downloadPDF: "Download PDF Report",
    shareResults: "Share Results",
    unableToLoad: "Unable to load crop suggestion results",
    failedToParse: "Failed to parse crop suggestion results",
    noResults: "No suggestion results received. Please try again.",
    generatedOn: "Generated on",
    noData: "No data available",
    inputParameters: "Input Values",
    disclaimer: "This report is for informational purposes only. Please consult with agricultural experts for professional advice.",
    appTagline: "Farming AI Assistant",
    nitrogen: "N (Nitrogen)",
    phosphorus: "P (Phosphorous)",
    potassium: "K (Potassium)",
    phLabel: "pH",
    temperature: "Temperature (°C)",
    humidity: "Humidity (%)",
    rainfall: "Rainfall (mm)",
    replayVoice: "Replay Voice",
    voicePlaybackFailed: "Voice playback failed. Please try again.",
  });
  const soundRef = useRef<Audio.Sound | null>(null);

  const getSpeechLocale = (code: string) => {
    switch (code) {
      case 'ta': return 'ta-IN';
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ml': return 'ml-IN';
      case 'kn': return 'kn-IN';
      default: return 'en-US';
    }
  };

  const shouldSkipTranslation = (text: string) => {
    const value = (text || '').trim();
    if (!value) return true;
    if (/^https?:\/\//i.test(value)) return true;
    if (/^[\d\s.,:%+-]+$/.test(value)) return true;
    return false;
  };

  const normalizeForDisplay = (text: string) =>
    (text || '')
      .replace(/___+/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const translateTextValue = async (value?: string) => {
    if (typeof value !== 'string') return value;
    const normalized = normalizeForDisplay(value);
    if (!normalized || shouldSkipTranslation(normalized)) return normalized;
    try {
      const translated = await translate(normalized);
      return translated || normalized;
    } catch {
      return normalized;
    }
  };

  const translateCropResult = async (raw: CropResult): Promise<CropResult> => {
    const translatedAlternatives = Array.isArray(raw.alternatives)
      ? await Promise.all(
          raw.alternatives.map(async (alt: any) => ({
            ...alt,
            crop: await translateTextValue(alt?.crop),
          }))
        )
      : raw.alternatives;

    const translatedRecommended = Array.isArray(raw.recommended_crops)
      ? await Promise.all(raw.recommended_crops.map((crop) => translateTextValue(crop) as Promise<string>))
      : raw.recommended_crops;

    return {
      ...raw,
      crop: await translateTextValue(raw.crop),
      prediction: await translateTextValue(raw.prediction),
      rationale: await translateTextValue(raw.rationale),
      alternatives: translatedAlternatives,
      recommended_crops: translatedRecommended,
    };
  };

  const buildLocalizedRationale = () => {
    if (!result) return ui.noData;

    if (formData) {
      const confidenceText =
        result?.confidence !== undefined ? `${(result.confidence * 100).toFixed(1)}%` : ui.noData;
      return `${ui.recommendedCrop}: ${result.crop || result.prediction || ui.unknownCrop}\n${ui.confidence}: ${confidenceText}\n${ui.nitrogen}: ${formData.N}, ${ui.phosphorus}: ${formData.P}, ${ui.potassium}: ${formData.K}, ${ui.phLabel}: ${formData.ph}, ${ui.temperature}: ${formData.temperature}, ${ui.humidity}: ${formData.humidity}, ${ui.rainfall}: ${formData.rainfall}`;
    }

    return result.rationale || ui.noData;
  };

  React.useEffect(() => {
    (async () => {
      setUi({
        error: await translate("Error"),
        success: await translate("Success"),
        reportTitle: await translate("Crop Suggestion Report"),
        recommendedCrop: await translate("Recommended Crop"),
        confidence: await translate("Confidence"),
        whyThisCrop: await translate("Why This Crop?"),
        alternativeCrops: await translate("Alternative Crops"),
        inputValues: await translate("Input Values"),
        noResultsTitle: await translate("No Results"),
        unknownCrop: await translate("Unknown Crop"),
        generatingPDF: await translate("Generating PDF..."),
        back: await translate("Back"),
        goHome: await translate("Go Home"),
        soilValues: await translate("Soil Values"),
        environmentalConditions: await translate("Environmental Conditions"),
        downloadPDF: await translate("Download PDF Report"),
        shareResults: await translate("Share Results"),
        unableToLoad: await translate("Unable to load crop suggestion results"),
        failedToParse: await translate("Failed to parse crop suggestion results"),
        noResults: await translate("No suggestion results received. Please try again."),
        generatedOn: await translate("Generated on"),
        noData: await translate("No data available"),
        inputParameters: await translate("Input Values"),
        disclaimer: await translate("This report is for informational purposes only. Please consult with agricultural experts for professional advice."),
        appTagline: await translate("Farming AI Assistant"),
        nitrogen: await translate("N (Nitrogen)"),
        phosphorus: await translate("P (Phosphorous)"),
        potassium: await translate("K (Potassium)"),
        phLabel: await translate("pH"),
        temperature: await translate("Temperature (°C)"),
        humidity: await translate("Humidity (%)"),
        rainfall: await translate("Rainfall (mm)"),
        replayVoice: await translate("Replay Voice"),
        voicePlaybackFailed: await translate("Voice playback failed. Please try again."),
      });
      setIsUiReady(true);
    })();
  }, [translate]);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    return () => {
      Speech.stop();
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const normalizeParam = (param: string | string[] | undefined) => {
      if (Array.isArray(param)) return param[0] || '';
      return param || '';
    };

    const safeParseParamJson = (raw: string) => {
      const attempts = [raw];
      try { attempts.push(decodeURIComponent(raw)); } catch {}
      try {
        const once = attempts[attempts.length - 1];
        attempts.push(decodeURIComponent(once));
      } catch {}

      for (const candidate of attempts) {
        try {
          return JSON.parse(candidate);
        } catch {
        }
      }

      throw new Error('Invalid JSON param format');
    };

    const parseAndTranslate = async () => {
      if (language !== 'en') {
        try {
          await prepareLanguageModel(language);
        } catch {
          // Best-effort: dictionary or fallback translation will still apply.
        }
      }

      if (resultParam) {
        try {
          const rawResult = normalizeParam(resultParam as any);
          const parsed = safeParseParamJson(rawResult);
          const translated = await translateCropResult(parsed);
          setResult(translated);
          console.log('Result:', translated);
        } catch (e) {
          console.error('Error parsing result:', e);
          Alert.alert(ui.error, ui.failedToParse);
        }
      } else {
        console.warn('No result parameter received');
        Alert.alert(ui.error, ui.noResults);
      }

      if (formDataParam) {
        try {
          const rawForm = normalizeParam(formDataParam as any);
          const parsed = safeParseParamJson(rawForm);
          setFormData(parsed);
          console.log('Form data:', parsed);
        } catch (e) {
          console.error('Error parsing formData:', e);
        }
      }
    };

    parseAndTranslate();
  }, [resultParam, formDataParam, language, prepareLanguageModel, translate]);

  useEffect(() => {
    if (!isUiReady || !result) return;

    const speechText = buildSpeechText();

    if (!speechText) return;

    const speechKey = `${language}:${speechText}`;
    if (spokenResultKeyRef.current === speechKey) return;

    spokenResultKeyRef.current = speechKey;
    void playSpeechText(speechText);
  }, [result, formData, ui, language, isUiReady]);

  const playSpeechText = async (speechText: string) => {
    const playOfflineFallback = () => {
      Speech.stop();
      Speech.speak(speechText, {
        language: getSpeechLocale(language),
        rate: 0.95,
        pitch: 1.0,
      });
    };

    try {
      if (!speechText.trim()) return;

      Speech.stop();

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const speechUrl = getSpeechAudioUrl(speechText, getSpeechLocale(language));
      const { sound } = await Audio.Sound.createAsync(
        { uri: speechUrl },
        { shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          if (soundRef.current === sound) {
            soundRef.current = null;
          }
        }
      });

      soundRef.current = sound;
    } catch (error) {
      console.error('Speech playback failed:', error);
      try {
        playOfflineFallback();
      } catch (offlineError) {
        console.error('Offline speech fallback failed:', offlineError);
        Alert.alert(ui.reportTitle, ui.voicePlaybackFailed);
      }
    }
  };

  const buildSpeechText = () => {
    if (!result) return '';

    const cropName = result.crop || result.prediction || ui.unknownCrop;
    const confidenceText =
      result.confidence !== undefined ? `${(result.confidence * 100).toFixed(1)}%` : ui.noData;
    const rationale = buildLocalizedRationale();

    return [
      ui.reportTitle,
      `${ui.recommendedCrop}: ${cropName}`,
      `${ui.confidence}: ${confidenceText}`,
      rationale !== ui.noData ? `${ui.whyThisCrop}: ${rationale}` : '',
    ]
      .filter(Boolean)
      .join('. ');
  };

  const handleReplayVoice = () => {
    const speechText = buildSpeechText();
    if (!speechText) return;

    spokenResultKeyRef.current = `${language}:${speechText}`;
    void playSpeechText(speechText);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const htmlContent = generatePDFContent();
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: ui.reportTitle,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert(ui.success, ui.downloadPDF);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(ui.error, ui.unableToLoad);
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDFContent = () => {
    const dateLocale = (() => {
      switch (language) {
        case 'ta': return 'ta-IN';
        case 'hi': return 'hi-IN';
        case 'te': return 'te-IN';
        case 'ml': return 'ml-IN';
        case 'kn': return 'kn-IN';
        default: return 'en-US';
      }
    })();

    const currentDate = new Date().toLocaleDateString(dateLocale, {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const alternativeCrops = result?.recommended_crops?.join(', ') || ui.noData;
    const rationale = buildLocalizedRationale();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              padding: 40px; 
              background: #f5f8f4;
              color: #333;
            }
            .header {
              text-align: center;
              background: linear-gradient(135deg, #6B9E4A 0%, #4A6B3A 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              margin-bottom: 30px;
              box-shadow: 0 4px 12px rgba(107, 158, 74, 0.3);
            }
            .header h1 { margin: 0; font-size: 32px; font-weight: 800; }
            .header p { margin: 10px 0 0 0; opacity: 0.95; font-size: 14px; }
            .section {
              background: white;
              padding: 20px;
              border-radius: 12px;
              margin: 20px 0;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              border-left: 5px solid #6B9E4A;
            }
            .crop-name {
              font-size: 28px;
              font-weight: 900;
              color: #2e7d32;
              margin: 15px 0;
            }
            .confidence {
              display: inline-block;
              background: #e8f5e9;
              color: #2e7d32;
              padding: 10px 15px;
              border-radius: 8px;
              font-weight: bold;
              margin: 10px 0;
            }
            .rationale {
              background: #f1f8f4;
              padding: 15px;
              border-radius: 8px;
              line-height: 1.6;
              margin: 15px 0;
            }
            .alternatives {
              background: #f9fdf9;
              padding: 15px;
              border-radius: 8px;
              line-height: 1.6;
              margin: 15px 0;
            }
            .values-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 15px 0;
            }
            .value-item {
              background: #fafafa;
              padding: 12px;
              border-radius: 8px;
              border-left: 4px solid #66bb6a;
            }
            .value-label {
              font-weight: bold;
              color: #43a047;
              font-size: 12px;
            }
            .value-text {
              font-size: 16px;
              color: #333;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding: 20px;
              background: #e8f5e9;
              border-radius: 8px;
              color: #558b2f;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌾 SMART UZHAVAN</h1>
            <p>${ui.reportTitle}</p>
            <p>${ui.generatedOn} ${currentDate}</p>
          </div>
          
          <div class="section">
            <h2>${ui.recommendedCrop}</h2>
            <div class="crop-name">${result?.crop || result?.prediction || ui.unknownCrop}</div>
            ${result?.confidence ? `<div class="confidence">${ui.confidence}: ${(result.confidence * 100).toFixed(1)}%</div>` : ''}
          </div>

          ${rationale !== ui.noData ? `
            <div class="section">
              <h3>📋 ${ui.whyThisCrop}</h3>
              <div class="rationale">${rationale}</div>
            </div>
          ` : ''}

          ${alternativeCrops !== ui.noData ? `
            <div class="section">
              <h3>💡 ${ui.alternativeCrops}</h3>
              <div class="alternatives">${alternativeCrops}</div>
            </div>
          ` : ''}

          ${formData ? `
            <div class="section">
              <h3>📊 ${ui.inputParameters}</h3>
              <div class="values-grid">
                <div class="value-item">
                  <div class="value-label">${ui.nitrogen}</div>
                  <div class="value-text">${formData.N}</div>
                </div>
                <div class="value-item">
                  <div class="value-label">${ui.phosphorus}</div>
                  <div class="value-text">${formData.P}</div>
                </div>
                <div class="value-item">
                  <div class="value-label">${ui.potassium}</div>
                  <div class="value-text">${formData.K}</div>
                </div>
                <div class="value-item">
                  <div class="value-label">${ui.phLabel}</div>
                  <div class="value-text">${formData.ph}</div>
                </div>
                <div class="value-item">
                  <div class="value-label">${ui.temperature}</div>
                  <div class="value-text">${formData.temperature}°C</div>
                </div>
                <div class="value-item">
                  <div class="value-label">${ui.humidity}</div>
                  <div class="value-text">${formData.humidity}%</div>
                </div>
                <div class="value-item">
                  <div class="value-label">${ui.rainfall}</div>
                  <div class="value-text">${formData.rainfall}mm</div>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="footer">
            <p><strong>${ui.reportTitle}:</strong> ${ui.disclaimer}</p>
            <p>© ${new Date().getFullYear()} Smart Uzhavan - ${ui.appTagline}</p>
          </div>
        </body>
      </html>
    `;
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.decorativeBlobLarge} />
      <View style={styles.decorativeBlobSmall} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <CompactLanguageSelector />
        </View>
        <View style={styles.card}>
          {result ? (
            <>
              <Text style={styles.title}>🌾 {ui.recommendedCrop}</Text>
              <Text style={styles.cropName}>
                {result.crop || result.prediction || ui.unknownCrop}
              </Text>

              {result.confidence !== undefined && (
                <View style={styles.confidenceBox}>
                  <Text style={styles.confidenceLabel}>{ui.confidence}</Text>
                  <Text style={styles.confidenceValue}>
                    {(result.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              )}

              {buildLocalizedRationale() !== ui.noData && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📋 {ui.whyThisCrop}</Text>
                  <Text style={styles.sectionText}>{buildLocalizedRationale()}</Text>
                </View>
              )}

              {(result.alternatives && Array.isArray(result.alternatives) && result.alternatives.length > 0) || 
               (result.recommended_crops && Array.isArray(result.recommended_crops) && result.recommended_crops.length > 0) ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💡 {ui.alternativeCrops}</Text>
                  {result.alternatives && Array.isArray(result.alternatives) && result.alternatives.length > 0 ? (
                    result.alternatives.map((alt: any, idx: number) => (
                      <Text key={idx} style={styles.cropItem}>
                        • {alt.crop} ({(alt.confidence * 100).toFixed(1)}%)
                      </Text>
                    ))
                  ) : (
                    result.recommended_crops && Array.isArray(result.recommended_crops) ? (
                      result.recommended_crops.map((crop: string, idx: number) => (
                        <Text key={idx} style={styles.cropItem}>• {crop}</Text>
                      ))
                    ) : null
                  )}
                </View>
              ) : null}

              {formData && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📊 {ui.inputValues}</Text>
                  <View style={styles.valueGrid}>
                    <View style={styles.valueRow}>
                      <Text style={styles.valueLabel}>{ui.nitrogen}:</Text>
                      <Text style={styles.valueText}>{formData.N}</Text>
                    </View>
                    <View style={styles.valueRow}>
                      <Text style={styles.valueLabel}>{ui.phosphorus}:</Text>
                      <Text style={styles.valueText}>{formData.P}</Text>
                    </View>
                    <View style={styles.valueRow}>
                      <Text style={styles.valueLabel}>{ui.potassium}:</Text>
                      <Text style={styles.valueText}>{formData.K}</Text>
                    </View>
                    <View style={styles.valueRow}>
                      <Text style={styles.valueLabel}>{ui.phLabel}:</Text>
                      <Text style={styles.valueText}>{formData.ph}</Text>
                    </View>
                    <View style={styles.valueRow}>
                      <Text style={styles.valueLabel}>{ui.temperature}:</Text>
                      <Text style={styles.valueText}>{formData.temperature}°C</Text>
                    </View>
                    <View style={styles.valueRow}>
                      <Text style={styles.valueLabel}>{ui.humidity}:</Text>
                      <Text style={styles.valueText}>{formData.humidity}%</Text>
                    </View>
                    <View style={styles.valueRow}>
                      <Text style={styles.valueLabel}>{ui.rainfall}:</Text>
                      <Text style={styles.valueText}>{formData.rainfall}mm</Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.title}>{ui.noResultsTitle}</Text>
              <Text style={styles.subtitle}>{ui.unableToLoad}</Text>
            </>
          )}

          {/* PDF Download Button */}
          <TouchableOpacity 
            style={styles.downloadButton} 
            onPress={handleDownloadPDF}
            disabled={isDownloading}
          >
            <Ionicons 
              name={isDownloading ? "hourglass-outline" : "download-outline"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.downloadButtonText}>
              {isDownloading ? ui.generatingPDF : ui.downloadPDF}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.replayButton}
            onPress={handleReplayVoice}
          >
            <Ionicons name="play-back-circle-outline" size={24} color="white" />
            <Text style={styles.replayButtonText}>{ui.replayVoice}</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Button title={ui.back} onPress={() => router.back()} style={{ flex: 1 }} />
            <Button title={ui.goHome} onPress={() => router.replace('/home' as any)} style={{ flex: 1 }} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#e8f5e9' },
  container: { flexGrow: 1, paddingHorizontal: 18, paddingVertical: 20 },
  topBar: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 20,
  },
  topBarSpacer: {
    flex: 1,
  },
  decorativeBlobLarge: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#c8e6c9',
    opacity: 0.4,
  },
  decorativeBlobSmall: {
    position: 'absolute',
    top: 80,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#a5d6a7',
    opacity: 0.3,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1b5e20',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#558b2f',
    marginBottom: 12,
  },
  cropName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1b5e20',
    marginBottom: 20,
    lineHeight: 36,
  },
  confidenceBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c8e6c9',
  },
  confidenceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#43a047',
    marginBottom: 8,
  },
  confidenceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2e7d32',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: '#f9fdf9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#66bb6a',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2e7d32',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  sectionText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
  },
  cropItem: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
    lineHeight: 20,
  },
  valueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  valueRow: {
    width: '50%',
    paddingRight: 8,
    marginBottom: 12,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#43a047',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 13,
    color: '#424242',
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#43a047',
    borderRadius: 16,
    padding: 18,
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  replayButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  replayButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
});
