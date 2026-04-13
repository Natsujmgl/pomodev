import { Headphones, Volume2, Pause, Play, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguageStore } from '../stores/useLanguageStore'

export function MusicPanel({ onClose }) {
    const { t } = useLanguageStore()
    const [playing, setPlaying] = useState(null)
    const [volume, setVolume] = useState(0.5)
    const audioRef = useRef(new Audio())

    const tracks = [
        { id: 'rain', name: 'Rainy Day', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
        { id: 'waves', name: 'Ocean Waves', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rocks.ogg' },
        { id: 'white', name: 'White Noise', url: 'https://actions.google.com/sounds/v1/science_fiction/white_noise.ogg' },
        { id: 'wind', name: 'Forest Wind', url: 'https://actions.google.com/sounds/v1/weather/wind_strong_soft_gusts.ogg' },
    ]

    useEffect(() => {
        audioRef.current.loop = true
        audioRef.current.volume = volume
    }, [volume])

    const togglePlay = (track) => {
        if (playing === track.id) {
            audioRef.current.pause()
            setPlaying(null)
        } else {
            audioRef.current.src = track.url
            audioRef.current.play().catch(e => console.log("Audio blocked", e))
            setPlaying(track.id)
        }
    }

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
                    <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                        <Headphones className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{t('ambientMusic')}</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1">{t('selectAtmosphere')}</p>
                
                {tracks.map((track) => (
                    <button
                        key={track.id}
                        onClick={() => togglePlay(track)}
                        className={`w-full group relative overflow-hidden rounded-[32px] p-6 transition-all duration-500 border ${
                            playing === track.id 
                            ? 'bg-white/10 border-white/20 shadow-2xl shadow-black/20' 
                            : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                        }`}
                    >
                        <div className="relative flex items-center justify-between z-10">
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                    playing === track.id ? 'bg-white text-slate-900 scale-105' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                                } shadow-lg`}>
                                    {playing === track.id ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                </div>
                                <div className="text-left">
                                    <h3 className={`text-base font-black ${playing === track.id ? 'text-white' : 'text-slate-300'} transition-colors`}>{track.name}</h3>
                                    <span className={`text-[10px] uppercase font-bold tracking-widest ${playing === track.id ? 'text-blue-400' : 'text-slate-500'}`}>
                                        {playing === track.id ? 'Live Audio' : 'Loop Mode'}
                                    </span>
                                </div>
                            </div>
                            
                            {playing === track.id && (
                                <div className="flex gap-1 items-end h-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <motion.div 
                                            key={i}
                                            animate={{ height: [4, 16, 4] }}
                                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                            className="w-1 bg-white/60 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-auto p-8 bg-slate-900/60 rounded-[32px] border border-white/5 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Volume2 className="w-3.5 h-3.5" /> {t('masterVolume')}
                    </span>
                    <span className="text-xs font-black text-white">{Math.round(volume * 100)}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="1" step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer"
                />
            </div>
        </motion.div>
    )
}
