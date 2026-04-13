import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { translations } from '../utils/translations'

import { supabase } from '../lib/supabaseClient'

export const useLanguageStore = create(
    persist(
        (set, get) => ({
            language: 'en',
            setLanguage: async (lang) => {
                set({ language: lang })
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase.from('profiles').upsert({ id: user.id, language: lang })
                }
            },
            syncWithSupabase: (lang) => set({ language: lang }),
            t: (key) => {
                const lang = get().language
                return translations[lang][key] || key
            }
        }),
        {
            name: 'pomodev-language',
        }
    )
)
