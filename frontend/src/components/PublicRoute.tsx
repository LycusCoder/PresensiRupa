import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

interface PublicRouteProps {
  children: React.ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, user, getUserRole } = useAuthStore()
  const location = useLocation()

  // Jika sudah login, redirect ke dashboard sesuai role
  if (isAuthenticated && user) {
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
