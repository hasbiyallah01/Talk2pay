'use client';
import { createContext, useContext } from 'react';

export type Language = {
  code: string;
  label: string;
  native: string;
};

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'pcm', label: 'Pigin', native: 'Pigin' },
  { code: 'yo', label: 'Yoruba', native: 'Yoruba' },
  { code: 'ig', label: 'Igbo', native: 'Igbo' },
  { code: 'ha', label: 'Hausa', native: 'Hausa' },
];

export type AccessibilityState = {
  voiceMode: boolean;
  largeText: boolean;
  highContrast: boolean;
  hapticFeedback: boolean;
  screenReader: boolean;
};

export const DEFAULT_ACCESSIBILITY: AccessibilityState = {
  voiceMode: true,
  largeText: false,
  highContrast: false,
  hapticFeedback: false,
  screenReader: false,
};

export type TranslationContextType = {
  langCode: string;
  setLangCode: (code: string) => void;
  t: (text: string) => Promise<string>;
  accessibility: AccessibilityState;
  setAccessibility: (settings: AccessibilityState) => void;
};

export const TranslationContext = createContext<TranslationContextType>({
  langCode: 'en',
  setLangCode: () => { },
  t: async (text) => text,
  accessibility: DEFAULT_ACCESSIBILITY,
  setAccessibility: () => { },
});

export const useTranslation = () => useContext(TranslationContext);

// MyMemory free translation API — no key required, 5000 chars/day free
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'en') return text;
  // Nigerian Pidgin isn't on MyMemory — fall back to English gracefully
  if (targetLang === 'pcm') return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
    return text;
  } catch {
    return text;
  }
}