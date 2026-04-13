import { motion } from 'framer-motion'
import { X, BarChart3, Pill as HealthIcon, Zap, Trophy, Clock } from 'lucide-react'
import { useStatsStore } from '../stores/useStatsStore'
import { useLanguageStore } from '../stores/useLanguageStore'

export function StatsPanel({ onClose }) {
    const { dailyStats, totalFocusMinutes, totalSessions, completedExercises } = useStatsStore()
    const { t } = useLanguageStore()
    const today = new Date().toISOString().split('T')[0]
    const todayStats = dailyStats[today] || { focus: 0, exercises: 0 }

    return (
        <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 glass-panel z-50 p-6 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
        >
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{t('performance')}</h2>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {/* Daily Overview Card */}
                <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-[32px] p-8 border border-blue-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all duration-700"></div>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">{t('todaysFocus')}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-5xl font-black text-white tracking-tighter">{todayStats.focus}</h3>
                        <span className="text-sm font-bold text-slate-500 uppercase">min</span>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((todayStats.focus / 120) * 100, 100)}%` }}
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('target')}: 2h</span>
                    </div>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 group hover:border-white/10 transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <HealthIcon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('healthGoals')}</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{todayStats.exercises}</p>
                    </div>
                    <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 group hover:border-white/10 transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('sessions')}</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{totalSessions}</p>
                    </div>
                </div>

                {/* Lifetime Stats */}
                <section className="pt-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" /> {t('lifetime')}
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-bold text-slate-300">{t('totalMinutes')}</span>
                            </div>
                            <span className="text-lg font-black text-white">{(totalFocusMinutes / 60).toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-bold text-slate-300">{t('stretchesDone')}</span>
                            </div>
                            <span className="text-lg font-black text-emerald-400">{completedExercises}</span>
                        </div>
                    </div>
                </section>
            </div>
        </motion.div>
    )
}
