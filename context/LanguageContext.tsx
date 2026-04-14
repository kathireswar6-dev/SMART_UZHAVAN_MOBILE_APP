import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    APP_LANGUAGES,
    deleteModel,
    detectSourceLanguage,
    ensureModelDownloaded,
    isAutoDetectSupported,
    isModelDeletionSupported,
    isModelDownloaded,
    translateWithMlKit,
} from "./mlKitTranslator";
import { translations } from "./translations";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  translate: (text: string) => Promise<string>;
  prepareLanguageModel: (lang?: string) => Promise<boolean>;
  isLanguageModelReady: (lang?: string) => Promise<boolean>;
  removeLanguageModel: (lang?: string) => Promise<boolean>;
  detectLanguage: (text: string) => Promise<string>;
  availableAppLanguages: readonly string[];
  modelDeletionSupported: boolean;
  autoDetectSupported: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const normalizeTranslationKey = (value: string) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const normalizedDictionaryIndex: Record<string, Record<string, string>> =
  Object.entries(translations).reduce((acc, [lang, dict]) => {
    const normalizedMap: Record<string, string> = {};
    Object.entries(dict).forEach(([key, translated]) => {
      const normalizedKey = normalizeTranslationKey(key);
      if (normalizedKey && !(normalizedKey in normalizedMap)) {
        normalizedMap[normalizedKey] = translated;
      }
    });
    acc[lang] = normalizedMap;
    return acc;
  }, {} as Record<string, Record<string, string>>);

// Local translation from dictionary
const translateFromDictionary = async (text: string, targetLang: string) => {
  if (!text || !targetLang) return text;
  
  const langDict = translations[targetLang];
  if (!langDict) {
    console.warn(`Translation dictionary not found for language: ${targetLang}`);
    return text;
  }
  
  // Return translated text if found, otherwise return original
  const exactMatch = langDict[text];
  if (exactMatch) return exactMatch;

  const normalizedTextKey = normalizeTranslationKey(text);
  if (!normalizedTextKey) return text;

  const normalizedMap = normalizedDictionaryIndex[targetLang];
  return normalizedMap?.[normalizedTextKey] || text;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved language from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("preferredLanguage");
        if (saved) setLanguageState(saved);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    await AsyncStorage.setItem("preferredLanguage", lang);

    if (lang !== "en") {
      // Do not block UI/navigation on model download; dictionary fallback remains available.
      ensureModelDownloaded(lang).catch((error) => {
        console.warn("ML Kit model preparation failed, using dictionary fallback:", error);
      });
    }
  };

  const prepareLanguageModel = useCallback(async (lang?: string) => {
    const target = lang || language;
    try {
      return await ensureModelDownloaded(target);
    } catch {
      return false;
    }
  }, [language]);

  const isLanguageModelReady = useCallback(async (lang?: string) => {
    const target = lang || language;
    try {
      return await isModelDownloaded(target);
    } catch {
      return false;
    }
  }, [language]);

  const removeLanguageModel = useCallback(async (lang?: string) => {
    const target = lang || language;
    if (!isModelDeletionSupported()) return false;
    try {
      return await deleteModel(target);
    } catch {
      return false;
    }
  }, [language]);

  const detectLanguage = useCallback(async (text: string) => {
    try {
      return await detectSourceLanguage(text);
    } catch {
      return "en";
    }
  }, []);

  const translate = useCallback(
    async (text: string) => {
      if (!text) return text;
      if (language === "en") return text;

      // Prefer curated in-app dictionary for stable UI translations.
      const dictResult = await translateFromDictionary(text, language);
      if (dictResult && dictResult !== text) {
        return dictResult;
      }

      try {
        const mlKitResult = await translateWithMlKit(text, language);
        if (mlKitResult && mlKitResult.trim() && mlKitResult !== text) {
          return mlKitResult;
        }
      } catch {
      }

      return dictResult;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        translate,
        prepareLanguageModel,
        isLanguageModelReady,
        removeLanguageModel,
        detectLanguage,
        availableAppLanguages: APP_LANGUAGES,
        modelDeletionSupported: isModelDeletionSupported(),
        autoDetectSupported: isAutoDetectSupported(),
      }}
    >
      {isHydrated ? children : null}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
