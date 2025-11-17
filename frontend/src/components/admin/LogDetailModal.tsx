import React, { useState, useEffect } from 'react'
import { X, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { LogDetailResponse } from '@/types'
import { apiService } from '@/services/api'
import { toast } from 'react-hot-toast'

interface LogDetailModalProps {
  logId: number | null
  isOpen: boolean
  onClose: () => void
}

export function LogDetailModal({
  logId,
  isOpen,
  onClose
}: LogDetailModalProps) {
  const [logData, setLogData] = useState<LogDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && logId) {
      fetchLogDetail()
    }
  }, [isOpen, logId])

  const fetchLogDetail = async () => {
    if (!logId) return

    setIsLoading(true)
    try {
      const data = await apiService.getLogDetail(logId)
      setLogData(data)
    } catch (error: any) {
      console.error('Error fetching log detail:', error)
      toast.error('Gagal memuat detail log')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      day: date.toLocaleDateString('id-ID', { weekday: 'long' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
         data-testid="log-detail-modal">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detail Log Absensi
          </h2>
          <button
            onClick={onClose}
            data-testid="close-log-detail-modal"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Memuat detail...</p>
            </div>
          ) : logData ? (
            <div className="space-y-6">
              {/* Log Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informasi Log
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    ID: #{logData.log.id_log}
                  </span>
                </div>

                {/* Waktu */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Waktu Absensi</span>
                  </div>
                  {(() => {
                    const { date, time, day } = formatDateTime(logData.log.waktu)
                    return (
                      <div className="ml-7">
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {day}, {date}
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {time}
                        </p>
                      </div>
                    )
                  })()}
                </div>

                {/* Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status Absensi</p>
                    <span className={
                      `inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        logData.log.status === 'SUKSES'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`
                    }>
                      {logData.log.status === 'SUKSES' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      {logData.log.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tipe Kehadiran</p>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-semibold">
                      {logData.log.tipe_kehadiran}
                    </span>
                  </div>
                </div>

                {/* Jumlah Cocok */}
                {logData.log.jumlah_cocok !== null && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Matching Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={
                            `h-2 rounded-full transition-all ${
                              logData.log.jumlah_cocok >= 2
                                ? 'bg-green-500'
                                : logData.log.jumlah_cocok === 1
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`
                          }
                          style={{ width: `${(logData.log.jumlah_cocok / 3) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {logData.log.jumlah_cocok}/3
                      </span>
                    </div>
                  </div>
                )}

                {logData.log.jumlah_cocok === null && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300 text-sm">
                      <AlertCircle size={16} />
                      <span>Entry manual - tidak ada matching score</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Karyawan Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informasi Karyawan
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <User size={24} className="text-blue-600 dark:text-blue-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {logData.log.nama_lengkap}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        ID: <span className="font-mono">{logData.log.id_karyawan}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Jabatan</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {logData.log.jabatan}
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                        {logData.karyawan.alamat_surel}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status Kehadiran Saat Ini</p>
                    <span className={
                      `px-3 py-1 rounded-full text-sm font-semibold ${
                        logData.karyawan.status_kehadiran === 'Hadir'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`
                    }>
                      {logData.karyawan.status_kehadiran}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Data tidak ditemukan</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            data-testid="close-button"
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
