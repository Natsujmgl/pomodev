import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabaseClient'

export const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'dark', // 'dark' | 'warm'
            setTheme: async (theme) => {
                set({ theme })
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase.from('profiles').upsert({ id: user.id, theme: theme })
                }
            },
            syncWithSupabase: (theme) => set({ theme }),
        }),
        {
            name: 'pomodev-theme',
        }
    )
)
