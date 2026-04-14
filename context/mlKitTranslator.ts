type TranslateTextModule = {
  translate: (args: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
    downloadModelIfNeeded?: boolean;
    requireWifi?: boolean;
    requireCharging?: boolean;
  }) => Promise<string>;
};

type IdentifyLanguagesModule = {
  identify: (text: string) => Promise<string>;
  identifyPossible: (text: string) => Promise<Array<{ language: string; confidence: number }>>;
};

type MlKitLanguageModule = Record<string, string>;

let TranslateText: TranslateTextModule | null = null;
let TranslateLanguage: MlKitLanguageModule | null = null;
let IdentifyLanguages: IdentifyLanguagesModule | null = null;

try {
  const mod = require("@react-native-ml-kit/translate-text");
  TranslateText = mod.default ?? mod;
  TranslateLanguage = mod.TranslateLanguage ?? null;
} catch {
  TranslateText = null;
  TranslateLanguage = null;
}

try {
  const mod = require("@react-native-ml-kit/identify-languages");
  IdentifyLanguages = mod.default ?? mod;
} catch {
  IdentifyLanguages = null;
}

const LANGUAGE_CODE_MAP: Record<string, string> = {
  af: "AFRIKAANS",
  ar: "ARABIC",
  bn: "BENGALI",
  de: "GERMAN",
  en: "ENGLISH",
  es: "SPANISH",
  fr: "FRENCH",
  gu: "GUJARATI",
  hi: "HINDI",
  id: "INDONESIAN",
  it: "ITALIAN",
  ja: "JAPANESE",
  kn: "KANNADA",
  ko: "KOREAN",
  ml: "MALAYALAM",
  mr: "MARATHI",
  nl: "DUTCH",
  pt: "PORTUGUESE",
  ru: "RUSSIAN",
  ta: "TAMIL",
  te: "TELUGU",
  th: "THAI",
  tr: "TURKISH",
  ur: "URDU",
  vi: "VIETNAMESE",
  zh: "CHINESE",
};

export const APP_LANGUAGES = ["en", "ta", "ml", "hi", "kn", "te"] as const;

function normalizeLanguageCode(code?: string) {
  if (!code) return "en";
  const normalized = code.toLowerCase();
  if (normalized === "und") return "en";
  if (normalized.includes("-")) {
    return normalized.split("-")[0];
  }
  return normalized;
}

function getMlKitLanguage(code: string): string | null {
  if (!TranslateLanguage) return null;
  const key = LANGUAGE_CODE_MAP[normalizeLanguageCode(code)];
  if (!key) return null;
  return TranslateLanguage[key] ?? null;
}

function isTranslateReady() {
  return !!TranslateText && !!TranslateLanguage;
}

export function isAutoDetectSupported() {
  return !!IdentifyLanguages;
}

export function isModelDeletionSupported() {
  return false;
}

export async function detectSourceLanguage(text: string) {
  if (!IdentifyLanguages || !text?.trim()) return "en";
  try {
    const detected = await IdentifyLanguages.identify(text);
    return normalizeLanguageCode(detected);
  } catch {
    return "en";
  }
}

export async function isModelDownloaded(langCode: string) {
  if (!isTranslateReady()) return false;
  const source = getMlKitLanguage("en");
  const target = getMlKitLanguage(langCode);
  if (!source || !target) return false;
  if (normalizeLanguageCode(langCode) === "en") return true;

  try {
    await TranslateText!.translate({
      text: "hello",
      sourceLanguage: source,
      targetLanguage: target,
      downloadModelIfNeeded: false,
    });
    return true;
  } catch {
    return false;
  }
}

export async function ensureModelDownloaded(langCode: string) {
  if (!isTranslateReady()) return false;
  if (normalizeLanguageCode(langCode) === "en") return true;

  const source = getMlKitLanguage("en");
  const target = getMlKitLanguage(langCode);
  if (!source || !target) return false;

  try {
    await TranslateText!.translate({
      text: "hello",
      sourceLanguage: source,
      targetLanguage: target,
      downloadModelIfNeeded: true,
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteModel(_langCode: string) {
  return false;
}

export async function translateWithMlKit(
  text: string,
  targetLangCode: string,
  sourceLangCode?: string
) {
  if (!isTranslateReady()) return null;
  if (!text) return text;

  const normalizedTarget = normalizeLanguageCode(targetLangCode);
  if (normalizedTarget === "en") return text;

  let normalizedSource = normalizeLanguageCode(sourceLangCode);
  if (!sourceLangCode) {
    normalizedSource = await detectSourceLanguage(text);
  }

  if (normalizedSource === normalizedTarget) {
    return text;
  }

  const source = getMlKitLanguage(normalizedSource) || getMlKitLanguage("en");
  const target = getMlKitLanguage(normalizedTarget);
  if (!source || !target) return null;

  try {
    const translated = await TranslateText!.translate({
      text,
      sourceLanguage: source,
      targetLanguage: target,
      downloadModelIfNeeded: true,
    });
    return translated;
  } catch {
    return null;
  }
}
