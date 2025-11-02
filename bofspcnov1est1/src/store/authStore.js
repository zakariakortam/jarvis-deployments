import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: { name: 'Guest User', role: 'operator' },
      isAuthenticated: true,
      role: 'operator',
      login: (userData) => set({ user: userData, isAuthenticated: true, role: userData.role }),
      logout: () => set({ user: null, isAuthenticated: false, role: null }),
      updateUser: (userData) => set({ user: userData })
    }),
    {
      name: 'bof-spc-auth'
    }
  )
)
