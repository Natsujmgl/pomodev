import { useAuthStore } from '../stores/useAuthStore'
import { LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react'
import { useLanguageStore } from '../stores/useLanguageStore'

export function AuthButton() {
    const { user, loading, signInWithGoogle, signOut } = useAuthStore()
    const { t } = useLanguageStore()

    if (loading) {
        return (
            <div className="p-3 rounded-xl bg-white/5 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
            </div>
        )
    }

    if (user) {
        return (
            <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-xl p-1 pr-3 rounded-2xl border border-white/5">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10">
                    <img src={user.user_metadata?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="hidden md:block">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('welcome') || 'WELCOME'}</p>
                    <p className="text-xs font-bold text-white truncate max-w-[100px]">{user.user_metadata?.full_name}</p>
                </div>
                <button
                    onClick={signOut}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title={t('logout') || 'Logout'}
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-lg shadow-white/5 active:scale-95"
        >
            <LogIn className="w-4 h-4" />
            <span>{t('login') || 'Login'}</span>
        </button>
    )
}
