import React from 'react'
import { X, User, Mail, Briefcase, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react'
import { KaryawanItem } from '@/types'

interface KaryawanDetailModalProps {
  karyawan: KaryawanItem | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onViewRiwayat: () => void
}

export function KaryawanDetailModal({
  karyawan,
  isOpen,
  onClose,
  onEdit,
  onViewRiwayat
}: KaryawanDetailModalProps) {
  if (!isOpen || !karyawan) return null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
         data-testid="karyawan-detail-modal">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detail Karyawan
          </h2>
          <button
            onClick={onClose}
            data-testid="close-detail-modal"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Nama & ID */}
          <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <User size={24} className="text-blue-600 dark:text-blue-400 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Nama Lengkap</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {karyawan.nama_depan} {karyawan.nama_belakang}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Username: <span className="font-mono">{karyawan.nama_pengguna}</span>
              </p>
            </div>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Karyawan */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={20} className="text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">ID Karyawan</p>
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white font-mono">
                {karyawan.id_karyawan}
              </p>
            </div>

            {/* Jabatan */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={20} className="text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Jabatan</p>
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {karyawan.jabatan}
              </p>
            </div>

            {/* Email */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={20} className="text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                {karyawan.alamat_surel}
              </p>
            </div>

            {/* Tanggal Masuk */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} className="text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Masuk</p>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(karyawan.tanggal_masuk)}
              </p>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-3">
            {/* Status Wajah */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status Wajah
              </span>
              {karyawan.sudah_daftar_wajah ? (
                <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-semibold">
                  <CheckCircle size={16} />
                  Terdaftar
                </span>
              ) : (
                <span className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-semibold">
                  <XCircle size={16} />
                  Belum Terdaftar
                </span>
              )}
            </div>

            {/* Status Kehadiran */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status Kehadiran Hari Ini
              </span>
              <span className={
                `px-3 py-1 rounded-full text-sm font-semibold ${
                  karyawan.status_kehadiran === 'Hadir'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`
              }>
                {karyawan.status_kehadiran}
              </span>
            </div>
          </div>

          {/* Catatan Admin */}
          {karyawan.catatan_admin && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-400 mb-2">
                📝 Catatan Admin
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {karyawan.catatan_admin}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onViewRiwayat}
            data-testid="view-riwayat-button"
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Lihat Riwayat Absensi
          </button>
          <button
            onClick={onEdit}
            data-testid="edit-karyawan-button"
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Edit Data
          </button>
        </div>
      </div>
    </div>
  )
}
