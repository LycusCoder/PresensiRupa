import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Pengguna } from '@/types'

interface AuthState {
  token: string | null
  user: Pengguna | null
  isLoading: boolean
  error: string | null

  // Actions
  setToken: (token: string) => void
  setUser: (user: Pengguna) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      setToken: (token: string) => set({ token }),
      setUser: (user: Pengguna) => set({ user }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      logout: () => set({ token: null, user: null }),
      reset: () => set({
        token: null,
        user: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'auth-store',
    }
  )
)
