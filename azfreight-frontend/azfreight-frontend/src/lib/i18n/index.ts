'use client';

import { useState, useCallback, useEffect } from 'react';
import en from './en';
import ru from './ru';
import az from './az';

export type Locale = 'en' | 'ru' | 'az';
export type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, ru, az };

// Helper function to access nested keys via dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return path;
  }, obj as unknown) as string;
}

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return (
        getNestedValue(
          translations[locale] as unknown as Record<string, unknown>,
          key
        ) || key
      );
    },
    [locale]
  );

  return { t, locale, setLocale, translations: translations[locale] };
}

export { en, ru, az };
