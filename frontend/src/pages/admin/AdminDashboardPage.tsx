import React, { useState, useEffect } from 'react'
import { Users, CheckCircle, XCircle, TrendingUp, RefreshCw, UserCog, ClipboardList, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { apiService } from '@/services/api'
import { StatistikDashboard, TrendKehadiranResponse, AktivitasTerbaruResponse } from '@/types'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // State untuk data dari API
  const [stats, setStats] = useState<StatistikDashboard>({
    total_karyawan: 0,
    hadir_hari_ini: 0,
    belum_absen: 0,
    tingkat_kehadiran: 0
  })
  const [trendData, setTrendData] = useState<TrendKehadiranResponse | null>(null)
  const [aktivitasData, setAktivitasData] = useState<AktivitasTerbaruResponse | null>(null)

  // Fetch semua data dashboard
  const fetchDashboardData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true)
      else setLoading(true)

      // Parallel fetch untuk performa lebih baik
      const [statistik, trend, aktivitas] = await Promise.all([
        apiService.getStatistik(),
        apiService.getTrendKehadiran(7),
        apiService.getAktivitasTerbaru(5)
      ])

      setStats(statistik)
      setTrendData(trend)
      setAktivitasData(aktivitas)

      if (showToast) {
        toast.success('Data berhasil diperbarui!', {
          position: 'top-right',
          autoClose: 2000
        })
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      toast.error(
        error.response?.data?.detail || 'Gagal memuat data dashboard',
        { position: 'top-right' }
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Format waktu untuk aktivitas
  const formatWaktu = (isoString: string) => {
    const date = new Date(isoString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    const timeStr = date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    if (isToday) {
      return `Hari ini, ${timeStr}`
    } else {
      const dateStr = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      })
      return `${dateStr}, ${timeStr}`
    }
  }

  // Format tanggal untuk chart
  const formatTanggalChart = (tanggal: string) => {
    const date = new Date(tanggal)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    })
  }

  // Stats cards configuration
  const statsCards = [
    { 
      title: 'Total Karyawan', 
      value: stats.total_karyawan.toString(), 
      icon: Users, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Hadir Hari Ini', 
      value: stats.hadir_hari_ini.toString(), 
      icon: CheckCircle, 
      color: 'text-green-600 dark:text-green-400', 
      bg: 'bg-green-50 dark:bg-green-900/20',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      title: 'Belum Absen', 
      value: stats.belum_absen.toString(), 
      icon: XCircle, 
      color: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-50 dark:bg-red-900/20',
      gradient: 'from-red-500 to-red-600'
    },
    { 
      title: 'Tingkat Kehadiran', 
      value: `${stats.tingkat_kehadiran.toFixed(1)}%`, 
      icon: TrendingUp, 
      color: 'text-purple-600 dark:text-purple-400', 
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      gradient: 'from-purple-500 to-purple-600'
    },
  ]

  // Quick actions
  const quickActions = [
    {
      title: 'Kelola Karyawan',
      description: 'Lihat & edit data karyawan',
      icon: UserCog,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      action: () => navigate('/admin/karyawan')
    },
    {
      title: 'Kelola Kehadiran',
      description: 'Monitor & koreksi absensi',
      icon: ClipboardList,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      action: () => navigate('/admin/kehadiran')
    }
  ]

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header dengan Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Admin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Ringkasan kehadiran karyawan</p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="refresh-dashboard-btn"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Memperbarui...' : 'Perbarui Data'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              data-testid={`stat-card-${index}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart dan Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Kehadiran Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trend Kehadiran 7 Hari</h3>
            <Activity size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          {trendData && trendData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="tanggal" 
                  tickFormatter={formatTanggalChart}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  labelFormatter={(label) => formatTanggalChart(label)}
                  formatter={(value: number, name: string) => {
                    if (name === 'jumlah_hadir') return [value, 'Hadir']
                    if (name === 'tingkat_kehadiran') return [`${value}%`, 'Tingkat Kehadiran']
                    return [value, name]
                  }}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'jumlah_hadir') return 'Jumlah Hadir'
                    if (value === 'tingkat_kehadiran') return 'Tingkat Kehadiran (%)'
                    return value
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="jumlah_hadir" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tingkat_kehadiran" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              Tidak ada data trend kehadiran
            </div>
          )}
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Aktivitas Terbaru</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {aktivitasData && aktivitasData.data.length > 0 ? (
              aktivitasData.data.map((aktivitas) => (
                <div 
                  key={aktivitas.id_log} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  data-testid={`aktivitas-${aktivitas.id_log}`}
                >
                  <div className={`p-2 rounded-full ${
                    aktivitas.status === 'SUKSES' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {aktivitas.status === 'SUKSES' ? (
                      <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle size={16} className="text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {aktivitas.nama_lengkap}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {aktivitas.id_karyawan} • {aktivitas.aksi}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatWaktu(aktivitas.waktu)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    aktivitas.status === 'SUKSES'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {aktivitas.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Belum ada aktivitas</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left group"
                data-testid={`quick-action-${index}`}
              >
                <div className={`p-3 rounded-full ${action.bg} group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className={action.color} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{action.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
