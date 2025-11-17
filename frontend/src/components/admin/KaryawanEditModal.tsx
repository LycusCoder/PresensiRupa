import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { KaryawanItem, UpdateKaryawanRequest } from '@/types'
import { apiService } from '@/services/api'
import { toast } from 'react-hot-toast'

interface KaryawanEditModalProps {
  karyawan: KaryawanItem | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function KaryawanEditModal({
  karyawan,
  isOpen,
  onClose,
  onSuccess
}: KaryawanEditModalProps) {
  const [formData, setFormData] = useState<UpdateKaryawanRequest>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (karyawan) {
      setFormData({
        nama_depan: karyawan.nama_depan,
        nama_belakang: karyawan.nama_belakang,
        jabatan: karyawan.jabatan,
        alamat_surel: karyawan.alamat_surel,
        catatan_admin: karyawan.catatan_admin || ''
      })
    }
  }, [karyawan])

  if (!isOpen || !karyawan) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await apiService.updateKaryawan(karyawan.id_pengguna, formData)
      toast.success('Data karyawan berhasil diupdate! ✅')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error updating karyawan:', error)
      const errorMsg = error.response?.data?.detail || 'Gagal mengupdate data karyawan'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
         data-testid="karyawan-edit-modal">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Data Karyawan
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {karyawan.id_karyawan} - {karyawan.nama_depan} {karyawan.nama_belakang}
            </p>
          </div>
          <button
            onClick={onClose}
            data-testid="close-edit-modal"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nama Depan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nama Depan *
            </label>
            <input
              type="text"
              name="nama_depan"
              value={formData.nama_depan || ''}
              onChange={handleChange}
              required
              data-testid="input-nama-depan"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Nama Belakang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nama Belakang *
            </label>
            <input
              type="text"
              name="nama_belakang"
              value={formData.nama_belakang || ''}
              onChange={handleChange}
              required
              data-testid="input-nama-belakang"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Jabatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jabatan *
            </label>
            <input
              type="text"
              name="jabatan"
              value={formData.jabatan || ''}
              onChange={handleChange}
              required
              data-testid="input-jabatan"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="alamat_surel"
              value={formData.alamat_surel || ''}
              onChange={handleChange}
              required
              data-testid="input-email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Catatan Admin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catatan Admin
            </label>
            <textarea
              name="catatan_admin"
              value={formData.catatan_admin || ''}
              onChange={handleChange}
              rows={3}
              data-testid="input-catatan-admin"
              placeholder="Catatan khusus dari admin..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              data-testid="cancel-edit-button"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="submit-edit-button"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
