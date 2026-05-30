'use client';
import { useState, ReactNode, useCallback, useEffect } from 'react';
import { TranslationContext, translateText, DEFAULT_ACCESSIBILITY, AccessibilityState } from './useTranslation';

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [langCode, setLangState] = useState('en');
  const [accessibility, setAccessibilityState] = useState<AccessibilityState>(DEFAULT_ACCESSIBILITY);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedLang = localStorage.getItem('t2p_language');
      if (savedLang) {
        setLangState(savedLang);
      }
      const savedAcc = localStorage.getItem('t2p_accessibility');
      if (savedAcc) {
        setAccessibilityState(JSON.parse(savedAcc));
      }
    } catch (e) {
      console.error('Error loading preferences from localStorage:', e);
    }
  }, []);

  const setLangCode = useCallback((code: string) => {
    setLangState(code);
    try {
      localStorage.setItem('t2p_language', code);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const setAccessibility = useCallback((settings: AccessibilityState) => {
    setAccessibilityState(settings);
    try {
      localStorage.setItem('t2p_accessibility', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Apply accessibility styles
  useEffect(() => {
    if (!mounted) return;

    // Apply font size
    const root = document.documentElement;
    if (accessibility.largeText) {
      root.style.fontSize = '19px';
    } else {
      root.style.fontSize = '';
    }

    // Apply high contrast
    const body = document.body;
    if (accessibility.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
  }, [accessibility, mounted]);

  const t = useCallback(
    (text: string) => translateText(text, langCode),
    [langCode]
  );

  return (
    <TranslationContext.Provider value={{ langCode, setLangCode, t, accessibility, setAccessibility }}>
      {children}
    </TranslationContext.Provider>
  );
}