import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell 
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'react-toastify'

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'karyawan', label: 'Kelola Karyawan', icon: Users, path: '/admin/karyawan' },
    { id: 'kehadiran', label: 'Kelola Kehadiran', icon: Calendar, path: '/admin/kehadiran' },
    { id: 'laporan', label: 'Laporan', icon: BarChart3, path: '/admin/laporan' },
  ]

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 1024)
      if (width < 1024) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  const handleLogout = () => {
    logout()
    toast.success('Berhasil logout!')
    navigate('/masuk')
  }

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ${
          isMobile
            ? mobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : sidebarOpen
            ? 'w-72'
            : 'w-0'
        } ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-r ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full w-72">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">PresensiRupa</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path)
                    if (isMobile) setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-red-500 text-white shadow-lg'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${!isMobile && sidebarOpen ? 'ml-72' : ''} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Header */}
        <header className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          !isMobile && sidebarOpen ? 'left-72' : 'left-0'
        } ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => (isMobile ? setMobileMenuOpen(!mobileMenuOpen) : setSidebarOpen(!sidebarOpen))}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
              >
                {(isMobile ? mobileMenuOpen : sidebarOpen) ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="font-bold text-xl">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} relative`}>
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.nama_depan?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="font-medium">{user?.nama_depan || 'Admin'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user?.jabatan || 'Administrator'}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
