import { useTimerStore } from '../stores/useTimerStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useLanguageStore } from '../stores/useLanguageStore'
import { useThemeStore } from '../stores/useThemeStore'
import { Trash2, Plus, Image as ImageIcon, AlertCircle, X, Bell, Clock, Target, Globe, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

export function SettingsPanel({ onClose }) {
    const { durations, setDuration } = useTimerStore()
    const { goals, addGoal, removeGoal } = useSettingsStore()
    const { language, setLanguage, t } = useLanguageStore()
    const { theme, setTheme } = useThemeStore()
    const [permission, setPermission] = useState(Notification.permission)

    const [newGoal, setNewGoal] = useState({ text: '', triggerMode: 'shortBreak', image: '', description: '' })

    const requestNotification = async () => {
        const res = await Notification.requestPermission()
        setPermission(res)
    }

    const handleAddGoal = (e) => {
        e.preventDefault()
        if (!newGoal.text) return
        addGoal({ ...newGoal, id: crypto.randomUUID() })
        setNewGoal({ text: '', triggerMode: 'shortBreak', image: '', description: '' })
    }

    return (
        <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 glass-panel z-50 p-6 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{t('configuration')}</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-10">
                
                {/* Personalization Section */}
                <section className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" /> {t('language')}
                        </h3>
                        <div className="flex p-1 bg-slate-900/40 rounded-2xl border border-white/5">
                            {['en', 'es'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${language === lang ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {lang === 'en' ? 'English' : 'Español'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Moon className="w-3.5 h-3.5" /> {t('theme')}
                        </h3>
                        <div className="flex p-1 bg-slate-900/40 rounded-2xl border border-white/5">
                            {[
                                { id: 'dark', label: t('dark'), icon: Moon },
                                { id: 'warm', label: t('warm'), icon: Sun },
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setTheme(id)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${theme === id ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Icon className="w-3 h-3" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="h-px bg-white/5 w-full"></div>

                {/* Timer Config */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> {t('durations')}
                    </h3>
                    <div className="space-y-4">
                        {[
                            { key: 'pomodoro', label: t('focus'), color: 'from-blue-500 to-purple-500' },
                            { key: 'shortBreak', label: t('shortBreak'), color: 'from-emerald-500 to-teal-500' },
                            { key: 'longBreak', label: t('longBreak'), color: 'from-amber-500 to-orange-500' },
                        ].map(({ key, label, color }) => {
                            const totalSeconds = durations[key]
                            const hrs = Math.floor(totalSeconds / 3600)
                            const mins = Math.floor((totalSeconds % 3600) / 60)
                            const secs = totalSeconds % 60

                            const updateField = (field, value) => {
                                const v = parseInt(value) || 0
                                let newTotal = totalSeconds
                                if (field === 'h') newTotal = (v * 3600) + (mins * 60) + secs
                                if (field === 'm') newTotal = (hrs * 3600) + (v * 60) + secs
                                if (field === 's') newTotal = (hrs * 3600) + (mins * 60) + v
                                setDuration(key, Math.max(0, newTotal))
                            }

                            return (
                                <div key={key} className="bg-slate-900/40 rounded-3xl p-5 border border-white/5 group hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${color}`}></div>
                                        <label className="text-sm font-bold text-slate-200">{label}</label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">Hrs</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={hrs}
                                                onChange={(e) => updateField('h', e.target.value)}
                                                className="bg-slate-800/80 border-none rounded-xl p-2.5 text-center font-bold text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">Min</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={mins}
                                                onChange={(e) => updateField('m', e.target.value)}
                                                className="bg-slate-800/80 border-none rounded-xl p-2.5 text-center font-bold text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">Sec</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={secs}
                                                onChange={(e) => updateField('s', e.target.value)}
                                                className="bg-slate-800/80 border-none rounded-xl p-2.5 text-center font-bold text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Notifications */}
                <section className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-[32px] p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Bell className="w-3.5 h-3.5" /> {t('notifications')}
                        </h3>
                        {permission === 'granted' && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>}
                    </div>

                    {permission !== 'granted' ? (
                        <button
                            onClick={requestNotification}
                            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-slate-100 active:scale-95 shadow-xl shadow-white/5"
                        >
                            {t('enableAlerts')}
                        </button>
                    ) : (
                        <p className="text-xs text-slate-500 font-medium">Notifications are currently active and will alert you at the end of each session.</p>
                    )}
                </section>

                {/* Goals Config */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" /> {t('rituals')}
                    </h3>

                    <form onSubmit={handleAddGoal} className="bg-slate-900/40 rounded-[24px] p-5 mb-8 border border-white/5 space-y-4">
                        <input
                            type="text"
                            placeholder={t('ritualName')}
                            className="w-full bg-slate-800/50 rounded-xl p-3 text-sm border border-white/5 focus:border-blue-500 outline-none text-white placeholder:text-slate-600 transition-colors"
                            value={newGoal.text}
                            onChange={(e) => setNewGoal({ ...newGoal, text: e.target.value })}
                        />
                        <textarea
                            placeholder={t('ritualDesc')}
                            className="w-full bg-slate-800/50 rounded-xl p-3 text-sm border border-white/5 focus:border-blue-500 outline-none text-white placeholder:text-slate-600 transition-colors resize-none h-20"
                            value={newGoal.description}
                            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                className="bg-slate-800/50 rounded-xl p-3 text-sm border border-white/5 outline-none text-slate-300 appearance-none cursor-pointer"
                                value={newGoal.triggerMode}
                                onChange={(e) => setNewGoal({ ...newGoal, triggerMode: e.target.value })}
                            >
                                <option value="shortBreak">{t('shortBreak')}</option>
                                <option value="longBreak">{t('longBreak')}</option>
                                <option value="pomodoro">{t('focus')}</option>
                            </select>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                                <Plus className="w-4 h-4" /> {t('add')}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-4">
                        {goals.map(goal => (
                            <div key={goal.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-white truncate">{goal.text}</p>
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter mt-1 block">
                                        {goal.triggerMode}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => removeGoal(goal.id)}
                                    className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </motion.div>
    )
}
