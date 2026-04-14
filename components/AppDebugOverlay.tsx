import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { DevSettings, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../app/api';
import { auth } from '../app/firebaseConfig';

export default function AppDebugOverlay({ pathname }: { pathname?: string }) {
  const [user, setUser] = useState<any | null>(null);
  // Show the overlay only when explicitly enabled in app.json extra or via a global flag.
  const manifestExtra = (Constants as any).manifest?.extra || (Constants as any).manifest2?.extra || {};
  const enabledGlobally = (global as any).__SHOW_DEBUG_OVERLAY === true || manifestExtra.showDebugOverlay === true;
  const [visible, setVisible] = useState(enabledGlobally);

  useEffect(() => {
    let unsub: any;
    try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        unsub = auth.onAuthStateChanged((u: any) => setUser(u));
      } else if ((auth as any)?.currentUser) {
        setUser((auth as any).currentUser);
      }
    } catch {
      // ignore
    }
    return () => unsub && unsub();
  }, []);

  if (!visible) {
    // Only show the collapsed DBG button when debug overlay is explicitly enabled.
    if (!enabledGlobally) return null;
    return (
      <TouchableOpacity style={styles.collapsed} onPress={() => setVisible(true)}>
        <Text style={{ color: '#fff' }}>DBG</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>DEBUG</Text>
        <Text style={styles.line}>Path: {pathname || 'unknown'}</Text>
        <Text style={styles.line}>BASE_URL: {(api && (api as any).BASE_URL) || 'unknown'}</Text>
        <Text style={styles.line}>User: {user ? (user.email || user.uid || 'signed-in') : 'none'}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={() => DevSettings.reload()}>
            <Text style={styles.btnText}>Reload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#666' }]} onPress={() => setVisible(false)}>
            <Text style={styles.btnText}>Hide</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 8, bottom: 12, zIndex: 9999 },
  box: { backgroundColor: '#000000cc', padding: 10, borderRadius: 8, minWidth: 220 },
  title: { color: '#fff', fontWeight: '700', marginBottom: 6 },
  line: { color: '#ddd', fontSize: 12, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  btn: { backgroundColor: '#2a9d8f', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: '600' },
  collapsed: { position: 'absolute', left: 8, bottom: 12, backgroundColor: '#000', padding: 6, borderRadius: 6, zIndex: 9999 },
});
