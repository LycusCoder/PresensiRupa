import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, getUserRole } = useAuthStore()
  const location = useLocation()

  // Jika belum login, redirect ke login
  if (!isAuthenticated || !user) {
    return <Navigate to="/masuk" state={{ from: location }} replace />
  }

  const userRole = getUserRole()

  // Jika ada role restriction, cek apakah user memiliki akses
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      // Redirect ke dashboard yang sesuai dengan role
      const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/dashboard'
      return <Navigate to={redirectPath} replace />
    }
  } else {
    // Tidak ada role restriction - auto redirect berdasarkan role
    // Jika admin mengakses route karyawan (kecuali root "/"), redirect ke admin dashboard
    if (userRole === 'admin' && !location.pathname.startsWith('/admin') && location.pathname !== '/') {
      return <Navigate to="/admin/dashboard" replace />
    }
    // Jika karyawan mengakses route admin, redirect ke karyawan dashboard
    if (userRole === 'karyawan' && location.pathname.startsWith('/admin')) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
