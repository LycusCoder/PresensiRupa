import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Pengguna, UserRole } from '@/types'

interface AuthState {
  token: string | null
  user: Pengguna | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean

  // Actions
  setToken: (token: string) => void
  setUser: (user: Pengguna) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  reset: () => void
  getUserRole: () => UserRole
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      setToken: (token: string) => {
        localStorage.setItem('token', token)
        set({ token, isAuthenticated: true })
      },
      
      setUser: (user: Pengguna) => {
        // Auto-detect role based on jabatan atau id_karyawan
        // Jika jabatan mengandung "admin" atau id_karyawan dimulai dengan "ADM"
        const role: UserRole = 
          user.jabatan?.toLowerCase().includes('admin') || 
          user.id_karyawan?.toUpperCase().startsWith('ADM') 
            ? 'admin' 
            : 'karyawan'
        
        set({ user: { ...user, role }, isAuthenticated: true })
      },
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setError: (error: string | null) => set({ error }),
      
      logout: () => {
        localStorage.removeItem('token')
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false,
          error: null 
        })
      },
      
      reset: () => {
        localStorage.removeItem('token')
        set({
          token: null,
          user: null,
          isLoading: false,
          error: null,
          isAuthenticated: false,
        })
      },
      
      getUserRole: () => {
        const { user } = get()
        return user?.role || 'karyawan'
      },
      
      isAdmin: () => {
        const { user } = get()
        return user?.role === 'admin'
      },
    }),
    {
      name: 'auth-store',
      partialState: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
