import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  icon?: string;
};

export default function Input(props: Props) {
  const { icon, style, placeholderTextColor, ...rest } = props;
  return (
    <View style={[styles.wrapper, style as any]}>
      {icon ? <Ionicons name={icon as any} size={18} color="#6b6b6b" style={styles.icon} /> : null}
      <TextInput
        {...rest}
        placeholderTextColor={placeholderTextColor || '#90A4AE'}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  icon: { marginRight: 12, color: '#546E7A' },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#263238', fontWeight: '400' },
});
