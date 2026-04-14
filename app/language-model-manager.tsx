import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ModelState = {
  ready: boolean;
  loading: boolean;
};

const LABELS: Record<string, string> = {
  en: 'English',
  ta: 'Tamil',
  ml: 'Malayalam',
  hi: 'Hindi',
  kn: 'Kannada',
  te: 'Telugu',
};

export default function LanguageModelManagerScreen() {
  const {
    translate,
    availableAppLanguages,
    prepareLanguageModel,
    isLanguageModelReady,
    removeLanguageModel,
    modelDeletionSupported,
    autoDetectSupported,
  } = useLanguage();

  const [ui, setUi] = useState({
    title: 'Offline Language Models',
    subtitle: 'Download language models for offline translation.',
    back: 'Back',
    downloaded: 'Downloaded',
    notDownloaded: 'Not downloaded',
    download: 'Download',
    delete: 'Delete',
    downloading: 'Downloading...',
    deleting: 'Deleting...',
    refresh: 'Refresh',
    autoDetect: 'Auto-detect input language',
    supported: 'Supported',
    notSupported: 'Not supported',
    deleteUnsupported: 'Delete model is not supported by this ML Kit wrapper.',
    failedAction: 'Failed to update language model.',
  });

  const [models, setModels] = useState<Record<string, ModelState>>({});
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      setUi({
        title: await translate('Offline Language Models'),
        subtitle: await translate('Download language models for offline translation.'),
        back: await translate('Back'),
        downloaded: await translate('Downloaded'),
        notDownloaded: await translate('Not downloaded'),
        download: await translate('Download'),
        delete: await translate('Delete'),
        downloading: await translate('Downloading...'),
        deleting: await translate('Deleting...'),
        refresh: await translate('Refresh'),
        autoDetect: await translate('Auto-detect input language'),
        supported: await translate('Supported'),
        notSupported: await translate('Not supported'),
        deleteUnsupported: await translate('Delete model is not supported by this ML Kit wrapper.'),
        failedAction: await translate('Failed to update language model.'),
      });
    })();
  }, [translate]);

  const languageRows = useMemo(
    () => availableAppLanguages.filter((c) => c !== 'en'),
    [availableAppLanguages]
  );

  const refreshStatus = async () => {
    setChecking(true);
    const entries = await Promise.all(
      languageRows.map(async (code) => {
        const ready = await isLanguageModelReady(code);
        return [code, { ready, loading: false }] as const;
      })
    );
    setModels(Object.fromEntries(entries));
    setChecking(false);
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const setLoading = (code: string, loading: boolean) => {
    setModels((prev) => ({
      ...prev,
      [code]: {
        ...(prev[code] || { ready: false, loading: false }),
        loading,
      },
    }));
  };

  const handleDownload = async (code: string) => {
    try {
      setLoading(code, true);
      await prepareLanguageModel(code);
      const ready = await isLanguageModelReady(code);
      setModels((prev) => ({
        ...prev,
        [code]: { ready, loading: false },
      }));
    } catch {
      setLoading(code, false);
      Alert.alert(ui.failedAction);
    }
  };

  const handleDelete = async (code: string) => {
    if (!modelDeletionSupported) {
      Alert.alert(ui.deleteUnsupported);
      return;
    }

    try {
      setLoading(code, true);
      await removeLanguageModel(code);
      const ready = await isLanguageModelReady(code);
      setModels((prev) => ({
        ...prev,
        [code]: { ready, loading: false },
      }));
    } catch {
      setLoading(code, false);
      Alert.alert(ui.failedAction);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1b5e20" />
          <Text style={styles.backText}>{ui.back}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.refreshBtn} onPress={refreshStatus}>
          <Ionicons name="refresh" size={16} color="#1b5e20" />
          <Text style={styles.refreshText}>{ui.refresh}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{ui.title}</Text>
        <Text style={styles.subtitle}>{ui.subtitle}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{ui.autoDetect}</Text>
          <Text style={styles.infoValue}>{autoDetectSupported ? ui.supported : ui.notSupported}</Text>
        </View>

        {checking ? (
          <ActivityIndicator size="large" color="#2e7d32" />
        ) : (
          languageRows.map((code) => {
            const state = models[code] || { ready: false, loading: false };
            return (
              <View key={code} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.langName}>{LABELS[code] || code.toUpperCase()}</Text>
                  <Text style={styles.statusText}>
                    {state.ready ? ui.downloaded : ui.notDownloaded}
                  </Text>
                </View>

                {state.loading ? (
                  <View style={styles.actionBtn}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.actionText}>{state.ready ? ui.deleting : ui.downloading}</Text>
                  </View>
                ) : state.ready ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, !modelDeletionSupported && styles.actionBtnDisabled]}
                    onPress={() => handleDelete(code)}
                  >
                    <Text style={styles.actionText}>{ui.delete}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDownload(code)}>
                    <Text style={styles.actionText}>{ui.download}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4faf4' },
  headerRow: {
    paddingTop: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: '#1b5e20', fontWeight: '700' },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  refreshText: { color: '#1b5e20', fontWeight: '700' },
  container: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: '#1b5e20' },
  subtitle: { marginTop: 6, color: '#4c6f4e', marginBottom: 14 },
  infoCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#c8e6c9',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoTitle: { fontWeight: '700', color: '#1b5e20' },
  infoValue: { marginTop: 4, color: '#2e7d32', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderColor: '#d9ead9',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  langName: { fontSize: 16, fontWeight: '700', color: '#1b5e20' },
  statusText: { marginTop: 4, color: '#4c6f4e' },
  actionBtn: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 96,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnDisabled: { backgroundColor: '#9e9e9e' },
  actionText: { color: '#fff', fontWeight: '700' },
});
