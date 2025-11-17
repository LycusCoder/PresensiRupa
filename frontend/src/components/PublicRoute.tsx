import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

interface PublicRouteProps {
  children: React.ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, getUserRole } = useAuthStore()

  // Jika sudah login, redirect ke dashboard sesuai role
  if (isAuthenticated) {
    const role = getUserRole()
    const redirectPath = role === 'admin' ? '/admin/dashboard' : '/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
