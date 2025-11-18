import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { apiService } from '@/services/api'
import { DashboardKaryawanStats, RiwayatSingkatItem } from '@/types'
import { toast } from 'react-toastify'
import { 
  User, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  UserCheck, 
  Camera,
  History,
  FileText,
  RefreshCw,
  Clock,
  Award
} from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardKaryawanStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Load dashboard stats
  const loadDashboard = async (showToast: boolean = false) => {
    try {
      if (showToast) setRefreshing(true)
      const data = await apiService.getDashboardStats()
      setStats(data)
      if (showToast) toast.success('Dashboard berhasil diperbarui!')
    } catch (error: any) {
      console.error('Error loading dashboard:', error)
      toast.error(error.response?.data?.detail || 'Gagal memuat data dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // Format tanggal Indonesia
  const formatTanggal = (tanggal: string) => {
    const date = new Date(tanggal)
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${date.getDate()} ${bulan[date.getMonth()]}`
  }

  // Status color
  const getStatusColor = (status: string) => {
    if (status === 'Hadir') return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (status === 'Terlambat') return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    if (status === 'Belum Absen') return 'text-gray-600 bg-gray-50 dark:bg-gray-800'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  // Badge color for riwayat status
  const getStatusBadgeColor = (status: string) => {
    return status === 'SUKSES' 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Banner Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Bottom sections skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Gagal memuat data dashboard</p>
        <Button onClick={() => loadDashboard()} className="mt-4">Coba Lagi</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="karyawan-dashboard">
      {/* Welcome Banner with Gradient */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg p-6 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <User className="w-8 h-8" />
              <h1 className="text-2xl md:text-3xl font-bold" data-testid="welcome-title">
                Selamat Datang, {stats.nama_lengkap}!
              </h1>
            </div>
            <p className="text-blue-100 flex items-center gap-2">
              <Award className="w-4 h-4" />
              {stats.jabatan} • ID: {stats.id_karyawan}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              data-testid="refresh-button"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            {stats.sudah_absen_hari_ini ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/riwayat')}
                className="bg-white text-blue-600 hover:bg-blue-50"
                data-testid="lihat-riwayat-button"
              >
                <History className="w-5 h-5 mr-2" />
                Lihat Riwayat
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/absen')}
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                data-testid="absen-sekarang-button"
              >
                <Camera className="w-5 h-5 mr-2" />
                Absen Sekarang
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Hari Ini */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
          data-testid="status-hari-ini-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Status Hari Ini
              </p>
              <p className={`text-2xl font-bold px-3 py-1 rounded-full inline-flex items-center gap-2 ${getStatusColor(stats.status_kehadiran_hari_ini)}`}>
                {stats.status_kehadiran_hari_ini === 'Hadir' && <CheckCircle2 className="w-5 h-5" />}
                {stats.status_kehadiran_hari_ini === 'Terlambat' && <Clock className="w-5 h-5" />}
                {stats.status_kehadiran_hari_ini === 'Belum Absen' && <AlertCircle className="w-5 h-5" />}
                {stats.status_kehadiran_hari_ini}
              </p>
            </div>
            {stats.sudah_absen_hari_ini ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-gray-400" />
            )}
          </div>
        </div>

        {/* Total Hadir Bulan Ini */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow"
          data-testid="total-hadir-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Total Hadir Bulan Ini
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.total_hadir_bulan_ini}
                <span className="text-sm text-gray-500 ml-2">/ {stats.total_hari_kerja_bulan_ini} hari</span>
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Tingkat Kehadiran */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow"
          data-testid="tingkat-kehadiran-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Tingkat Kehadiran
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.tingkat_kehadiran_bulan_ini.toFixed(1)}%
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.tingkat_kehadiran_bulan_ini, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Wajah */}
        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${
            stats.sudah_daftar_wajah ? 'border-green-500' : 'border-red-500'
          } hover:shadow-lg transition-shadow`}
          data-testid="status-wajah-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Status Wajah
              </p>
              <p className={`text-2xl font-bold ${
                stats.sudah_daftar_wajah 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stats.sudah_daftar_wajah ? '✓ Terdaftar' : '✗ Belum Terdaftar'}
              </p>
              {!stats.sudah_daftar_wajah && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/daftar-wajah')}
                  className="mt-3"
                  data-testid="daftar-wajah-button"
                >
                  Daftar Sekarang
                </Button>
              )}
            </div>
            {stats.sudah_daftar_wajah ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid - Riwayat & Catatan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Riwayat Absensi Terbaru */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" data-testid="riwayat-section">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Riwayat Absensi Terbaru
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/riwayat')}
              data-testid="lihat-semua-button"
            >
              Lihat Semua →
            </Button>
          </div>
          
          <div className="space-y-3">
            {stats.riwayat_terbaru.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada riwayat absensi</p>
              </div>
            ) : (
              stats.riwayat_terbaru.map((item: RiwayatSingkatItem, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTanggal(item.tanggal)}
                      </p>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {item.waktu}
                      </p>
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  {item.jumlah_cocok !== null && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Kecocokan</p>
                      <p className={`text-sm font-bold ${
                        item.jumlah_cocok >= 5 ? 'text-green-600' : 
                        item.jumlah_cocok >= 3 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {item.jumlah_cocok}/5
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Catatan Karyawan */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" data-testid="catatan-karyawan-section">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Catatan Karyawan
          </h3>
          
          {stats.catatan_admin ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {stats.catatan_admin}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tidak ada catatan dari admin
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Aksi Cepat
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profil')}
                data-testid="profil-button"
                className="justify-start"
              >
                <User className="w-4 h-4 mr-2" />
                Profil Saya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/riwayat')}
                data-testid="riwayat-lengkap-button"
                className="justify-start"
              >
                <History className="w-4 h-4 mr-2" />
                Riwayat Lengkap
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
