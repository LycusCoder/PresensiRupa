import React from 'react'
import { Menu, X, Bell, Settings, Sun, Moon } from 'lucide-react'

type HeaderProps = {
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  isMobile: boolean
  mobileMenuOpen: boolean
  setMobileMenuOpen: (v: boolean) => void
  darkMode: boolean
  setDarkMode: (v: boolean) => void
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className={`fixed top-0 right-0 left-0 z-40 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors ${isMobile ? 'px-4' : 'px-6'}`}>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          {isMobile && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
            >
              <Menu size={20} />
            </button>
          )}
          {!isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          <h1 className="font-bold text-xl">PresensiRupa</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <span className="text-white font-bold text-sm">PR</span>
            </div>
            <div>
              <div className="font-medium">Admin System</div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Administrator</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-700'} transition-colors`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors relative`}>
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            
            <button className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}>
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
