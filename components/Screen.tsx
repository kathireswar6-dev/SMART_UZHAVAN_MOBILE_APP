import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function Screen({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.card}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFB' },
  scroll: { padding: 20, paddingTop: 16, alignItems: 'center' },
  header: { width: '100%', marginBottom: 16, alignItems: 'flex-start' },
  title: { fontSize: 24, fontWeight: '700', color: '#4A6B3A' },
  subtitle: { fontSize: 15, color: '#546E7A', marginTop: 8, fontWeight: '400' },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
});
