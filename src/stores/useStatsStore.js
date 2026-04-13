import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabaseClient'

export const useStatsStore = create(
    persist(
        (set) => ({
            totalFocusMinutes: 0,
            totalSessions: 0,
            completedExercises: 0,
            dailyStats: {}, // Format: { 'YYYY-MM-DD': { focus: 0, exercises: 0 } }

            addFocusTime: async (minutes) => {
                const today = new Date().toISOString().split('T')[0]
                
                set((state) => {
                    const currentDay = state.dailyStats[today] || { focus: 0, exercises: 0 }
                    return {
                        totalFocusMinutes: state.totalFocusMinutes + minutes,
                        totalSessions: state.totalSessions + 1,
                        dailyStats: {
                            ...state.dailyStats,
                            [today]: {
                                ...currentDay,
                                focus: currentDay.focus + minutes
                            }
                        }
                    }
                })

                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: current } = await supabase.from('daily_stats').select('*').eq('user_id', user.id).eq('date', today).single()
                    await supabase.from('daily_stats').upsert({
                        user_id: user.id,
                        date: today,
                        focus_minutes: (current?.focus_minutes || 0) + minutes,
                        sessions_count: (current?.sessions_count || 0) + 1
                    })
                }
            },

            addExercise: async () => {
                const today = new Date().toISOString().split('T')[0]
                
                set((state) => {
                    const currentDay = state.dailyStats[today] || { focus: 0, exercises: 0 }
                    return {
                        completedExercises: state.completedExercises + 1,
                        dailyStats: {
                            ...state.dailyStats,
                            [today]: {
                                ...currentDay,
                                exercises: currentDay.exercises + 1
                            }
                        }
                    }
                })

                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: current } = await supabase.from('daily_stats').select('*').eq('user_id', user.id).eq('date', today).single()
                    await supabase.from('daily_stats').upsert({
                        user_id: user.id,
                        date: today,
                        exercises_count: (current?.exercises_count || 0) + 1
                    })
                }
            },
            
            syncWithSupabase: (data) => set(data),
            resetDailyStats: () => set({ dailyStats: {} })
        }),
        {
            name: 'pomodev-stats',
        }
    )
)
