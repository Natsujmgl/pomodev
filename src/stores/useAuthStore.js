import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

export const useAuthStore = create((set) => ({
    user: null,
    session: null,
    loading: true,

    initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user ?? null
        set({ session, user, loading: false })

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user ?? null, loading: false })
        })
    },

    signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        })
        if (error) throw error
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        set({ user: null, session: null })
    },
}))
