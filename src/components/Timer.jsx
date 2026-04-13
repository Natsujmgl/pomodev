import { useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { useTimerStore } from '../stores/useTimerStore'
import { useStatsStore } from '../stores/useStatsStore'
import { useLanguageStore } from '../stores/useLanguageStore'
import { motion, AnimatePresence } from 'framer-motion'

export function Timer() {
    const {
        timeLeft,
        isActive,
        mode,
        toggleTimer,
        resetTimer,
        tick,
        setMode,
        durations
    } = useTimerStore()
    
    const { addFocusTime } = useStatsStore()
    const { t } = useLanguageStore()

    useEffect(() => {
        let interval = null
        if (isActive && timeLeft > 0) {
            interval = setInterval(tick, 1000)
        } else if (timeLeft === 0) {
            // Logic for statistics
            if (mode === 'pomodoro') {
                addFocusTime(durations.pomodoro / 60)
            }

            const alarmaSonido = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            alarmaSonido.play().catch(e => console.log("Audio blocked", e));

            if (Notification.permission === "granted") {
                new Notification(t('title'), {
                    body: mode === 'pomodoro' ? t('ritualsProtocol') : t('focusMode'),
                });
            }
        }
        return () => clearInterval(interval)
    }, [isActive, timeLeft, tick, mode, durations, addFocusTime, t])

    // Update Tab Title
    useEffect(() => {
        const formatTitle = (seconds) => {
            const mins = Math.floor(seconds / 60)
            const secs = seconds % 60
            return `${mins}:${secs.toString().padStart(2, '0')}`
        }
        document.title = isActive ? `${formatTitle(timeLeft)} - ${t('title')}` : t('title')
    }, [timeLeft, isActive, t])

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault()
                toggleTimer()
            }
            if (e.code === 'KeyR') {
                resetTimer()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggleTimer, resetTimer])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const progress = (timeLeft / durations[mode]) * 100
    const strokeDashoffset = 440 - (440 * progress) / 100

    const theme = {
        pomodoro: { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
        shortBreak: { color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
        longBreak: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' }
    }

    const currentTheme = theme[mode] || theme.pomodoro

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-12">
            {/* Mode Selectors */}
            <div className="flex gap-2 mb-16 bg-slate-900/40 p-1.5 rounded-2xl backdrop-blur-xl border border-white/5 shadow-inner">
                {[
                    { id: 'pomodoro', label: t('focus') },
                    { id: 'shortBreak', label: t('shortBreak') },
                    { id: 'longBreak', label: t('longBreak') },
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-500 relative ${mode === m.id
                                ? 'text-white'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {mode === m.id && (
                            <motion.div 
                                layoutId="activeMode"
                                className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{m.label}</span>
                    </button>
                ))}
            </div>

            {/* Timer Display with Progress Circle */}
            <div className="relative mb-16 group cursor-pointer" onClick={toggleTimer}>
                {/* Visual Glow */}
                <motion.div 
                    animate={{ 
                        opacity: isActive ? [0.2, 0.4, 0.2] : 0.2,
                        scale: isActive ? [1, 1.05, 1] : 1
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 rounded-full blur-[80px]"
                    style={{ backgroundColor: currentTheme.glow }}
                />

                <svg className="w-[340px] h-[340px] transform -rotate-90">
                    <circle
                        cx="170" cy="170" r="160"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-800/50"
                    />
                    <motion.circle
                        cx="170" cy="170" r="160"
                        stroke={currentTheme.color}
                        strokeWidth="10"
                        strokeDasharray="1005"
                        initial={{ strokeDashoffset: 1005 }}
                        animate={{ strokeDashoffset: 1005 - (1005 * (durations[mode] - timeLeft)) / durations[mode] }}
                        transition={{ duration: 1, ease: "linear" }}
                        fill="transparent"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        key={timeLeft}
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        className="text-8xl font-black font-mono tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] select-none"
                    >
                        {formatTime(timeLeft)}
                    </motion.div>
                    <div className="mt-2 text-slate-400 font-bold tracking-[0.2em] text-xs uppercase opacity-60">
                        {isActive ? t('deepFocusing') : t('readyToStart')}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTimer}
                    className="w-24 h-24 rounded-3xl bg-white text-slate-900 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300"
                >
                    {isActive ? (
                        <Pause className="w-10 h-10 fill-current" />
                    ) : (
                        <Play className="w-10 h-10 fill-current ml-1" />
                    )}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1, rotate: -30 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetTimer}
                    className="p-5 rounded-2xl bg-slate-900/60 text-slate-400 hover:text-white backdrop-blur-md border border-white/5 hover:border-white/10 transition-all"
                >
                    <RotateCcw className="w-7 h-7" />
                </motion.button>
            </div>
        </div>
    )
}
