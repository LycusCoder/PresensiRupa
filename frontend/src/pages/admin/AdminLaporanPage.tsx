import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  FileText,
  Download,
  RefreshCw,
  Calendar,
  ChevronLeft
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { apiService } from '@/services/api'
import { 
  StatistikJabatanResponse,
  TrendBulananResponse,
  KeterlambatanResponse,
  RingkasanBulananResponse
} from '@/types'

// FIX: Mengubah dari export default function menjadi named export function
export function AdminLaporanPage() {
  const navigate = useNavigate()
  
  // State untuk data
  const [statistikJabatan, setStatistikJabatan] = useState<StatistikJabatanResponse | null>(null)
  const [trendBulanan, setTrendBulanan] = useState<TrendBulananResponse | null>(null)
  const [keterlambatan, setKeterlambatan] = useState<KeterlambatanResponse | null>(null)
  const [ringkasan, setRingkasan] = useState<RingkasanBulananResponse | null>(null)
  
  // Loading states
  const [loadingJabatan, setLoadingJabatan] = useState(true)
  const [loadingTrend, setLoadingTrend] = useState(true)
  const [loadingTerlambat, setLoadingTerlambat] = useState(true)
  const [loadingRingkasan, setLoadingRingkasan] = useState(true)
  
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  )
  const [trendMonths, setTrendMonths] = useState<number>(6)

  useEffect(() => {
    loadAllData()
  }, [selectedMonth, trendMonths])

  const loadAllData = async () => {
    // Load semua data secara parallel
    await Promise.all([
      loadStatistikJabatan(),
      loadTrendBulanan(),
      loadKeterlambatan(),
      loadRingkasan()
    ])
  }

  const loadStatistikJabatan = async () => {
    setLoadingJabatan(true)
    try {
      const data = await apiService.getStatistikJabatan(selectedMonth)
      setStatistikJabatan(data)
    } catch (error: any) {
      console.error('Error loading statistik jabatan:', error)
      toast.error('Gagal memuat statistik jabatan')
    } finally {
      setLoadingJabatan(false)
    }
  }

  const loadTrendBulanan = async () => {
    setLoadingTrend(true)
    try {
      const data = await apiService.getTrendBulanan(trendMonths)
      setTrendBulanan(data)
    } catch (error: any) {
      console.error('Error loading trend bulanan:', error)
      toast.error('Gagal memuat trend bulanan')
    } finally {
      setLoadingTrend(false)
    }
  }

  const loadKeterlambatan = async () => {
    setLoadingTerlambat(true)
    try {
      const data = await apiService.getLaporanKeterlambatan(selectedMonth, 10)
      setKeterlambatan(data)
    } catch (error: any) {
      console.error('Error loading keterlambatan:', error)
      toast.error('Gagal memuat laporan keterlambatan')
    } finally {
      setLoadingTerlambat(false)
    }
  }

  const loadRingkasan = async () => {
    setLoadingRingkasan(true)
    try {
      const data = await apiService.getRingkasanBulanan(selectedMonth)
      setRingkasan(data)
    } catch (error: any) {
      console.error('Error loading ringkasan:', error)
      toast.error('Gagal memuat ringkasan bulanan')
    } finally {
      setLoadingRingkasan(false)
    }
  }

  const handleRefresh = () => {
    toast.promise(loadAllData(), {
      loading: 'Memperbarui data...',
      success: 'Data berhasil diperbarui!',
      error: 'Gagal memperbarui data'
    })
  }

  const handleExportPDF = () => {
    toast.success('Fitur export PDF akan segera tersedia!')
    // TODO: Implementasi export PDF menggunakan library seperti jsPDF atau html2pdf
  }

  const formatBulan = (bulanStr: string) => {
    const [year, month] = bulanStr.split('-')
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                data-testid="back-to-dashboard-btn"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Laporan & Analytics
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Analisis kehadiran dan performa karyawan
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Month Picker */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  data-testid="month-picker"
                />
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                data-testid="refresh-btn"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>

              {/* Export PDF Button */}
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                data-testid="export-pdf-btn"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Ringkasan Bulanan - Top Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" data-testid="ringkasan-section">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ringkasan Bulan {selectedMonth && formatBulan(selectedMonth)}
              </h2>
            </div>
          </div>

          {loadingRingkasan ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          ) : ringkasan ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">Total Karyawan</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-white mt-2">
                    {ringkasan.total_karyawan}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-700 dark:text-green-300 font-semibold">Rata-rata Kehadiran</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-white mt-2">
                    {ringkasan.rata_rata_kehadiran.toFixed(1)}%
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">Absensi Sukses</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-white mt-2">
                    {ringkasan.total_absensi_sukses}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-700 dark:text-red-300 font-semibold">Absensi Gagal</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-white mt-2">
                    {ringkasan.total_absensi_gagal}
                  </p>
                </div>
              </div>

              {/* Karyawan Terbaik */}
              {ringkasan.karyawan_terbaik && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                    🏆 Karyawan Terbaik Bulan Ini
                  </p>
                  <p className="text-lg font-bold text-yellow-900 dark:text-yellow-200">
                    {ringkasan.karyawan_terbaik.nama_depan} {ringkasan.karyawan_terbaik.nama_belakang}
                    <span className="text-sm font-normal ml-2">
                      ({ringkasan.karyawan_terbaik.jabatan} - {ringkasan.karyawan_terbaik.id_karyawan})
                    </span>
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Tidak ada data ringkasan</p>
          )}
        </div>

        {/* Trend Bulanan Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" data-testid="trend-chart">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Trend Kehadiran Bulanan
              </h2>
            </div>
            
            {/* Month Range Selector */}
            <select
              value={trendMonths}
              onChange={(e) => setTrendMonths(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              data-testid="trend-months-select"
            >
              <option value={3}>3 Bulan</option>
              <option value={6}>6 Bulan</option>
              <option value={9}>9 Bulan</option>
              <option value={12}>12 Bulan</option>
            </select>
          </div>

          {loadingTrend ? (
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ) : trendBulanan && trendBulanan.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendBulanan.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="bulan" 
                  stroke="#9CA3AF"
                  tickFormatter={(val) => {
                    const [, month] = val.split('-')
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
                    return months[parseInt(month) - 1]
                  }}
                />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any) => [`${value.toFixed(1)}%`, 'Kehadiran']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rata_rata_kehadiran" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Tingkat Kehadiran (%)"
                  dot={{ fill: '#10B981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              Tidak ada data trend
            </p>
          )}
        </div>

        {/* Statistik per Jabatan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" data-testid="jabatan-chart">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Statistik per Jabatan
            </h2>
          </div>

          {loadingJabatan ? (
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ) : statistikJabatan && statistikJabatan.data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistikJabatan.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="jabatan" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="tingkat_kehadiran" 
                    fill="#3B82F6" 
                    name="Tingkat Kehadiran (%)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* Table Detail */}
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Jabatan
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Total Karyawan
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Total Hadir
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Tingkat Kehadiran
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {statistikJabatan.data.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.jabatan}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300">
                          {item.total_karyawan}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300">
                          {item.total_hadir}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span className={`px-3 py-1 rounded-full font-semibold ${
                            item.tingkat_kehadiran >= 90 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : item.tingkat_kehadiran >= 75
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {item.tingkat_kehadiran.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              Tidak ada data statistik jabatan
            </p>
          )}
        </div>

        {/* Laporan Keterlambatan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" data-testid="keterlambatan-section">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Laporan Keterlambatan
            </h2>
            {keterlambatan && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                (Batas waktu: {keterlambatan.batas_jam})
              </span>
            )}
          </div>

          {loadingTerlambat ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          ) : keterlambatan && keterlambatan.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Nama Karyawan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Jabatan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Total Terlambat
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Rata-rata Jam
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {keterlambatan.data.map((item, index) => (
                    <tr key={item.id_pengguna} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? 'text-red-600' :
                          index === 1 ? 'text-orange-600' :
                          index === 2 ? 'text-yellow-600' :
                          'text-gray-400'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.nama_lengkap}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.id_karyawan}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.jabatan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full font-semibold text-sm">
                          {item.total_terlambat}x
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-gray-700 dark:text-gray-300">
                        {item.jam_rata_rata}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada keterlambatan di bulan ini! 🎉
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminLaporanPage