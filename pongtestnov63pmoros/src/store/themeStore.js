import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode
        if (newDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        return { darkMode: newDarkMode }
      }),
      setDarkMode: (darkMode) => set(() => {
        if (darkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        return { darkMode }
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
