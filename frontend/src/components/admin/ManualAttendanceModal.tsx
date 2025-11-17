import React, { useState } from 'react'
import { X } from 'lucide-react'
import { ManualAttendanceRequest } from '@/types'
import { apiService } from '@/services/api'
import { toast } from 'react-hot-toast'

interface ManualAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ManualAttendanceModal({
  isOpen,
  onClose,
  onSuccess
}: ManualAttendanceModalProps) {
  const [formData, setFormData] = useState<ManualAttendanceRequest>({
    id_pengguna: 0,
    tanggal: new Date().toISOString().split('T')[0],
    waktu: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    tipe_kehadiran: 'Hadir',
    catatan: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.id_pengguna <= 0) {
      toast.error('ID Pengguna harus diisi dengan benar')
      return
    }

    setIsSubmitting(true)

    try {
      await apiService.createManualAttendance(formData)
      toast.success('Entry kehadiran manual berhasil dibuat! ✅')
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        id_pengguna: 0,
        tanggal: new Date().toISOString().split('T')[0],
        waktu: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        tipe_kehadiran: 'Hadir',
        catatan: ''
      })
    } catch (error: any) {
      console.error('Error creating manual attendance:', error)
      const errorMsg = error.response?.data?.detail || 'Gagal membuat entry manual'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'id_pengguna' ? parseInt(value) || 0 : value
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
         data-testid="manual-attendance-modal">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Input Kehadiran Manual
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Untuk koreksi atau entry darurat
            </p>
          </div>
          <button
            onClick={onClose}
            data-testid="close-manual-modal"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ID Pengguna */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID Pengguna *
            </label>
            <input
              type="number"
              name="id_pengguna"
              value={formData.id_pengguna || ''}
              onChange={handleChange}
              required
              min="1"
              data-testid="input-id-pengguna"
              placeholder="Masukkan ID pengguna"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cek ID pengguna di halaman Kelola Karyawan
            </p>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tanggal *
            </label>
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              required
              data-testid="input-tanggal"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Waktu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Waktu *
            </label>
            <input
              type="time"
              name="waktu"
              value={formData.waktu}
              onChange={handleChange}
              required
              data-testid="input-waktu"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Tipe Kehadiran */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipe Kehadiran *
            </label>
            <select
              name="tipe_kehadiran"
              value={formData.tipe_kehadiran}
              onChange={handleChange}
              required
              data-testid="select-tipe-kehadiran"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Hadir">Hadir</option>
              <option value="Izin">Izin</option>
              <option value="Cuti">Cuti</option>
              <option value="Sakit">Sakit</option>
            </select>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catatan
            </label>
            <textarea
              name="catatan"
              value={formData.catatan}
              onChange={handleChange}
              rows={3}
              data-testid="input-catatan"
              placeholder="Catatan untuk entry manual ini (opsional)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Info Alert */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ Entry manual akan otomatis berstatus SUKSES dan tidak memiliki matching score.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              data-testid="cancel-manual-button"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="submit-manual-button"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : 'Buat Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
