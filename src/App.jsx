import { Timer } from './components/Timer'
import { GoalOverlay } from './components/GoalOverlay'
import { SettingsPanel } from './components/SettingsPanel'
import { MusicPanel } from './components/MusicPanel'
import { StatsPanel } from './components/StatsPanel'
import { Settings as SettingsIcon, Music, BarChart3, Pill as HealthIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTimerStore } from './stores/useTimerStore'
import { useLanguageStore } from './stores/useLanguageStore'
import { useThemeStore } from './stores/useThemeStore'
import { useAuthStore } from './stores/useAuthStore'
import { AuthButton } from './components/AuthButton'
import { AnimatePresence, motion } from 'framer-motion'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMusicOpen, setIsMusicOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const { mode } = useTimerStore()
  const { t, language } = useLanguageStore()
  const { theme } = useThemeStore()

  const { user, initialize } = useAuthStore()
  const { syncWithSupabase: syncLang } = useLanguageStore()
  const { syncWithSupabase: syncTheme } = useThemeStore()
  const { syncWithSupabase: syncSettings } = useSettingsStore()
  const { syncWithSupabase: syncStats } = useStatsStore()

  // Initialize Auth & Sync
  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const syncData = async () => {
      if (!user) return

      const { supabase } = await import('./lib/supabaseClient')

      // 1. Profile Sync
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        if (profile.language) syncLang(profile.language)
        if (profile.theme) syncTheme(profile.theme)
      } else {
        // New User: Create Profile
        await supabase.from('profiles').insert({ 
            id: user.id, 
            language, 
            theme 
        })
      }

      // 2. Rituals Sync
      const { data: rituals } = await supabase.from('rituals').select('*').eq('user_id', user.id)
      if (rituals && rituals.length > 0) {
        syncSettings(rituals.map(r => ({
            id: r.id,
            text: r.text,
            triggerMode: r.trigger_mode,
            description: r.description,
            image: r.image
        })))
      }

      // 3. Stats Sync
      const { data: stats } = await supabase.from('daily_stats').select('*').eq('user_id', user.id)
      if (stats) {
        const dailyStats = {}
        let totalMin = 0
        let totalEx = 0
        let totalSess = 0
        
        stats.forEach(s => {
          dailyStats[s.date] = { focus: s.focus_minutes, exercises: s.exercises_count }
          totalMin += s.focus_minutes
          totalEx += s.exercises_count
          totalSess += s.sessions_count
        })

        syncStats({
          dailyStats,
          totalFocusMinutes: totalMin,
          completedExercises: totalEx,
          totalSessions: totalSess
        })
      }
    }

    syncData()
  }, [user, syncLang, syncTheme, syncSettings, syncStats])

  // Notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Apply Theme to Document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const getThemeColors = () => {
    if (theme === 'warm') {
      switch(mode) {
        case 'pomodoro': return 'from-orange-600/20 to-red-600/20'
        case 'shortBreak': return 'from-yellow-500/20 to-orange-500/20'
        case 'longBreak': return 'from-amber-500/20 to-yellow-500/20'
        default: return 'from-orange-600/20 to-red-600/20'
      }
    }
    switch(mode) {
      case 'pomodoro': return 'from-blue-600/20 to-purple-600/20'
      case 'shortBreak': return 'from-emerald-500/20 to-teal-500/20'
      case 'longBreak': return 'from-amber-500/20 to-orange-500/20'
      default: return 'from-blue-600/20 to-purple-600/20'
    }
  }

  return (
    <div className="min-h-screen text-slate-200 flex flex-col relative overflow-hidden font-sans selection:bg-blue-500/30 mode-transition">
      {/* Dynamic Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] mix-blend-screen opacity-50 bg-gradient-to-br ${getThemeColors()} transition-all duration-1000 animate-aurora-1`}
        ></div>
        <div 
          className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] mix-blend-screen opacity-50 bg-gradient-to-tl ${getThemeColors()} transition-all duration-1000 animate-aurora-2`}
        ></div>
      </div>

      <header className="relative z-30 px-8 py-6 flex justify-between items-center max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-2xl shadow-2xl shadow-purple-500/30 text-white transform hover:rotate-6 transition-transform">P</div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">PomoDev</span>
            <div className={`h-1 w-full bg-gradient-to-r ${mode === 'pomodoro' ? 'from-blue-500' : 'from-emerald-500'} to-transparent rounded-full mt-0.5 opacity-50`}></div>
          </div>
        </div>
        
        <div className="flex gap-3 bg-slate-900/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className={`p-3 rounded-xl transition-all ${isStatsOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title={t('performance')}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsMusicOpen(!isMusicOpen)}
            className={`p-3 rounded-xl transition-all ${isMusicOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title={t('ambientMusic')}
          >
            <Music className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-3 rounded-xl transition-all ${isSettingsOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title={t('configuration')}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-1 self-center"></div>
          
          <AuthButton />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full h-full items-center">
          {/* Main Content Area */}
          <div className={`col-span-1 lg:col-start-3 lg:col-span-8 flex flex-col items-center justify-center transition-all duration-500`}>
            <Timer />
          </div>
        </div>
      </main>

      <GoalOverlay />

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
        )}
        {isMusicOpen && (
          <MusicPanel onClose={() => setIsMusicOpen(false)} />
        )}
        {isStatsOpen && (
          <StatsPanel onClose={() => setIsStatsOpen(false)} />
        )}
      </AnimatePresence>

      <footer className="relative z-10 p-8 text-center text-slate-500 text-sm font-medium tracking-wide">
        &copy; 2026 PomoDev &bull; {language === 'en' ? 'Focus on your code, care for your health.' : 'Enfócate en tu código, cuida tu salud.'}
      </footer>
    </div>
  )
}

export default App
