import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Screen from '@/components/Screen';
import { useLanguage } from '@/context/LanguageContext';

import diseaseDbHi from '@/assets/data/diseases-treatment.hi.json';
import diseaseDb from '@/assets/data/diseases-treatment.json';
import diseaseDbKn from '@/assets/data/diseases-treatment.kn.json';
import diseaseDbMl from '@/assets/data/diseases-treatment.ml.json';
import diseaseDbTa from '@/assets/data/diseases-treatment.ta.json';
import diseaseDbTe from '@/assets/data/diseases-treatment.te.json';

type DiseaseEntry = {
  recommendation?: string;
  treatment?: string;
  _name?: string;
};

type CropDiseaseMap = Record<string, DiseaseEntry>;
type DiseaseDB = Record<string, CropDiseaseMap>;

type Props = {
  cropKey: string;
  title: string;
};

const localizedDiseaseDbByLanguage: Record<string, DiseaseDB> = {
  hi: diseaseDbHi as DiseaseDB,
  ta: diseaseDbTa as DiseaseDB,
  te: diseaseDbTe as DiseaseDB,
  ml: diseaseDbMl as DiseaseDB,
  kn: diseaseDbKn as DiseaseDB,
};

export default function CropDiseaseScreen({ cropKey, title }: Props) {
  const { translate, language } = useLanguage();
  const [translatedTitle, setTranslatedTitle] = useState(title);
  const [ui, setUi] = useState({
    back: 'Back',
    subtitle: 'Disease management guide',
    noDataTitle: 'No data available',
    noDataBody: 'Disease recommendations are not available for this crop yet.',
    recommendation: 'Recommendation',
    treatment: 'Treatment',
  });

  useEffect(() => {
    (async () => {
      setTranslatedTitle(await translate(title));
      setUi({
        back: await translate('Back'),
        subtitle: await translate('Disease management guide'),
        noDataTitle: await translate('No data available'),
        noDataBody: await translate('Disease recommendations are not available for this crop yet.'),
        recommendation: await translate('Recommendation'),
        treatment: await translate('Treatment'),
      });
    })();
  }, [title, translate]);

  const cropDiseases = useMemo(() => {
    const db = diseaseDb as unknown as DiseaseDB;
    return db?.[cropKey] || null;
  }, [cropKey]);

  const localizedCropDiseases = useMemo(() => {
    if (language === 'en') return null;
    const localizedDb = localizedDiseaseDbByLanguage[language];
    return localizedDb?.[cropKey] || null;
  }, [cropKey, language]);

  const diseaseNames = useMemo(() => {
    if (!cropDiseases) return [];
    return Object.keys(cropDiseases).sort((a, b) => a.localeCompare(b));
  }, [cropDiseases]);

  const [translatedRows, setTranslatedRows] = useState<
    Array<{ name: string; recommendation?: string; treatment?: string }>
  >([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (!cropDiseases || diseaseNames.length === 0) {
        if (isMounted) setTranslatedRows([]);
        return;
      }

      const rows = await Promise.all(
        diseaseNames.map(async (name) => {
          const englishEntry = cropDiseases[name] || {};
          const localizedEntry = localizedCropDiseases?.[name] || {};

          const displayName =
            localizedEntry._name ||
            (language === 'en' ? name : await translate(name));

          const recommendation = localizedEntry.recommendation
            ? localizedEntry.recommendation
            : englishEntry.recommendation
              ? language === 'en'
                ? englishEntry.recommendation
                : await translate(englishEntry.recommendation)
              : undefined;

          const treatment = localizedEntry.treatment
            ? localizedEntry.treatment
            : englishEntry.treatment
              ? language === 'en'
                ? englishEntry.treatment
                : await translate(englishEntry.treatment)
              : undefined;

          return {
            name: displayName,
            recommendation,
            treatment,
          };
        })
      );

      if (isMounted) {
        setTranslatedRows(rows);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [cropDiseases, diseaseNames, language, localizedCropDiseases, translate]);

  return (
    <Screen title={translatedTitle} subtitle={ui.subtitle}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#1b5e20" />
        <Text style={styles.backText}>{ui.back}</Text>
      </TouchableOpacity>

      {!cropDiseases || diseaseNames.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>{ui.noDataTitle}</Text>
          <Text style={styles.emptyBody}>{ui.noDataBody}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {translatedRows.map((entry, index) => {
            return (
              <View key={`${entry.name}-${index}`} style={styles.card}>
                <Text style={styles.diseaseName}>{entry.name}</Text>

                {entry.recommendation ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{ui.recommendation}</Text>
                    <Text style={styles.sectionBody}>{entry.recommendation}</Text>
                  </View>
                ) : null}

                {entry.treatment ? (
                  <View style={styles.sectionAlt}>
                    <Text style={styles.sectionTitleAlt}>{ui.treatment}</Text>
                    <Text style={styles.sectionBodyAlt}>{entry.treatment}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#1b5e20',
    fontWeight: '600',
  },
  emptyWrap: {
    paddingVertical: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A6B3A',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2e7d32',
    marginBottom: 10,
  },
  section: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  sectionAlt: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2e7d32',
    marginBottom: 6,
  },
  sectionTitleAlt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ef6c00',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 13,
    color: '#1b5e20',
    lineHeight: 19,
  },
  sectionBodyAlt: {
    fontSize: 13,
    color: '#bf360c',
    lineHeight: 19,
  },
});
