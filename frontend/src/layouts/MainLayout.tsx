import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

type Props = {
  children: React.ReactNode
}

export function MainLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  const location = useLocation()

  useEffect(() => {
    // Sync activePage with pathname so sidebar highlights correctly
    const path = location.pathname
    if (path.startsWith('/dashboard') || path === '/') setActivePage('dashboard')
    else if (path.startsWith('/absen')) setActivePage('absen-hari-ini')
    else if (path.startsWith('/riwayat')) setActivePage('riwayat-absensi')
    else if (path.startsWith('/profil')) setActivePage('profil-saya')
    else if (path.startsWith('/daftar-wajah')) setActivePage('daftar-wajah')
    else if (path.startsWith('/pegawai')) setActivePage('pegawai')
    else setActivePage('')
  }, [location.pathname])

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

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Mobile overlay when menu open */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        setMobileMenuOpen={setMobileMenuOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
      />

      <div className={`${!isMobile && sidebarOpen ? 'ml-72' : ''} flex flex-col min-h-screen transition-all duration-300`}>
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="flex-1 overflow-auto p-6 pt-20">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
