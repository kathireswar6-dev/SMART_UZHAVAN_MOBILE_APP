import Constants from 'expo-constants';
import { Platform } from 'react-native';

function extractHostIp(hostValue?: string | null) {
  if (!hostValue) return null;
  const normalized = hostValue.replace(/^https?:\/\//, '');
  const host = normalized.split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return host;
}

function resolveExpoHostIp() {
  try {
    const candidates = [
      (Constants as any)?.expoConfig?.hostUri,
      (Constants as any)?.manifest?.debuggerHost,
      (Constants as any)?.manifest2?.debuggerHost,
      (Constants as any)?.manifest2?.extra?.expoClient?.hostUri,
    ];

    for (const value of candidates) {
      const resolved = extractHostIp(typeof value === 'string' ? value : null);
      if (resolved) return resolved;
    }
  } catch {}

  return null;
}

function resolveBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
  if (envUrl) {
    console.log('[API] Using BACKEND_URL from env:', envUrl);
    return (envUrl as string).replace(/\/$/, '');
  }

  // Prefer native platform checks first; window may exist in RN dev runtime
  const expoHostIp = resolveExpoHostIp();
  if (expoHostIp) {
    const resolved = `http://${expoHostIp}:5000`;
    console.log('[API] Using Expo host IP:', resolved);
    return resolved;
  }

  // Check expo config extras (app.json/app.config) as a fallback.
  // This may become stale when local IP changes, so it is intentionally lower priority than Expo host detection.
  try {
    const extra = (Constants as any).manifest?.extra || (Constants as any).expoConfig?.extra || (Constants as any).manifest2?.extra;
    if (extra && extra.backendUrl) {
      const normalized = String(extra.backendUrl).replace(/\/$/, '');
      console.log('[API] Using backendUrl from Expo extras:', normalized);
      return normalized;
    }
  } catch {}

  if (Platform.OS === 'android') {
    const dbg = (Constants as any)?.manifest?.debuggerHost || (Constants as any)?.manifest2?.debuggerHost;
    console.log('[API] Android debuggerHost:', dbg);
    if (dbg && typeof dbg === 'string') {
      const ip = dbg.split(':')[0];
      if (ip === 'localhost' || ip === '127.0.0.1') {
        return 'http://10.0.2.2:5000';
      }
      return `http://${ip}:5000`;
    }
    return 'http://10.0.2.2:5000';
  }

  if (Platform.OS === 'ios') {
    return 'http://localhost:5000';
  }

  // Web fallback
  if (typeof window !== 'undefined') {
    return 'http://localhost:5000';
  }

  return 'http://10.0.2.2:5000';
}

const BASE_URL = resolveBaseUrl();
console.log('[API] Resolved BASE_URL:', BASE_URL);

export { BASE_URL };

