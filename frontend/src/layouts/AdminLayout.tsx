import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  User,
  Settings,
  Moon,
  Sun,
  ChevronDown
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Berhasil logout!')
    navigate('/masuk')
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    toast.info(darkMode ? 'Mode terang diaktifkan' : 'Mode gelap diaktifkan', {
      autoClose: 1500
    })
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
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg`}
      >
        <div className="flex flex-col h-full w-72">
          {/* Logo dengan Blue Gradient */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center ring-2 ring-white/30">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Admin Panel</h2>
                <p className="text-xs text-blue-100">PresensiRupa</p>
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
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  data-testid={`menu-${item.id}`}
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
              data-testid="logout-btn"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${!isMobile && sidebarOpen ? 'ml-72' : ''} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Header dengan Blue Gradient */}
        <header className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          !isMobile && sidebarOpen ? 'left-72' : 'left-0'
        } bg-gradient-to-r from-blue-600 to-blue-500 border-b border-blue-700/30 shadow-lg`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => (isMobile ? setMobileMenuOpen(!mobileMenuOpen) : setSidebarOpen(!sidebarOpen))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
                data-testid="toggle-sidebar-btn"
              >
                {(isMobile ? mobileMenuOpen : sidebarOpen) ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="font-bold text-xl text-white">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
                data-testid="dark-mode-toggle"
                title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Notification Bell */}
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" data-dropdown>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
                  data-testid="profile-dropdown-btn"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                    <span className="text-white font-bold text-sm">
                      {user?.nama_depan?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="font-medium text-sm">{user?.nama_depan || 'Admin'}</div>
                    <div className="text-xs text-blue-100">{user?.jabatan || 'Administrator'}</div>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user?.nama_lengkap || `${user?.nama_depan || 'Admin'} ${user?.nama_belakang || ''}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'admin@presensirupa.com'}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate('/admin/profil')
                        setProfileDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      data-testid="menu-profil"
                    >
                      <User size={18} />
                      <span>Profil</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/admin/pengaturan')
                        setProfileDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      data-testid="menu-pengaturan"
                    >
                      <Settings size={18} />
                      <span>Pengaturan</span>
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        data-testid="dropdown-logout-btn"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
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