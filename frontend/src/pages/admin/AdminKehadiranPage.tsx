import React, { useState, useEffect } from 'react'
import { Calendar, Download, Filter, Eye, UserPlus, RefreshCw } from 'lucide-react'
import { LogKehadiranItem } from '@/types'
import { apiService } from '@/services/api'
import { toast } from 'react-hot-toast'
import { exportKehadiranToCSV } from '@/lib/exportCSV'
import { KehadiranFilterModal } from '@/components/admin/KehadiranFilterModal'
import { ManualAttendanceModal } from '@/components/admin/ManualAttendanceModal'
import { LogDetailModal } from '@/components/admin/LogDetailModal'

export function AdminKehadiranPage() {
  const [kehadiranList, setKehadiranList] = useState<LogKehadiranItem[]>([])
  const [filteredList, setFilteredList] = useState<LogKehadiranItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState('')
  const [filterJabatan, setFilterJabatan] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)
  
  // Modal states
  const [selectedLog, setSelectedLog] = useState<LogKehadiranItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)

  useEffect(() => {
    fetchKehadiran()
  }, [selectedDate])

  useEffect(() => {
    applyFilters()
  }, [filterStatus, filterJabatan, searchQuery, kehadiranList])

  const fetchKehadiran = async () => {
    setIsLoading(true)
    try {
      const data = await apiService.getKehadiran({
        tanggal: selectedDate
      })
      setKehadiranList(data.data)
    } catch (error: any) {
      console.error('Error fetching kehadiran:', error)
      toast.error('Gagal memuat data kehadiran')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchKehadiran()
      toast.success('Data berhasil direfresh! 🔄')
    } catch (error) {
      // Error already handled in fetchKehadiran
    } finally {
      setIsRefreshing(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...kehadiranList]

    // Filter by Status
    if (filterStatus) {
      filtered = filtered.filter(log =>
        log.status.toLowerCase() === filterStatus.toLowerCase()
      )
    }

    // Filter by Jabatan
    if (filterJabatan) {
      filtered = filtered.filter(log =>
        log.jabatan?.toLowerCase().includes(filterJabatan.toLowerCase())
      )
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(log =>
        log.nama_lengkap.toLowerCase().includes(query) ||
        log.id_karyawan.toLowerCase().includes(query)
      )
    }

    setFilteredList(filtered)
  }

  const handleApplyFilters = (filters: any) => {
    if (filters.tanggal) {
      setSelectedDate(filters.tanggal)
    }
    if (filters.status !== undefined) {
      setFilterStatus(filters.status)
    }
    if (filters.jabatan !== undefined) {
      setFilterJabatan(filters.jabatan)
    }
    setShowFilterModal(false)
  }

  const handleResetFilters = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
    setFilterStatus('')
    setFilterJabatan('')
    setSearchQuery('')
  }

  const handleExport = () => {
    if (filteredList.length > 0) {
      exportKehadiranToCSV(filteredList)
      toast.success('Data kehadiran berhasil diexport! 📄')
    } else {
      toast.error('Tidak ada data untuk diexport')
    }
  }

  const handleViewDetail = (log: LogKehadiranItem) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const handleManualSuccess = () => {
    fetchKehadiran()
    toast.success('Kehadiran manual berhasil ditambahkan! ✅')
  }

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get unique jabatan for filter
  const uniqueJabatan = Array.from(new Set(kehadiranList.map(log => log.jabatan).filter(Boolean)))

  return (
    <div className="space-y-6" data-testid="admin-kehadiran-page">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelola Kehadiran</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Total: {filteredList.length} dari {kehadiranList.length} records
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            data-testid="manual-attendance-button"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <UserPlus size={20} />
            Input Manual
          </button>
          <button
            onClick={handleExport}
            data-testid="export-button"
            disabled={filteredList.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Date and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              data-testid="date-picker"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <button
            onClick={handleRefresh}
            data-testid="refresh-button"
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={() => setShowFilterModal(true)}
            data-testid="filter-button"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter size={20} />
            Filter {(filterStatus || filterJabatan) && '(Aktif)'}
          </button>

          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau ID karyawan..."
              data-testid="search-input"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {(filterStatus || filterJabatan || searchQuery) && (
            <button
              onClick={handleResetFilters}
              data-testid="reset-filter-button"
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {(filterStatus || filterJabatan) && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {filterStatus && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm">
                Status: {filterStatus}
              </span>
            )}
            {filterJabatan && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm">
                Jabatan: {filterJabatan}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Memuat data...</p>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="kehadiran-table">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nama Karyawan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID Karyawan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kecocokan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredList.map((log) => (
                  <tr key={log.id_log} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(log.waktu)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                      {formatTime(log.waktu)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.nama_lengkap}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                      {log.id_karyawan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.jabatan || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.status === 'SUKSES' ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          ✓ SUKSES
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          ✗ GAGAL
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.jumlah_cocok !== null ? (
                        <span className={`font-semibold ${
                          log.jumlah_cocok >= 5 ? 'text-green-600 dark:text-green-400' :
                          log.jumlah_cocok >= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {log.jumlah_cocok}/10
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetail(log)}
                        data-testid={`view-detail-${log.id_log}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {filterStatus || filterJabatan || searchQuery
                ? 'Tidak ada data yang sesuai dengan filter'
                : 'Belum ada data kehadiran untuk tanggal ini'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <KehadiranFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={{
          tanggal: selectedDate,
          status: filterStatus,
          jabatan: filterJabatan
        }}
        availableJabatan={uniqueJabatan}
      />

      <ManualAttendanceModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSuccess={handleManualSuccess}
      />

      <LogDetailModal
        log={selectedLog}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  )
}

export default AdminKehadiranPage