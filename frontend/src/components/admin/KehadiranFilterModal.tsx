import React, { useState } from 'react'
import { X } from 'lucide-react'

interface FilterOptions {
  tanggal?: string
  status_filter?: string
  jabatan?: string
  search?: string
}

interface KehadiranFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  currentFilters: FilterOptions
}

export function KehadiranFilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilters
}: KehadiranFilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters)

  if (!isOpen) return null

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    const emptyFilters = {
      tanggal: new Date().toISOString().split('T')[0],
      status_filter: '',
      jabatan: '',
      search: ''
    }
    setFilters(emptyFilters)
    onApply(emptyFilters)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
         data-testid="filter-kehadiran-modal">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Filter Kehadiran
          </h2>
          <button
            onClick={onClose}
            data-testid="close-filter-modal"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={filters.tanggal || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, tanggal: e.target.value }))}
              data-testid="filter-input-tanggal"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status_filter || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status_filter: e.target.value }))}
              data-testid="filter-select-status"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Semua Status</option>
              <option value="SUKSES">SUKSES</option>
              <option value="GAGAL">GAGAL</option>
            </select>
          </div>

          {/* Jabatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jabatan
            </label>
            <input
              type="text"
              value={filters.jabatan || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, jabatan: e.target.value }))}
              placeholder="Filter berdasarkan jabatan"
              data-testid="filter-input-jabatan"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cari Nama/ID
            </label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Cari nama atau ID karyawan"
              data-testid="filter-input-search"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            data-testid="reset-filter-button"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            data-testid="apply-filter-button"
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  )
}
