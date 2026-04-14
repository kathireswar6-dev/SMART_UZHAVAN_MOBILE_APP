import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'te', label: 'తెలుగు' },
];

type Props = {
  compact?: boolean;
};

export default function CompactLanguageSelector({ compact = true }: Props) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const activeLanguage = useMemo(
    () => LANGUAGES.find((item) => item.code === language) || LANGUAGES[0],
    [language]
  );

  const handleSelect = async (code: string) => {
    setOpen(false);
    if (code === language) return;
    await setLanguage(code);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.trigger, compact && styles.triggerCompact]}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.85}
      >
        <Ionicons name="language" size={15} color="#fff" />
        <Text style={styles.triggerText} numberOfLines={1}>
          {activeLanguage.label}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color="#fff" />
      </TouchableOpacity>

      {open ? (
        <View style={styles.menu}>
          {LANGUAGES.map((item) => {
            const selected = item.code === language;
            return (
              <TouchableOpacity
                key={item.code}
                style={[styles.menuItem, selected && styles.menuItemSelected]}
                onPress={() => void handleSelect(item.code)}
                activeOpacity={0.85}
              >
                <Text style={[styles.menuText, selected && styles.menuTextSelected]}>{item.label}</Text>
                {selected ? <Ionicons name="checkmark" size={16} color="#1b5e20" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 50,
  },
  trigger: {
    minWidth: 112,
    maxWidth: 150,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2e7d32',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    shadowColor: '#1b5e20',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  triggerCompact: {
    minWidth: 106,
  },
  triggerText: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  menu: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dce8dd',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemSelected: {
    backgroundColor: '#eef7ee',
  },
  menuText: {
    color: '#1f2d1f',
    fontSize: 13,
    fontWeight: '600',
  },
  menuTextSelected: {
    color: '#1b5e20',
    fontWeight: '800',
  },
});