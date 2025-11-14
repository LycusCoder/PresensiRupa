import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Calendar, History, User, Users, LogOut, Menu, X, Bell, Settings, ChevronRight, CheckCircle, AlertTriangle, Clock, ArrowUpRight, Eye, EyeOff, FileText, BarChart3, Shield, Building, CreditCard, HelpCircle, Activity, Search, Grid, List, MoreHorizontal, Plus, Home } from 'lucide-react'
import '@/index.css'
import Sidebar from './components/Sidebar'

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Mock data for dashboard
  const stats = [
    { title: 'Status Hari Ini', value: 'Tidak Ada Data', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { title: 'Total Hadir (Bulan Ini)', value: '—', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Status Wajah', value: 'Belum Terdaftar', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' }
  ]

  const recentAbsensi = [
    { date: '2023-11-15', time: '08:30 AM', status: 'Hadir', location: 'Kantor Pusat' },
    { date: '2023-11-14', time: '08:45 AM', status: 'Hadir', location: 'Kantor Pusat' },
    { date: '2023-11-13', time: '09:15 AM', status: 'Terlambat', location: 'Kantor Cabang' }
  ]

  const adminNotes = [
    { id: 1, title: 'System Administrator - for testing only', date: '2023-11-15', priority: 'low' }
  ]

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 1024)
      if (width < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const Header = () => (
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

  const DashboardContent = () => (
    <div className={`transition-all duration-300 ease-in-out ${isMobile ? 'pt-20' : 'pt-20'}`}>
      <div className={`p-4 ${isMobile ? 'px-4' : 'px-6'}`}>
        {/* Welcome Section */}
        <div className={`mb-6 p-6 rounded-xl ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-white'} shadow-lg transition-colors`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Selamat Datang, Admin!</h2>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Administrator</p>
            </div>
            <button className={`px-6 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium transition-colors flex items-center gap-2 shadow-lg`}>
              <Calendar size={18} />
              Absen Sekarang
            </button>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {stats.map((stat, index) => {
            const StatIcon = stat.icon as any
            return (
              <div key={index} className={`p-5 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
                    <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <StatIcon size={24} className={stat.color} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity and Admin Notes - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Attendance */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Riwayat Absensi Terbaru</h3>
              <button className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}>
                Lihat Semua
              </button>
            </div>
            
            {recentAbsensi.length > 0 ? (
              <div className="space-y-4">
                {recentAbsensi.map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.date}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.time}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Hadir' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : item.status === 'Terlambat'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {item.status}
                        </span>
                        <ChevronRight size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                      </div>
                    </div>
                    <div className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.location}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Belum ada riwayat.
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Catatan Admin</h3>
              <button className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}>
                Tambah Catatan
              </button>
            </div>
            
            {adminNotes.length > 0 ? (
              <div className="space-y-4">
                {adminNotes.map(note => (
                  <div key={note.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${note.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : note.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                        <AlertTriangle size={16} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{note.title}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{note.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Belum ada catatan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors`}>
      {/* Mobile Overlay when sidebar is open on mobile */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
      
      <Sidebar />
      <Header />
      <DashboardContent />
    </div>
  )
}

// Icons for dark mode toggle
const Sun = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const Moon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export default App
