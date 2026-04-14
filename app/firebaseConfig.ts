/* eslint-disable @typescript-eslint/no-require-imports */

import { isSupported as analyticsIsSupported, getAnalytics } from "firebase/analytics";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let initializeAuth: any = undefined;
let getReactNativePersistence: any = undefined;
let AsyncStorage: any = undefined;
let _firebaseAuthPersistenceChoice: string = "memory";
try {
  const rnAuth = require("firebase/auth/react-native");
  initializeAuth = rnAuth.initializeAuth;
  getReactNativePersistence = rnAuth.getReactNativePersistence;
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
  _firebaseAuthPersistenceChoice = "@react-native-async-storage/async-storage";
} catch {
  try {
    const SecureStore = require("expo-secure-store");
    if (SecureStore && SecureStore.getItemAsync) {
      const mapKey = (k: string) => {
        if (!k) return "fsa__empty_key";
        let h = 5381;
        for (let i = 0; i < k.length; i++) h = (h * 33) ^ k.charCodeAt(i);
        const hex = (h >>> 0).toString(16);
        return `fsa_${hex}`;
      };
      AsyncStorage = {
        async getItem(key: string) {
          const sk = mapKey(key);
          const v = await SecureStore.getItemAsync(sk);
          return v === null ? null : v;
        },
        async setItem(key: string, value: string) {
          const sk = mapKey(key);
          await SecureStore.setItemAsync(sk, value);
        },
        async removeItem(key: string) {
          const sk = mapKey(key);
          await SecureStore.deleteItemAsync(sk);
        },
      } as any;
      console.info("Using expo-secure-store as a persistence fallback for Firebase Auth.");
      _firebaseAuthPersistenceChoice = "expo-secure-store-fallback";
    }
  } catch {}
}

try {
  const authMain = require("firebase/auth");
  if (!initializeAuth && authMain && authMain.initializeAuth) {
    initializeAuth = authMain.initializeAuth;
  }
  if (!getReactNativePersistence && authMain && authMain.getReactNativePersistence) {
    getReactNativePersistence = authMain.getReactNativePersistence;
  }
  if (!AsyncStorage) {
    try {
      const rnAsync = require("@react-native-async-storage/async-storage").default;
      if (rnAsync) {
        AsyncStorage = rnAsync;
        _firebaseAuthPersistenceChoice = "@react-native-async-storage/async-storage";
      }
    } catch {}
  }
} catch {}

const firebaseConfig = {
  apiKey: "AIzaSyAgVu4MuzCMrLH4d8K514_5_wob4Cj722Y",
  authDomain: "smart-uzhavan-15004.firebaseapp.com",
  projectId: "smart-uzhavan-15004",
  storageBucket: "smart-uzhavan-15004.firebaseapp.com",
  messagingSenderId: "74361928799",
  appId: "1:74361928799:web:e9d7557af8852203f3efea",
  measurementId: "G-31LJEE9R07",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig as any);
}

let auth: any;
if (initializeAuth && getReactNativePersistence && AsyncStorage) {
  try {
    auth = initializeAuth(app as any, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.info("Firebase auth initialized via initializeAuth with native persistence.");
  } catch (err) {
    console.warn("initializeAuth failed, falling back to getAuth + setPersistence:", err);
    try {
      auth = getAuth(app as any);
      if (getReactNativePersistence && AsyncStorage) {
        const persistence = getReactNativePersistence(AsyncStorage);
        setPersistence(auth, persistence)
          .then(() => {
            console.info("setPersistence succeeded using React Native persistence.");
          })
          .catch((e: any) => {
            console.warn("setPersistence failed:", e);
          });
      }
    } catch (e) {
      console.warn("Firebase auth final fallback to getAuth:", e);
      auth = getAuth(app as any);
    }
  }
} else {
  auth = getAuth(app as any);
}

console.info(`Firebase Auth persistence choice: ${_firebaseAuthPersistenceChoice}`);
console.info(
  `initializeAuth available: ${Boolean(initializeAuth)}, getReactNativePersistence available: ${Boolean(
    getReactNativePersistence
  )}`
);

export { auth };

// Initialize Firestore
const db = getFirestore(app as any);
export { db };

let analytics: any = undefined;
(async () => {
  try {
    if (await analyticsIsSupported()) {
      analytics = getAnalytics(app as any);
    }
  } catch {}
})();

export { analytics };
export default firebaseConfig;