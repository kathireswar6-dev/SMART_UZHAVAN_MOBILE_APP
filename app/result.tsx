import CompactLanguageSelector from '@/components/CompactLanguageSelector';
import { Button } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getLastPrediction, getSpeechAudioUrl } from './api';

interface Prediction {
  imageIndex: number;
  class_name?: string;
  disease_name?: string;
  prediction?: string;
  confidence?: number;
  confidence_score?: string;
  score?: string;
  treatment?: string;
  medicine?: string;
  details?: { treatment?: string; recommendation?: string } | any;
  how?: string;
  error?: string;
}

export default function ResultPage() {
  const { translate, language, prepareLanguageModel } = useLanguage();
  const { images: imagesParam, predictions: predictionsParam, resultId, serverResult: serverResultParam } = useLocalSearchParams();
  const spokenResultKeyRef = useRef('');
  const [ui, setUi] = useState({
    diagnosisResults: 'Diagnosis Results',
    diagnosisResult: 'Diagnosis Result',
    confidenceLevel: 'Confidence Level',
    disease: 'Disease',
    confidence: 'Confidence',
    recommendation: 'Recommendation',
    treatment: 'Treatment',
    processingImage: 'Processing image...',
    loadingResults: 'Loading results...',
    generatingPDF: 'Generating PDF...',
    downloadPDF: 'Download PDF',
    back: 'Back',
    goHome: 'Go Home',
    askAiAboutResult: 'Ask AI About This Result',
    diseaseDiagnosisReport: 'Disease Diagnosis Report',
    pdfSavedSuccessfully: 'PDF saved successfully!',
    failedToGeneratePdf: 'Failed to generate PDF. Please try again.',
    generatedOn: 'Generated on',
    important: 'Important',
    reportDisclaimer: 'This report is for informational purposes only. Please consult with agricultural experts for professional advice.',
    image: 'Image',
    notAvailable: 'Unknown',
    appTagline: 'Farming AI Assistant',
    replayVoice: 'Replay Voice',
    voicePlaybackFailed: 'Voice playback failed. Please try again.',
  });
  const [isUiReady, setIsUiReady] = useState(false);
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [ensemble, setEnsemble] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const getSpeechLocale = (code: string) => {
    const map: Record<string, string> = { ta: 'ta', hi: 'hi', te: 'te', ml: 'ml', kn: 'kn' };
    return map[code] || 'en';
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

  const translateDeep = async (value: any): Promise<any> => {
    if (typeof value === 'string') {
      return translateTextValue(value);
    }
    if (Array.isArray(value)) {
      return Promise.all(value.map((item) => translateDeep(item)));
    }
    if (value && typeof value === 'object') {
      const entries = await Promise.all(
        Object.entries(value).map(async ([key, val]) => [key, await translateDeep(val)] as const)
      );
      return Object.fromEntries(entries);
    }
    return value;
  };

  const translatePredictionItem = async (item: Prediction): Promise<Prediction> => {
    const translatedDetails = await translateDeep(item.details);

    return {
      ...item,
      class_name: await translateTextValue(item.class_name),
      disease_name: await translateTextValue(item.disease_name),
      prediction: await translateTextValue(item.prediction),
      treatment: await translateTextValue(item.treatment),
      medicine: await translateTextValue(item.medicine),
      how: await translateTextValue(item.how),
      error: await translateTextValue(item.error),
      details: translatedDetails,
    };
  };

  const translateEnsembleData = async (raw: any) => {
    if (!raw || typeof raw !== 'object') return raw;

    const translatedDetails = await translateDeep(raw.details);

    return {
      ...raw,
      disease_name: await translateTextValue(raw.disease_name),
      prediction: await translateTextValue(raw.prediction),
      treatment: await translateTextValue(raw.treatment),
      medicine: await translateTextValue(raw.medicine),
      how: await translateTextValue(raw.how),
      details: translatedDetails,
    };
  };

  useEffect(() => {
    (async () => {
      setUi({
        diagnosisResults: await translate('Diagnosis Results'),
        diagnosisResult: await translate('Diagnosis Result'),
        confidenceLevel: await translate('Confidence Level'),
        disease: await translate('Disease'),
        confidence: await translate('Confidence'),
        recommendation: await translate('Recommendation'),
        treatment: await translate('Treatment'),
        processingImage: await translate('Processing image...'),
        loadingResults: await translate('Loading results...'),
        generatingPDF: await translate('Generating PDF...'),
        downloadPDF: await translate('Download PDF'),
        back: await translate('Back'),
        goHome: await translate('Go Home'),
        askAiAboutResult: await translate('Ask AI About This Result'),
        diseaseDiagnosisReport: await translate('Disease Diagnosis Report'),
        pdfSavedSuccessfully: await translate('PDF saved successfully!'),
        failedToGeneratePdf: await translate('Failed to generate PDF. Please try again.'),
        generatedOn: await translate('Generated on'),
        important: await translate('Important'),
        reportDisclaimer: await translate('This report is for informational purposes only. Please consult with agricultural experts for professional advice.'),
        image: await translate('Image'),
        notAvailable: await translate('Unknown'),
        appTagline: await translate('Farming AI Assistant'),
        replayVoice: await translate('Replay Voice'),
        voicePlaybackFailed: await translate('Voice playback failed. Please try again.'),
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
    if (imagesParam) {
      try {
        const parsedImages = JSON.parse(imagesParam as string);
        setImages(parsedImages);
      } catch (error) {
        console.error('Error parsing images:', error);
      }
    }

    async function loadFallback() {
      if (language !== 'en') {
        try {
          await prepareLanguageModel(language);
        } catch {
          // Keep dictionary + best-effort fallback if model cannot be prepared.
        }
      }

      // 1) Try to read from AsyncStorage using resultId
      try {
        if (!predictionsParam && resultId) {
          const userEmail = await AsyncStorage.getItem('userEmail');
          if (userEmail) {
            const key = `history_${userEmail}`;
            const raw = await AsyncStorage.getItem(key);
            if (raw) {
              const history = JSON.parse(raw);
              const found = history.find((h: any) => h.id === resultId);
              if (found && Array.isArray(found.predictions)) {
                const translated = await Promise.all(
                  found.predictions.map((p: Prediction) => translatePredictionItem(p))
                );
                setPredictions(translated);
                return;
              }
            }
          }
        }
      } catch {
        // ignore and try server
      }

      // 2) Try backend last-prediction endpoint
      try {
        if (!predictionsParam && !imagesParam) {
          const res = await getLastPrediction();
          const last = res?.last_prediction || res;
          if (last) {
            const translatedLast = await translatePredictionItem({ imageIndex: 1, ...last });
            setPredictions([translatedLast]);
            setImages([{ uri: last.img_url ? last.img_url : '' }]);
            return;
          }
        }
      } catch {
        // ignore
      }

      // 3) If serverResult was passed via navigation params, prefer it as the single ensemble result
      if (serverResultParam) {
        try {
          const parsed = JSON.parse(serverResultParam as string);
          const translatedEnsemble = await translateEnsembleData(parsed);
          setEnsemble(translatedEnsemble);
          // build per-image predictions array if available
          const perRaw = (parsed.per_image || []).map((p: any, idx: number) => ({ imageIndex: idx + 1, ...p }));
          const per = await Promise.all(perRaw.map((p: Prediction) => translatePredictionItem(p)));
          setPredictions(per.length ? per : []);
          // if server included img_url(s), map to images if images not provided
          if ((!imagesParam || imagesParam === 'undefined') && parsed.img_url) {
            try {
              const imgUrls = Array.isArray(parsed.img_url) ? parsed.img_url : JSON.parse(parsed.img_url);
              setImages((imgUrls || []).map((u: string) => ({ uri: u })));
            } catch {
              setImages([]);
            }
          }
          return;
        } catch (error) {
          console.error('Error parsing serverResult:', error);
        }
      }

      // 4) Finally parse predictionsParam if present
      if (predictionsParam) {
        try {
          const parsedPredictions = JSON.parse(predictionsParam as string);
          const translated = await Promise.all(
            (parsedPredictions || []).map((p: Prediction) => translatePredictionItem(p))
          );
          setPredictions(translated);
        } catch (error) {
          console.error('Error parsing predictions:', error);
        }
      }
    }

    loadFallback();
  }, [imagesParam, predictionsParam, resultId, serverResultParam, translate, language, prepareLanguageModel]);

  useEffect(() => {
    if (!isUiReady) return;

    const speechText = buildSpeechText();
    if (!speechText) return;

    const speechKey = `${language}:${speechText}`;
    if (spokenResultKeyRef.current === speechKey) return;

    spokenResultKeyRef.current = speechKey;
    void playSpeechText(speechText);
  }, [ensemble, predictions, ui, language, isUiReady]);

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

      // Verify the TTS endpoint is reachable before loading audio
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const check = await fetch(speechUrl, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeout);
        if (!check.ok) throw new Error(`TTS HTTP ${check.status}`);
      } catch (fetchErr: any) {
        clearTimeout(timeout);
        console.warn('TTS endpoint unreachable:', fetchErr?.message);
        playOfflineFallback();
        return;
      }

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
      }
    }
  };

  const buildSpeechText = () => {
    const topPrediction = ensemble || predictions.find((p) => p.imageIndex !== 0) || predictions[0];
    if (!topPrediction) return '';

    const diseaseName = topPrediction.disease_name || topPrediction.prediction || topPrediction.class_name || ui.notAvailable;
    const confidenceText =
      topPrediction.confidence !== undefined
        ? `${(topPrediction.confidence * 100).toFixed(1)}%`
        : (topPrediction.confidence_score || topPrediction.score || ui.notAvailable);
    const recommendation = topPrediction.details?.recommendation || topPrediction.medicine || '';
    const treatment = topPrediction.details?.treatment || topPrediction.how || '';

    const speechText = [
      ui.diagnosisResults,
      `${ui.disease}: ${diseaseName}`,
      `${ui.confidence}: ${confidenceText}`,
      recommendation ? `${ui.recommendation}: ${recommendation}` : '',
      treatment ? `${ui.treatment}: ${treatment}` : '',
    ]
      .filter(Boolean)
      .join('. ');

    return speechText;
  };

  const handleReplayVoice = async () => {
    const speechText = buildSpeechText();
    if (!speechText) return;

    spokenResultKeyRef.current = `${language}:${speechText}`;
    try {
      await playSpeechText(speechText);
    } catch {
      Alert.alert(ui.diagnosisResults, ui.voicePlaybackFailed);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      
      // Generate HTML content for PDF
      const htmlContent = generatePDFContent();
      
      // Create PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      
      // Share or save the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: ui.diseaseDiagnosisReport,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert(await translate('Success'), ui.pdfSavedSuccessfully);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(await translate('Error'), ui.failedToGeneratePdf);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAskAiAboutResult = () => {
    const topPrediction = ensemble || predictions.find((p) => p.imageIndex !== 0) || predictions[0];
    const diseaseName = topPrediction?.disease_name || topPrediction?.prediction || topPrediction?.class_name || ui.notAvailable;
    const confidenceText =
      topPrediction?.confidence !== undefined
        ? `${(topPrediction.confidence * 100).toFixed(1)}%`
        : (topPrediction?.confidence_score || topPrediction?.score || ui.notAvailable);
    const recommendation = topPrediction?.details?.recommendation || topPrediction?.medicine || '';
    const treatment = topPrediction?.details?.treatment || topPrediction?.how || '';

    const diagnosisContext = [
      `Disease: ${diseaseName}`,
      `Confidence: ${confidenceText}`,
      recommendation ? `Recommendation: ${recommendation}` : '',
      treatment ? `Treatment: ${treatment}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const initialPrompt = `I received this disease diagnosis. Explain what this means and give step-by-step farmer action plan for the next 7 days.`;

    router.push({
      pathname: '/chatbot',
      params: {
        initialPrompt,
        diagnosisContext,
      },
    } as any);
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

    let resultsHTML = '';
    
    if (ensemble) {
      resultsHTML = `
        <div style="background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #4CAF50;">
          <h2 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 24px;">${ensemble.disease_name || ensemble.prediction || ui.diagnosisResult}</h2>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p style="margin: 8px 0; font-size: 16px;"><strong>${ui.confidenceLevel}:</strong> 
              <span style="color: ${(ensemble.confidence || 0) > 0.7 ? '#4CAF50' : '#FFA726'}; font-weight: bold;">
                ${ensemble.confidence !== undefined ? (ensemble.confidence * 100).toFixed(1) + '%' : (ensemble.confidence_score || ui.notAvailable)}
              </span>
            </p>
          </div>
          ${(ensemble.details?.recommendation || ensemble.medicine) ? `
            <div style="background: #f1f8e9; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="color: #558b2f; margin: 0 0 10px 0;">💊 ${ui.recommendation}</h3>
              <p style="color: #33691e; line-height: 1.6;">${ensemble.details?.recommendation || ensemble.medicine}</p>
            </div>
          ` : ''}
          ${(ensemble.details?.treatment || ensemble.how) ? `
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="color: #ef6c00; margin: 0 0 10px 0;">🩺 ${ui.treatment}</h3>
              <p style="color: #e65100; line-height: 1.6;">${ensemble.details?.treatment || ensemble.how}</p>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      resultsHTML = predictions.map((p, idx) => `
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-top: 4px solid #6B9E4A;">
          <h3 style="color: #4A6B3A; margin: 0 0 15px 0;">📷 ${ui.image} ${idx + 1}</h3>
          <div style="background: #f8fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p style="margin: 8px 0;"><strong>${ui.disease}:</strong> ${p.disease_name || p.class_name || p.prediction || ui.notAvailable}</p>
            ${(p.confidence !== undefined || p.confidence_score || p.score) ? `
              <p style="margin: 8px 0;"><strong>${ui.confidence}:</strong> 
                <span style="color: ${(p.confidence || 0) > 0.7 ? '#4CAF50' : '#FFA726'}; font-weight: bold;">
                  ${p.confidence !== undefined ? (p.confidence * 100).toFixed(1) + '%' : (p.confidence_score || p.score || ui.notAvailable)}
                </span>
              </p>
            ` : ''}
          </div>
          ${(p.details?.recommendation || p.medicine) ? `
            <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; margin: 10px 0;">
              <strong style="color: #2e7d32;">${ui.recommendation}:</strong>
              <p style="margin: 5px 0; color: #1b5e20;">${p.details?.recommendation || p.medicine}</p>
            </div>
          ` : ''}
          ${(p.details?.treatment || p.how) ? `
            <div style="background: #fff3e0; padding: 12px; border-radius: 8px; margin: 10px 0;">
              <strong style="color: #e65100;">${ui.treatment}:</strong>
              <p style="margin: 5px 0; color: #bf360c;">${p.details?.treatment || p.how}</p>
            </div>
          ` : ''}
        </div>
      `).join('');
    }

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
            <p>${ui.diseaseDiagnosisReport}</p>
            <p>${ui.generatedOn} ${currentDate}</p>
          </div>
          
          ${resultsHTML}
          
          <div class="footer">
            <p><strong>${ui.important}:</strong> ${ui.reportDisclaimer}</p>
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
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.headerLanguageSelector}>
            <CompactLanguageSelector />
          </View>
          <View style={styles.headerIconContainer}>
            <Ionicons name="document-text" size={32} color="#fff" />
          </View>
          <Text style={styles.pageTitle}>{ui.diagnosisResults}</Text>
        </View>

        <View style={styles.card}>

          {images.length > 0 ? (
            <>
              {/* If we have an ensemble result from server, show it as the single main prediction */}
              {ensemble ? (
                <>
                  {/* 1. Disease Name Section */}
                  <View style={styles.diseaseNameSection}>
                    <Text style={styles.ensembleDisease}>{ensemble.disease_name || ensemble.prediction || ui.notAvailable}</Text>
                  </View>

                  {/* 2. Thumbnails / confirmation images */}
                  <View style={styles.thumbnailsRow}>
                    {images.map((img, idx) => {
                      const p = predictions.find((pp) => pp.imageIndex === idx + 1);
                      return (
                        <View key={idx} style={styles.thumbBox}>
                          <Image source={{ uri: img.uri }} style={styles.thumbImage} />
                          {p && (p.confidence !== undefined || p.score) ? (
                            <Text style={styles.thumbInfo}>{p.confidence !== undefined ? (p.confidence * 100).toFixed(1) + '%' : p.score}</Text>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>

                  {/* 3. Recommendation and Treatment */}
                  {(ensemble.medicine || (ensemble.details && (ensemble.details.treatment || ensemble.details.recommendation)) || ensemble.how) && (
                    <>
                      {(ensemble.details?.recommendation || ensemble.medicine) && (
                        <View style={styles.treatmentBox}>
                          <Text style={styles.treatmentTitle}>💊 {ui.recommendation}</Text>
                          <Text style={styles.treatmentText}>{ensemble.details?.recommendation || ensemble.medicine}</Text>
                        </View>
                      )}
                      {(ensemble.details?.treatment || ensemble.how) && (
                        <View style={styles.treatmentBox}>
                          <Text style={styles.treatmentTitle}>🩺 {ui.treatment}</Text>
                          <Text style={styles.treatmentText}>{ensemble.details?.treatment || ensemble.how}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* Confidence Badge */}
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceLabel}>{ui.confidenceLevel}</Text>
                    <Text style={[styles.confidenceValue, { color: (ensemble.confidence || 0) > 0.7 ? '#4CAF50' : '#FFA726' }]}>
                      {ensemble.confidence !== undefined ? (ensemble.confidence * 100).toFixed(1) + '%' : (ensemble.confidence_score || ui.notAvailable)}
                    </Text>
                  </View>
                </>
              ) : (
                /* Show individual predictions when ensemble is not available */
                <View style={styles.resultsContainer}>
                  {images.map((img, idx) => {
                    const p = predictions.find((pp) => pp.imageIndex === idx + 1) || predictions[idx];
                    return (
                      <View key={idx} style={styles.resultItem}>
                        <Image source={{ uri: img.uri }} style={styles.resultImage} />
                        <View style={styles.predictionBox}>
                          <Text style={styles.imageLabel}>{ui.image} {idx + 1}</Text>
                          {p ? (
                            <>
                              <View style={styles.predictionRow}>
                                <Text style={styles.label}>{ui.disease}:</Text>
                                <Text style={styles.value}>{p.disease_name || p.class_name || p.prediction || ui.notAvailable}</Text>
                              </View>
                              {(p.confidence !== undefined || p.confidence_score || p.score) && (
                                <View style={styles.predictionRow}>
                                  <Text style={styles.label}>{ui.confidence}:</Text>
                                  <Text style={[styles.value, { color: (p.confidence || 0) > 0.7 ? '#4CAF50' : '#FFA726' }]}>
                                    {p.confidence !== undefined ? (p.confidence * 100).toFixed(1) + '%' : (p.confidence_score || p.score || ui.notAvailable)}
                                  </Text>
                                </View>
                              )}
                              {(p.medicine || (p.details && (p.details.treatment || p.details.recommendation)) || p.how) && (
                                <>
                                  {(p.details?.recommendation || p.medicine) && (
                                    <View style={styles.treatmentBox}>
                                      <Text style={styles.treatmentTitle}>{ui.recommendation}</Text>
                                      <Text style={styles.treatmentText}>{p.details?.recommendation || p.medicine}</Text>
                                    </View>
                                  )}
                                  {(p.details?.treatment || p.how) && (
                                    <View style={styles.treatmentBox}>
                                      <Text style={styles.treatmentTitle}>{ui.treatment}</Text>
                                      <Text style={styles.treatmentText}>{p.details?.treatment || p.how}</Text>
                                    </View>
                                  )}
                                </>
                              )}
                              {p.error && (
                                <View style={styles.errorBox}>
                                  <Text style={styles.errorText}>{p.error}</Text>
                                </View>
                              )}
                            </>
                          ) : (
                            <Text style={styles.loadingText}>{ui.processingImage}</Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          ) : (
            <Text style={styles.loadingText}>{ui.loadingResults}</Text>
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

          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleAskAiAboutResult}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="white" />
            <Text style={styles.chatButtonText}>{ui.askAiAboutResult}</Text>
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
  container: { flexGrow: 1, paddingHorizontal: 18, paddingVertical: 10 },
  pageHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
    position: 'relative',
  },
  headerLanguageSelector: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 20,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#43a047',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1b5e20',
    letterSpacing: 0.5,
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
  chatButton: {
    backgroundColor: '#1b5e20',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
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
    borderWidth: 0,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#123824', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#4b6051', marginBottom: 12 },
  imageCountText: { fontSize: 16, fontWeight: '700', color: '#4A6B3A', marginTop: 16, marginBottom: 12 },
  resultsContainer: { gap: 16, marginBottom: 16 },
  resultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  resultImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f5f5f5',
  },
  predictionBox: {
    padding: 20,
    backgroundColor: '#fafafa',
  },
  imageLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#43a047',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#424242',
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2e7d32',
    textAlign: 'right',
    flex: 1,
  },
  treatmentBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9fdf9',
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#66bb6a',
    shadowColor: '#43a047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  treatmentTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2e7d32',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  treatmentText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
  },
  errorBox: {
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorText: {
    color: '#C62828',
    fontWeight: '600',
    fontSize: 13,
  },
  loadingText: {
    color: '#43a047',
    fontStyle: 'italic',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 20,
  },
  body: { fontSize: 15, color: '#3a4d41', marginTop: 12 },
  ensembleCard: {
    backgroundColor: '#f1f8f4',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 20,
    borderWidth: 0,
    borderLeftWidth: 6,
    borderLeftColor: '#43a047',
    alignItems: 'flex-start',
    shadowColor: '#43a047',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  ensembleTitle: { fontSize: 16, fontWeight: '800', color: '#43a047', marginBottom: 10 },
  diseaseNameSection: {
    backgroundColor: '#f1f8f4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 6,
    borderLeftColor: '#43a047',
    alignItems: 'flex-start',
  },
  ensembleDisease: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#1b5e20', 
    marginBottom: 0,
    lineHeight: 36,
  },
  thumbnailsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginTop: 0, marginBottom: 20 },
  thumbBox: { 
    width: 110, 
    borderRadius: 12, 
    overflow: 'hidden', 
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbImage: { width: '100%', height: 85, backgroundColor: '#f5f5f5' },
  thumbInfo: { padding: 8, fontSize: 13, color: '#2e7d32', textAlign: 'center', fontWeight: '700' },
  confidenceBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
    letterSpacing: 1,
  },
});
