export const SUPPORTED_UI_LANGUAGES = [
  'en',
  'vi',
  'ja',
  'ko',
  'zh-Hans',
  'zh-Hant',
  'de',
  'fr',
  'es',
  'pt-BR',
  'it',
  'tr',
  'ar',
  'id',
  'th',
  'hi',
  'ru',
  'nl',
  'pl',
  'sv',
  'ms',
  'fil'
];

export const UI_LANGUAGE_NAMES = {
  en: 'English',
  vi: 'Vietnamese',
  ja: 'Japanese',
  ko: 'Korean',
  'zh-Hans': 'Simplified Chinese',
  'zh-Hant': 'Traditional Chinese',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  'pt-BR': 'Brazilian Portuguese',
  it: 'Italian',
  tr: 'Turkish',
  ar: 'Arabic',
  id: 'Indonesian',
  th: 'Thai',
  hi: 'Hindi',
  ru: 'Russian',
  nl: 'Dutch',
  pl: 'Polish',
  sv: 'Swedish',
  ms: 'Malay',
  fil: 'Filipino'
};

const LANGUAGE_ALIASES = {
  english: 'en',
  vietnamese: 'vi',
  japanese: 'ja',
  korean: 'ko',
  chinese: 'zh-Hans',
  mandarin: 'zh-Hans',
  german: 'de',
  french: 'fr',
  spanish: 'es',
  portuguese: 'pt-BR',
  brazilian: 'pt-BR',
  italian: 'it',
  turkish: 'tr',
  arabic: 'ar',
  indonesian: 'id',
  thai: 'th',
  hindi: 'hi',
  russian: 'ru',
  dutch: 'nl',
  polish: 'pl',
  swedish: 'sv',
  malay: 'ms',
  filipino: 'fil',
  tagalog: 'fil',
  zh: 'zh-Hans',
  'zh-cn': 'zh-Hans',
  'zh-hans': 'zh-Hans',
  'zh-sg': 'zh-Hans',
  'zh-tw': 'zh-Hant',
  'zh-hk': 'zh-Hant',
  'zh-mo': 'zh-Hant',
  'zh-hant': 'zh-Hant',
  pt: 'pt-BR',
  'pt-br': 'pt-BR',
  'pt_br': 'pt-BR',
  ar: 'ar',
  id: 'id',
  in: 'id',
  th: 'th',
  hi: 'hi',
  ru: 'ru',
  nl: 'nl',
  pl: 'pl',
  sv: 'sv',
  ms: 'ms',
  fil: 'fil',
  tl: 'fil'
};

export function normalizeLocale(value, fallback = 'en') {
  if (typeof value !== 'string') return fallback;

  const raw = value.trim();
  if (!raw) return fallback;

  const cleaned = raw.replace(/_/g, '-');
  const lower = cleaned.toLowerCase();

  if (LANGUAGE_ALIASES[lower]) return LANGUAGE_ALIASES[lower];

  const exactMatch = SUPPORTED_UI_LANGUAGES.find(locale => locale.toLowerCase() === lower);
  if (exactMatch) return exactMatch;

  const base = lower.split('-')[0];
  if (LANGUAGE_ALIASES[base]) return LANGUAGE_ALIASES[base];

  const baseMatch = SUPPORTED_UI_LANGUAGES.find(locale => locale.toLowerCase() === base);
  return baseMatch || fallback;
}

export function normalizeLearningLanguage(value, fallback = 'en') {
  // The app is an English-speaking practice product today. Keeping this normalized
  // leaves room for future products without changing the API contract again.
  return normalizeLocale(value || fallback, fallback) === 'en' ? 'en' : fallback;
}

export function getLanguageName(locale) {
  const normalized = normalizeLocale(locale);
  return UI_LANGUAGE_NAMES[normalized] || UI_LANGUAGE_NAMES.en;
}
