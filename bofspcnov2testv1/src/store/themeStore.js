import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark', // Default to dark mode for industrial environment

      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }))
      },

      setTheme: (theme) => {
        set({ theme })
      },
    }),
    {
      name: 'bof-theme-storage',
    }
  )
)
