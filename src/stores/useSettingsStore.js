import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EXERCISE_LIBRARY } from '../utils/ExerciseLibrary'
import { supabase } from '../lib/supabaseClient'

export const useSettingsStore = create(
    persist(
        (set) => ({
            goals: EXERCISE_LIBRARY,
            customMessage: "Keep pushing! You're doing great.",

            addGoal: async (goal) => {
                set((state) => ({ goals: [...state.goals, goal] }))
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase.from('rituals').insert({ 
                        ...goal, 
                        user_id: user.id,
                        trigger_mode: goal.triggerMode // mapping camelCase to snake_case for DB
                    })
                }
            },
            removeGoal: async (id) => {
                set((state) => ({ goals: state.goals.filter(g => g.id !== id) }))
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase.from('rituals').delete().eq('id', id).eq('user_id', user.id)
                }
            },
            updateCustomMessage: async (msg) => {
                set({ customMessage: msg })
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase.from('profiles').upsert({ id: user.id, custom_message: msg })
                }
            },
            syncWithSupabase: (goals) => set({ goals }),
        }),
        {
            name: 'pomodev-settings',
        }
    )
)
