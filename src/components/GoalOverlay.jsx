import { useEffect, useState } from 'react'
import { useTimerStore } from '../stores/useTimerStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useStatsStore } from '../stores/useStatsStore'
import { useLanguageStore } from '../stores/useLanguageStore'
import { Check, ArrowRight, Play, Info, Sparkles, Brain, Pill as HealthIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function GoalOverlay() {
    const { isFinished, mode, setMode, resetTimer } = useTimerStore()
    const { goals } = useSettingsStore()
    const { addExercise } = useStatsStore()
    const { t } = useLanguageStore()
    const [isOpen, setIsOpen] = useState(false)
    const [currentGoals, setCurrentGoals] = useState([])
    const [completedIds, setCompletedIds] = useState(new Set())

    useEffect(() => {
        if (isFinished) {
            let targetMode = ''
            if (mode === 'pomodoro') targetMode = 'shortBreak'
            else if (mode === 'shortBreak' || mode === 'longBreak') targetMode = 'pomodoro'

            const relevantGoals = goals.filter(g => g.triggerMode === targetMode)
            setCurrentGoals(relevantGoals)
            setIsOpen(true)
            setCompletedIds(new Set())

            if (Notification.permission === 'granted') {
                new Notification(t('title'), {
                    body: mode === 'pomodoro' ? t('ritualsProtocol') : t('focusMode'),
                })
            }
        } else {
            setIsOpen(false)
        }
    }, [isFinished, mode, goals, t])

    const handleCompleteGoal = (id) => {
        if (!completedIds.has(id)) {
            addExercise()
            setCompletedIds(prev => new Set([...prev, id]))
        }
    }

    const handleContinue = () => {
        setIsOpen(false)
        if (mode === 'pomodoro') setMode('shortBreak')
        else setMode('pomodoro')
        resetTimer()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-2xl"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorative Aurora inside overlay */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full"></div>

                        <div className="relative z-10 text-center mb-12">
                            <div className="inline-flex p-4 rounded-3xl bg-blue-500/10 text-blue-400 mb-6">
                                {mode === 'pomodoro' ? <Brain className="w-8 h-8" /> : <HealthIcon className="w-8 h-8" />}
                            </div>
                            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">
                                {mode === 'pomodoro' ? t('rituals') : t('focusMode')}
                            </h2>
                            <p className="text-slate-400 text-lg font-medium max-w-md mx-auto">
                                {mode === 'pomodoro' ? t('ritualsDesc') : t('focusDesc')}
                            </p>
                        </div>

                        <div className="space-y-4 mb-12 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                            {currentGoals.length > 0 ? currentGoals.map((goal, idx) => {
                                const isDone = completedIds.has(goal.id)
                                return (
                                    <motion.button
                                        key={goal.id}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => handleCompleteGoal(goal.id)}
                                        className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all duration-500 ${
                                            isDone 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5' 
                                            : 'bg-white/5 border-white/5 hover:border-white/15'
                                        }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                {isDone ? <Check className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
                                            </div>
                                            <div className="text-left font-bold text-white tracking-tight">{goal.text}</div>
                                        </div>
                                        {isDone && (
                                            <motion.div 
                                                initial={{ scale: 0 }} 
                                                animate={{ scale: 1 }}
                                                className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Done
                                            </motion.div>
                                        )}
                                    </motion.button>
                                )
                            }) : (
                                <div className="text-center py-12 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                                    <p className="text-slate-500 italic font-medium">No rituals scheduled. Pure relaxation.</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full py-6 rounded-[32px] bg-white text-slate-900 font-black text-lg uppercase tracking-widest hover:bg-slate-100 active:scale-[0.98] transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-3"
                        >
                            <Sparkles className="w-6 h-6" />
                            {mode === 'pomodoro' ? t('beginBreak') : t('enterFocus')}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
