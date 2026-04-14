'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { translations, LanguageCode } from '@/i18n/translations'

interface LanguageStore {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  toggleLanguage: () => void
  t: (typeof translations)[LanguageCode]
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang: LanguageCode) => set({ language: lang }),
      toggleLanguage: () => {
        const current = get().language
        const next = current === 'en' ? 'es' : 'en'
        set({ language: next })
      },
      t: translations.en
    }),
    {
      name: 'language-store'
    }
  )
)

export function useTranslation() {
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage)
  const t = translations[language]

  return {
    language,
    setLanguage,
    toggleLanguage,
    t
  }
}

export default useLanguageStore