export async function predictDiseaseWithImage({ uri, selected_crop, user_id, img_data_url }: {
  uri?: string;
  selected_crop?: string | null;
  user_id?: string | null;
  img_data_url?: string | null;
}) {
  const form = new FormData();
  if (uri) {
    const name = uri.split('/').pop() || `photo_${Date.now()}.jpg`;
    let type = 'image/jpeg';
    if (name.endsWith('.png')) type = 'image/png';
    if (name.endsWith('.webp')) type = 'image/webp';
    // @ts-ignore
    form.append('file', { uri, name, type });
  }
  if (img_data_url) form.append('img_data_url', img_data_url);
  if (selected_crop) form.append('selected_crop', selected_crop);
  if (user_id) form.append('user_id', user_id);

  try {
    console.log('[API] Sending prediction request to:', `${BASE_URL}/predict-disease`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(`${BASE_URL}/predict-disease`, {
      method: 'POST',
      headers: {} as any,
      body: form as any,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error('[API] Server returned error status:', res.status);
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error || `HTTP ${res.status}: Server error`);
    }

    const data = await res.json();
    console.log('[API] Prediction successful:', data);
    return data;
  } catch (error: any) {
    console.error('[API] Prediction error:', error?.message || error);
    const errorMsg = error?.message || 'Unknown error';
    if (errorMsg.includes('Failed to download') || errorMsg.includes('Network') || errorMsg.includes('AbortError')) {
      throw new Error(`Network Error: Cannot reach backend at ${BASE_URL}. Make sure:\n1. Backend server is running\n2. Phone and PC are on same WiFi\n3. Firewall is not blocking port 5000`);
    }
    throw error;
  }
}

export async function predictDiseaseWithImages({ uris, selected_crop, user_id }: {
  uris: string[];
  selected_crop?: string | null;
  user_id?: string | null;
}) {
  const form = new FormData();
  uris.forEach((uri, idx) => {
    const name = uri.split('/').pop() || `photo_${Date.now()}_${idx}.jpg`;
    let type = 'image/jpeg';
    if (name.endsWith('.png')) type = 'image/png';
    if (name.endsWith('.webp')) type = 'image/webp';
    // @ts-ignore
    form.append('file', { uri, name, type });
  });
  if (selected_crop) form.append('selected_crop', selected_crop);
  if (user_id) form.append('user_id', user_id);

  try {
    console.log('[API] Sending multi-image prediction request to:', `${BASE_URL}/predict-disease`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    const res = await fetch(`${BASE_URL}/predict-disease`, {
      method: 'POST',
      headers: {} as any,
      body: form as any,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error || `HTTP ${res.status}: Server error`);
    }

    const data = await res.json();
    console.log('[API] Multi-image prediction successful:', data);
    return data;
  } catch (error: any) {
    console.error('[API] Multi-image prediction error:', error?.message || error);
    const errorMsg = error?.message || 'Unknown error';
    if (errorMsg.includes('Failed to download') || errorMsg.includes('Network') || errorMsg.includes('AbortError')) {
      throw new Error(`Network Error: Cannot reach backend at ${BASE_URL}. Make sure:\n1. Backend server is running\n2. Phone and PC are on same WiFi\n3. Firewall is not blocking port 5000`);
    }
    throw error;
  }
}

export async function getCropList() {
  const res = await fetch(`${BASE_URL}/crop-list`);
  return res.json();
}

export async function registerUser(data: any) {
  const res = await fetch(`${BASE_URL}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
}

export async function recommendCrop(payload: any) {
  const url = `${BASE_URL}/recommend-crop`;
  console.log('[API] Sending crop recommendation request to:', url, 'payload:', payload);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || `HTTP ${res.status}: Failed to get crop recommendation`);
  }

  return data;
}

export async function sendChatMessage(
  message: string,
  history?: Array<{ role: 'user' | 'assistant'; text: string }>
) {
  const url = `${BASE_URL}/chat`;
  console.log('[API] Sending chat message:', message);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: history || [] }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error((data as any)?.error || `HTTP ${res.status}: Chat request failed`);
    }

    console.log('[API] Chat response received');
    return data;
  } catch (error: any) {
    console.error('[API] Chat error:', error?.message || error);
    throw error;
  }
}

export async function getPredictions(user_id: string) {
  const res = await fetch(`${BASE_URL}/predictions?user_id=${encodeURIComponent(user_id)}`);
  return res.json();
}

export async function getLastPrediction() {
  const res = await fetch(`${BASE_URL}/last-prediction`);
  return res.json();
}

export async function deletePredictions(user_id: string) {
  const res = await fetch(`${BASE_URL}/predictions?user_id=${encodeURIComponent(user_id)}`, { method: 'DELETE' });
  return res.json();
}

export function getSpeechAudioUrl(text: string, language: string) {
  // Keep query size small for reliable mobile GET requests.
  const safeText = (text || '').trim().slice(0, 500);
  return `${BASE_URL}/tts?text=${encodeURIComponent(safeText)}&lang=${encodeURIComponent(language)}`;
}

export default { BASE_URL };