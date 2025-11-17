import React, { useState, useEffect } from 'react'
import { X, Download, Calendar } from 'lucide-react'
import { KaryawanItem, RiwayatKaryawanResponse } from '@/types'
import { apiService } from '@/services/api'
import { toast } from 'react-hot-toast'
import { exportRiwayatToCSV } from '@/lib/exportCSV'

interface KaryawanRiwayatModalProps {
  karyawan: KaryawanItem | null
  isOpen: boolean
  onClose: () => void
}

export function KaryawanRiwayatModal({
  karyawan,
  isOpen,
  onClose
}: KaryawanRiwayatModalProps) {
  const [riwayatData, setRiwayatData] = useState<RiwayatKaryawanResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    tanggal_mulai: '',
    tanggal_akhir: ''
  })

  useEffect(() => {
    if (isOpen && karyawan) {
      fetchRiwayat()
    }
  }, [isOpen, karyawan])

  const fetchRiwayat = async () => {
    if (!karyawan) return

    setIsLoading(true)
    try {
      const data = await apiService.getKaryawanRiwayat(
        karyawan.id_pengguna,
        dateRange.tanggal_mulai || undefined,
        dateRange.tanggal_akhir || undefined
      )
      setRiwayatData(data)
    } catch (error: any) {
      console.error('Error fetching riwayat:', error)
      toast.error('Gagal memuat riwayat absensi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilter = () => {
    fetchRiwayat()
  }

  const handleExport = () => {
    if (riwayatData && riwayatData.riwayat.length > 0) {
      const namaLengkap = `${karyawan?.nama_depan}_${karyawan?.nama_belakang}`
      exportRiwayatToCSV(riwayatData.riwayat, namaLengkap)
      toast.success('Data riwayat berhasil diexport! 📄')
    } else {
      toast.error('Tidak ada data untuk diexport')
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (!isOpen || !karyawan) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
         data-testid="karyawan-riwayat-modal">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Riwayat Absensi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {karyawan.nama_depan} {karyawan.nama_belakang} ({karyawan.id_karyawan})
            </p>
          </div>
          <button
            onClick={onClose}
            data-testid="close-riwayat-modal"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={dateRange.tanggal_mulai}
                onChange={(e) => setDateRange(prev => ({ ...prev, tanggal_mulai: e.target.value }))}
                data-testid="filter-tanggal-mulai"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={dateRange.tanggal_akhir}
                onChange={(e) => setDateRange(prev => ({ ...prev, tanggal_akhir: e.target.value }))}
                data-testid="filter-tanggal-akhir"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                data-testid="apply-filter-button"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <Calendar size={20} className="inline mr-2" />
                Filter
              </button>
              <button
                onClick={handleExport}
                data-testid="export-riwayat-button"
                disabled={!riwayatData || riwayatData.riwayat.length === 0}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} className="inline mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Memuat riwayat...</p>
            </div>
          ) : riwayatData && riwayatData.riwayat.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Total: {riwayatData.total} record
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Waktu
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Tipe
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Cocok
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {riwayatData.riwayat.map((log) => {
                      const { date, time } = formatDateTime(log.waktu)
                      return (
                        <tr key={log.id_log} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {date}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
                            {time}
                          </td>
                          <td className="px-4 py-3">
                            <span className={
                              `px-2 py-1 rounded-full text-xs font-semibold ${
                                log.status === 'SUKSES'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`
                            }>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {log.tipe_kehadiran}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {log.jumlah_cocok !== null ? `${log.jumlah_cocok}/3` : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Tidak ada riwayat absensi untuk periode ini
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
