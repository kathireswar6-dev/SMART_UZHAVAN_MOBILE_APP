import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL, getPredictions } from './api';

export default function History() {
  const { translate } = useLanguage();
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [, setLoading] = useState(false);
  
  const [ui, setUi] = useState({
    title: "Prediction History",
    subtitle: "View your past crop predictions and diagnoses",
    noHistory: "No history yet",
    startAnalyzing: "Start analyzing crops to see predictions here",
    clearAll: "Clear All",
    images: "images",
    emptyBody: "Your prediction and diagnosis history will appear here once you start using the app.",
    goHome: "Go to Home",
    cropUpload: "Crop Upload",
    uploaded: "uploaded",
  });

  React.useEffect(() => {
    (async () => {
      setUi({
        title: await translate("Prediction History"),
        subtitle: await translate("View your past crop predictions and diagnoses"),
        noHistory: await translate("No history yet"),
        startAnalyzing: await translate("Start analyzing crops to see predictions here"),
        clearAll: await translate("Clear All"),
        images: await translate("images"),
        emptyBody: await translate("Your prediction and diagnosis history will appear here once you start using the app."),
        goHome: await translate("Go to Home"),
        cropUpload: await translate("Crop Upload"),
        uploaded: await translate("uploaded"),
      });
    })();
  }, [translate]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      setLoading(true);
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) return;
      // Try server-side history first
      try {
        const res = await getPredictions(userEmail);
        if (res && res.predictions) {
          // Normalize rows returned from server to client history shape
          const rows = res.predictions.map((r: any) => ({
            id: r.id?.toString() || `${r.date}_${Math.random()}`,
            date: r.date || r.created_at || new Date().toLocaleString(),
            imageCount: 1,
            images: [],
            img_url: r.img_url || null,
            prediction: r.disease || r.prediction || null,
            confidence: r.confidence,
          }));
          setHistoryItems(rows);
          setLoading(false);
          return;
        }
      } catch {
        // fallback to local AsyncStorage history when server call fails
      }

      const key = `history_${userEmail}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const history = JSON.parse(data);
        // Sort by date descending (newest first)
        history.sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
        setHistoryItems(history);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) return;

      const key = `history_${userEmail}`;
      const updated = historyItems.filter(item => item.id !== id);
      
      if (updated.length === 0) {
        await AsyncStorage.removeItem(key);
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(updated));
      }
      
      setHistoryItems(updated);
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.decorativeBlobLarge} />
      <View style={styles.decorativeBlobSmall} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#123824" />
          </TouchableOpacity>
          <Text style={styles.title}>{ui.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.subtitle}>{ui.subtitle}</Text>

        <View style={styles.card}>
          {historyItems.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="time-outline" size={48} color="#8da191" />
              </View>
              <Text style={styles.emptyTitle}>{ui.noHistory}</Text>
              <Text style={styles.emptyText}>
                {ui.emptyBody}
              </Text>
              <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/home')}>
                <Ionicons name="home-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.ctaText}>{ui.goHome}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.historyList}>
              {historyItems.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="leaf-outline" size={24} color="#1f8a4c" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{ui.cropUpload}</Text>
                    <Text style={styles.itemSubtitle}>{item.imageCount} {ui.images} {ui.uploaded}</Text>
                    <Text style={styles.itemDate}>{item.date}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    {(
                      (item.img_url && item.img_url.length > 0) || (item.images && item.images.length > 0)
                    ) && (
                      <View style={styles.thumbnails}>
                        {/* Server-stored thumbnail takes precedence */}
                        {item.img_url ? (
                          <Image
                            source={{ uri: item.img_url.startsWith('/') ? `${BASE_URL}${item.img_url}` : item.img_url }}
                            style={styles.thumbnail}
                          />
                        ) : (
                          item.images.slice(0, 3).map((img: any, idx: number) => (
                            <Image key={idx} source={{ uri: img.uri }} style={styles.thumbnail} />
                          ))
                        )}
                        {item.images && item.images.length > 3 && (
                          <View style={styles.moreThumbnails}>
                            <Text style={styles.moreText}>+{item.images.length - 3}</Text>
                          </View>
                        )}
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.deleteBtn}
                      onPress={() => deleteHistoryItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFB' },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  decorativeBlobLarge: {
    position: 'absolute',
    top: -120,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 180,
    backgroundColor: '#E3F2FD',
    opacity: 0.6,
  },
  decorativeBlobSmall: {
    position: 'absolute',
    top: 60,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 140,
    backgroundColor: '#F1F8FF',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#4A6B3A' },
  subtitle: {
    fontSize: 15,
    color: '#546E7A',
    marginBottom: 24,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    minHeight: 300,
  },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A6B3A',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  ctaBtn: {
    backgroundColor: '#6B9E4A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4A6B3A',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  historyList: { gap: 14 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#4A6B3A', marginBottom: 4 },
  itemSubtitle: { fontSize: 13, color: '#546E7A', marginBottom: 4 },
  itemDate: { fontSize: 12, color: '#8da191' },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumbnails: {
    flexDirection: 'row',
    gap: 4,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#E1E8ED',
  },
  moreThumbnails: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#6B9E4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 8,
  },
});
