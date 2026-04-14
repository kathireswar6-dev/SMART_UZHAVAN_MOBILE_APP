import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Screen from '@/components/Screen';
import { useLanguage } from '@/context/LanguageContext';

export type DiseaseDetailsItem = {
  name: string;
  organism?: string;
  symptoms?: string[];
  treatment?: string[];
  how?: string[];
};

export type DiseaseDetailsSection = {
  title: string;
  items: DiseaseDetailsItem[];
};

type Props =
  | {
      title: string;
      subtitle?: string;
      items: DiseaseDetailsItem[];
      sections?: never;
      backTo?: string;
    }
  | {
      title: string;
      subtitle?: string;
      sections: DiseaseDetailsSection[];
      items?: never;
      backTo?: string;
    };

type RenderSection = {
  title?: string;
  items: DiseaseDetailsItem[];
};

type ExpandedState = {
  [key: string]: boolean;
};

export default function CropDiseaseDetailsScreen(props: Props) {
  const { title, subtitle, backTo } = props;
  const { translate, language, prepareLanguageModel } = useLanguage();
  const [expandedCards, setExpandedCards] = useState<ExpandedState>({});
  const sourceSections = useMemo<RenderSection[]>(() => {
    if (props.sections) {
      return props.sections.map((s) => ({ title: s.title, items: s.items }));
    }
    return [{ items: props.items }];
  }, [props]);

  const [ui, setUi] = useState({
    back: 'Back',
    organism: 'Causal Organism',
    symptoms: 'Symptoms',
    treatment: 'Treatment',
    howToTreat: 'How to Treat',
  });

  const [translatedTitle, setTranslatedTitle] = useState(title);
  const [translatedSubtitle, setTranslatedSubtitle] = useState(subtitle || '');
  const [translatedSections, setTranslatedSections] = useState<RenderSection[]>(sourceSections);

  const normalizeForDisplay = (text: string) =>
    (text || '')
      .replace(/___+/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const translateTextValue = async (value?: string) => {
    if (!value) return value;
    const normalized = normalizeForDisplay(value);
    try {
      const translated = await translate(normalized);
      return translated || normalized;
    } catch {
      return normalized;
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (language !== 'en') {
        try {
          await prepareLanguageModel(language);
        } catch {
          // Continue with dictionary/best-effort translation.
        }
      }

      if (cancelled) return;

      setUi({
        back: await translate('Back'),
        organism: await translate('Causal Organism'),
        symptoms: await translate('Symptoms'),
        treatment: await translate('Treatment'),
        howToTreat: await translate('How to Treat'),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [translate, language, prepareLanguageModel]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (language !== 'en') {
        try {
          await prepareLanguageModel(language);
        } catch {
          // Continue with dictionary/best-effort translation.
        }
      }

      const nextTitle = (await translateTextValue(title)) || title;
      const nextSubtitle = subtitle
        ? (await translateTextValue(subtitle)) || subtitle
        : '';

      if (cancelled) return;

      setTranslatedTitle(nextTitle);
      setTranslatedSubtitle(nextSubtitle);

      const translateItem = async (d: DiseaseDetailsItem): Promise<DiseaseDetailsItem> => ({
        ...d,
        name: ((await translateTextValue(d.name)) as string) || d.name,
        organism: d.organism ? ((await translateTextValue(d.organism)) as string) : undefined,
        symptoms: d.symptoms ? await Promise.all(d.symptoms.map((s) => translateTextValue(s) as Promise<string>)) : undefined,
        treatment: d.treatment ? await Promise.all(d.treatment.map((t) => translateTextValue(t) as Promise<string>)) : undefined,
        how: d.how ? await Promise.all(d.how.map((h) => translateTextValue(h) as Promise<string>)) : undefined,
      });

      if (props.sections) {
        const mapped = await Promise.all(
          props.sections.map(async (section) => ({
            title: ((await translateTextValue(section.title)) as string) || section.title,
            items: await Promise.all(section.items.map(translateItem)),
          }))
        );
        if (cancelled) return;
        setTranslatedSections(mapped);
        return;
      }

      const mappedItems = await Promise.all(props.items.map(translateItem));
      if (cancelled) return;
      setTranslatedSections([{ items: mappedItems }]);
    })();

    return () => {
      cancelled = true;
    };
  }, [props, subtitle, title, translate, language, prepareLanguageModel, sourceSections]);

  const onBack = () => {
    if (backTo) {
      router.replace(backTo as any);
      return;
    }
    router.back();
  };

  const toggleCard = (cardKey: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  const resolvedSubtitle = useMemo(() => {
    if (subtitle) return translatedSubtitle;
    return '';
  }, [subtitle, translatedSubtitle]);

  return (
    <Screen title={translatedTitle} subtitle={resolvedSubtitle}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={22} color="#1b5e20" />
        <Text style={styles.backText}>{ui.back}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {(() => {
          let sn = 1;
          return translatedSections.flatMap((section, sectionIdx) => {
            const header = section.title ? (
              <Text key={`section_${sectionIdx}`} style={styles.groupTitle}>
                {section.title}
              </Text>
            ) : null;

            const cards = section.items.map((d, idx) => {
              const currentSn = sn++;
              const cardKey = `${d.name}_${sectionIdx}_${idx}`;
              const isExpanded = expandedCards[cardKey] || false;

              return (
                <TouchableOpacity
                  key={cardKey}
                  style={[styles.card, isExpanded && styles.cardExpanded]}
                  onPress={() => toggleCard(cardKey)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{currentSn}</Text>
                      </View>
                      <View style={styles.nameContainer}>
                        <Text style={styles.diseaseName}>{d.name}</Text>
                      </View>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color="#2e7d32"
                    />
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      {d.organism && (
                        <View style={styles.detailSection}>
                          <View style={styles.sectionHeaderRow}>
                            <MaterialCommunityIcons
                              name="bacteria"
                              size={18}
                              color="#2e7d32"
                            />
                            <Text style={styles.sectionTitleBold}>{ui.organism}</Text>
                          </View>
                          <Text style={styles.sectionBodyText}>{d.organism}</Text>
                        </View>
                      )}

                      {d.symptoms?.length ? (
                        <View style={[styles.detailSection, { borderLeftColor: '#1565C0' }]}>
                          <View style={styles.sectionHeaderRow}>
                            <MaterialCommunityIcons
                              name="alert-circle"
                              size={18}
                              color="#1565C0"
                            />
                            <Text style={[styles.sectionTitleBold, { color: '#1565C0' }]}>
                              {ui.symptoms}
                            </Text>
                          </View>
                          {d.symptoms.map((s, i) => (
                            <Text key={i} style={styles.bulletItem}>
                              • {s}
                            </Text>
                          ))}
                        </View>
                      ) : null}

                      {d.treatment?.length ? (
                        <View style={[styles.detailSection, { borderLeftColor: '#2e7d32' }]}>
                          <View style={styles.sectionHeaderRow}>
                            <MaterialCommunityIcons
                              name="pill"
                              size={18}
                              color="#2e7d32"
                            />
                            <Text style={[styles.sectionTitleBold, { color: '#2e7d32' }]}>
                              {ui.treatment}
                            </Text>
                          </View>
                          {d.treatment.map((t, i) => (
                            <Text key={i} style={[styles.bulletItem, { color: '#1b5e20' }]}>
                              • {t}
                            </Text>
                          ))}
                        </View>
                      ) : null}

                      {d.how?.length ? (
                        <View style={[styles.detailSection, { borderLeftColor: '#ef6c00' }]}>
                          <View style={styles.sectionHeaderRow}>
                            <MaterialCommunityIcons
                              name="cog"
                              size={18}
                              color="#ef6c00"
                            />
                            <Text style={[styles.sectionTitleBold, { color: '#ef6c00' }]}>
                              {ui.howToTreat}
                            </Text>
                          </View>
                          {d.how.map((h, i) => (
                            <Text key={i} style={[styles.bulletItem, { color: '#bf360c' }]}>
                              • {h}
                            </Text>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  )}
                </TouchableOpacity>
              );
            });

            return header ? [header, ...cards] : cards;
          });
        })()}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#F0F7F0',
  },
  backText: {
    fontSize: 15,
    color: '#1b5e20',
    fontWeight: '700',
  },
  list: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1b5e20',
    marginTop: 14,
    marginBottom: 12,
    paddingLeft: 4,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E0E8E4',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardExpanded: {
    borderColor: '#2e7d32',
    borderWidth: 2,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.15,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FAFCFB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C8E6C9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1b5e20',
  },
  nameContainer: {
    flex: 1,
  },
  diseaseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#1b5e20',
    letterSpacing: 0.2,
  },
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },
  detailSection: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitleBold: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2e7d32',
    letterSpacing: 0.2,
  },
  sectionBodyText: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 19,
    fontWeight: '500',
  },
  bulletItem: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 20,
    marginBottom: 6,
    fontWeight: '500',
  },
});
