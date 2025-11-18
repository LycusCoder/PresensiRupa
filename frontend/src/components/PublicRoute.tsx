import React, { useEffect } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

interface PublicRouteProps {
  children: React.ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, user, getUserRole, reset } = useAuthStore()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  
  // Check for force logout parameter
  const forceLogout = searchParams.get('force_logout')
  
  useEffect(() => {
    // Force clear cache if force_logout parameter is present
    if (forceLogout === 'true') {
      reset()
      // Remove the parameter from URL
      window.history.replaceState({}, '', location.pathname)
    }
  }, [forceLogout, reset, location.pathname])

  // Jika sudah login, redirect ke dashboard sesuai role
  if (isAuthenticated && user && !forceLogout) {
    const role = getUserRole()
    const redirectPath = role === 'admin' ? '/admin/dashboard' : '/dashboard'
    
    // Prevent redirect loop - cek apakah sudah di halaman public
    const isPublicPage = location.pathname === '/masuk' || location.pathname === '/daftar'
    
    if (isPublicPage) {
      return <Navigate to={redirectPath} replace />
    }
  }

  return <>{children}</>
}
