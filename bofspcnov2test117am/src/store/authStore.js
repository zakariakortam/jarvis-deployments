import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, authToken) => {
        set({
          user: userData,
          token: authToken,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }))
      },

      checkAuth: () => {
        const { token, user } = get()
        if (!token || !user) {
          set({ isAuthenticated: false })
          return false
        }
        set({ isAuthenticated: true })
        return true
      },

      hasRole: (role) => {
        const { user } = get()
        return user?.role === role
      },

      hasPermission: (permission) => {
        const { user } = get()
        const rolePermissions = {
          operator: ['view_dashboard', 'view_monitoring', 'add_heat_data'],
          process_engineer: [
            'view_dashboard',
            'view_monitoring',
            'add_heat_data',
            'view_charts',
            'view_capability',
            'view_history',
            'generate_reports',
          ],
          quality_engineer: [
            'view_dashboard',
            'view_monitoring',
            'add_heat_data',
            'view_charts',
            'view_capability',
            'view_history',
            'generate_reports',
            'import_data',
            'manage_settings',
            'manage_users',
          ],
        }
        return rolePermissions[user?.role]?.includes(permission) || false
      },
    }),
    {
      name: 'bof-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
