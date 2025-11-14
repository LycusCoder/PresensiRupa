import React from 'react'
import { LayoutDashboard, Calendar, History, User, Users, LogOut, Menu, X, Bell, FileText, BarChart3, Shield, HelpCircle } from 'lucide-react'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activePage: string
  setActivePage: (page: string) => void
  darkMode: boolean
  isMobile: boolean
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  activePage,
  setActivePage,
  darkMode,
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  return (
    <aside className={`fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-50 border-r ${darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700' : 'bg-gradient-to-b from-blue-50 to-white border-gray-200'} ${sidebarOpen ? 'w-72' : 'w-0 -ml-72'} ${isMobile ? 'absolute' : ''}`}>
      {/* Header with Logo */}
      <div className="p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className={`flex items-center gap-3 ${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} shadow-lg`}>
            <span className="text-white font-bold text-sm">PR</span>
          </div>
          <div>
            <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>PresensiRupa</h1>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sistem Absensi</p>
          </div>
        </div>
        <button 
          onClick={() => isMobile ? setMobileMenuOpen(false) : setSidebarOpen(!sidebarOpen)} 
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          {sidebarOpen ? <X size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} /> : <Menu size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6 px-4">
        <div className="mb-6">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {sidebarOpen ? 'Menu Utama' : 'Main'}
          </h3>
          <ul className="space-y-1">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: 2 },
              { id: 'absen-hari-ini', name: 'Absen Hari Ini', icon: Calendar },
              { id: 'riwayat-absensi', name: 'Riwayat Absensi', icon: History },
              { id: 'profil-saya', name: 'Profil Saya', icon: User },
              { id: 'daftar-wajah', name: 'Daftar Wajah', icon: Users }
            ].map(item => {
              const Icon = item.icon as React.FC<{ size: number; className?: string }>
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActivePage(item.id)
                      if (isMobile) setMobileMenuOpen(false)
                    }}
                    className={`flex items-center w-full p-3 rounded-lg transition-all group ${
                      activePage === item.id 
                        ? `${darkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-500 text-white shadow-md'}`
                        : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                    }`}
                  >
                    <Icon size={20} className="mr-3 flex-shrink-0" />
                    <span className={`flex-1 text-left ${sidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        activePage === item.id 
                          ? 'bg-white text-blue-600' 
                          : darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      } ${sidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {sidebarOpen ? 'Administrasi' : 'Admin'}
          </h3>
          <ul className="space-y-1">
            {[
              { id: 'pegawai', name: 'Data Pegawai', icon: Users },
              { id: 'laporan', name: 'Laporan', icon: FileText },
              { id: 'analisis', name: 'Analisis Data', icon: BarChart3 },
              { id: 'keamanan', name: 'Keamanan', icon: Shield }
            ].map(item => {
              const Icon = item.icon as React.FC<{ size: number; className?: string }>
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActivePage(item.id)
                      if (isMobile) setMobileMenuOpen(false)
                    }}
                    className={`flex items-center w-full p-3 rounded-lg transition-all group ${
                      activePage === item.id 
                        ? `${darkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-500 text-white shadow-md'}`
                        : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                    }`}
                  >
                    <Icon size={20} className="mr-3 flex-shrink-0" />
                    <span className={`flex-1 text-left ${sidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>
                      {item.name}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {sidebarOpen ? 'Lainnya' : 'Other'}
          </h3>
          <ul className="space-y-1">
            {[
              { id: 'notifikasi', name: 'Notifikasi', icon: Bell, badge: 3 },
              { id: 'bantuan', name: 'Bantuan', icon: HelpCircle }
            ].map(item => {
              const Icon = item.icon as React.FC<{ size: number; className?: string }>
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActivePage(item.id)
                      if (isMobile) setMobileMenuOpen(false)
                    }}
                    className={`flex items-center w-full p-3 rounded-lg transition-all group ${
                      activePage === item.id 
                        ? `${darkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-500 text-white shadow-md'}`
                        : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                    }`}
                  >
                    <Icon size={20} className="mr-3 flex-shrink-0" />
                    <span className={`flex-1 text-left ${sidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        activePage === item.id 
                          ? 'bg-white text-blue-600' 
                          : darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
                      } ${sidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* Footer User Section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
            <User size={20} className="text-white" />
          </div>
          <div className={sidebarOpen ? 'opacity-100' : 'opacity-0'}>
            <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>admin@presensi.local</p>
          </div>
        </div>
        <button 
          onClick={() => alert('Logout functionality')}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${
            darkMode 
              ? 'hover:bg-red-600 text-gray-300 hover:text-white' 
              : 'hover:bg-red-500 text-gray-700 hover:text-white'
          }`}
        >
          <LogOut size={20} />
          <span className={sidebarOpen ? 'opacity-100' : 'opacity-0'}>
            Keluar
          </span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
