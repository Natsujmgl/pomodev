import { create } from 'zustand'

export const useTimerStore = create((set, get) => ({
    timeLeft: 25 * 60,
    isActive: false,
    isFinished: false,
    mode: 'pomodoro', // 'pomodoro' | 'shortBreak' | 'longBreak'

    durations: {
        pomodoro: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
    },

    setMode: (mode) => {
        const { durations } = get()
        set({
            mode,
            timeLeft: durations[mode],
            isActive: false,
            isFinished: false
        })
    },

    setDuration: (mode, seconds) => set((state) => {
        const isCurrentMode = state.mode === mode
        return {
            durations: { ...state.durations, [mode]: seconds },
            timeLeft: isCurrentMode && !state.isActive ? seconds : state.timeLeft
        }
    }),

    toggleTimer: () => set((state) => ({ isActive: !state.isActive, isFinished: false })),
    resetTimer: () => {
        const { mode, durations } = get()
        set({ isActive: false, timeLeft: durations[mode], isFinished: false })
    },

    tick: () => {
        const { timeLeft, isActive } = get()
        if (!isActive) return

        if (timeLeft > 0) {
            set({ timeLeft: timeLeft - 1 })
        } else {
            set({ isActive: false, isFinished: true })
            // We can add "onComplete" callback logic in the component layer or here
        }
    },
}))
