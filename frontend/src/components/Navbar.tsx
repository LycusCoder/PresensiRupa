import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/masuk')
  }

  return (
    <nav className="bg-white border-b border-secondary-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PR</span>
            </div>
            <h1 className="text-xl font-bold text-primary-600 hidden sm:block">PresensiRupa</h1>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-secondary-900">{user.nama_depan} {user.nama_belakang}</p>
                <p className="text-xs text-secondary-500">{user.jabatan}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Keluar
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
