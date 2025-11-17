import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, Edit } from 'lucide-react'
import { KaryawanItem } from '@/types'
import { apiService } from '@/services/api'
import { toast } from 'react-hot-toast'
import { exportKaryawanToCSV } from '@/lib/exportCSV'
import { KaryawanDetailModal } from '@/components/admin/KaryawanDetailModal'
import { KaryawanEditModal } from '@/components/admin/KaryawanEditModal'
import { KaryawanRiwayatModal } from '@/components/admin/KaryawanRiwayatModal'

export function AdminKaryawanPage() {
  const [karyawanList, setKaryawanList] = useState<KaryawanItem[]>([])
  const [filteredList, setFilteredList] = useState<KaryawanItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterJabatan, setFilterJabatan] = useState('')
  const [filterStatusWajah, setFilterStatusWajah] = useState('')
  const [filterStatusKehadiran, setFilterStatusKehadiran] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  // Modal states
  const [selectedKaryawan, setSelectedKaryawan] = useState<KaryawanItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRiwayatModal, setShowRiwayatModal] = useState(false)

  useEffect(() => {
    fetchKaryawan()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, filterJabatan, filterStatusWajah, filterStatusKehadiran, karyawanList])

  const fetchKaryawan = async () => {
    setIsLoading(true)
    try {
      const data = await apiService.getDaftarKaryawan()
      setKaryawanList(data.data)
    } catch (error: any) {
      console.error('Error fetching karyawan:', error)
      toast.error('Gagal memuat data karyawan')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...karyawanList]

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(k =>
        k.nama_depan.toLowerCase().includes(query) ||
        k.nama_belakang.toLowerCase().includes(query) ||
        k.id_karyawan.toLowerCase().includes(query) ||
        k.alamat_surel.toLowerCase().includes(query)
      )
    }

    // Filter Jabatan
    if (filterJabatan) {
      filtered = filtered.filter(k =>
        k.jabatan.toLowerCase().includes(filterJabatan.toLowerCase())
      )
    }

    // Filter Status Wajah
    if (filterStatusWajah) {
      const isRegistered = filterStatusWajah === 'terdaftar'
      filtered = filtered.filter(k => k.sudah_daftar_wajah === isRegistered)
    }

    // Filter Status Kehadiran
    if (filterStatusKehadiran) {
      filtered = filtered.filter(k =>
        k.status_kehadiran.toLowerCase().includes(filterStatusKehadiran.toLowerCase())
      )
    }

    setFilteredList(filtered)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterJabatan('')
    setFilterStatusWajah('')
    setFilterStatusKehadiran('')
    setShowFilterPanel(false)
  }

  const handleExport = () => {
    if (filteredList.length > 0) {
      exportKaryawanToCSV(filteredList)
      toast.success('Data karyawan berhasil diexport! 📄')
    } else {
      toast.error('Tidak ada data untuk diexport')
    }
  }

  const handleViewDetail = (karyawan: KaryawanItem) => {
    setSelectedKaryawan(karyawan)
    setShowDetailModal(true)
  }

  const handleEdit = (karyawan: KaryawanItem) => {
    setSelectedKaryawan(karyawan)
    setShowEditModal(true)
  }

  const handleViewRiwayat = (karyawan: KaryawanItem) => {
    setSelectedKaryawan(karyawan)
    setShowRiwayatModal(true)
  }

  const handleEditSuccess = () => {
    fetchKaryawan()
    toast.success('Berhasil memperbarui data!')
  }

  // Get unique jabatan for filter
  const uniqueJabatan = Array.from(new Set(karyawanList.map(k => k.jabatan)))

  return (
    <div className="space-y-6" data-testid="admin-karyawan-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelola Karyawan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Total: {filteredList.length} dari {karyawanList.length} karyawan
          </p>
        </div>
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

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, ID, atau email..."
              data-testid="search-input"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            data-testid="toggle-filter-button"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter size={20} />
            Filter {(filterJabatan || filterStatusWajah || filterStatusKehadiran) && '(Aktif)'}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-t border-gray-200 dark:border-gray-600">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jabatan
              </label>
              <select
                value={filterJabatan}
                onChange={(e) => setFilterJabatan(e.target.value)}
                data-testid="filter-jabatan"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Semua Jabatan</option>
                {uniqueJabatan.map(jabatan => (
                  <option key={jabatan} value={jabatan}>{jabatan}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status Wajah
              </label>
              <select
                value={filterStatusWajah}
                onChange={(e) => setFilterStatusWajah(e.target.value)}
                data-testid="filter-status-wajah"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Semua Status</option>
                <option value="terdaftar">Terdaftar</option>
                <option value="belum">Belum Terdaftar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status Kehadiran
              </label>
              <select
                value={filterStatusKehadiran}
                onChange={(e) => setFilterStatusKehadiran(e.target.value)}
                data-testid="filter-status-kehadiran"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="tidak">Tidak Ada Data</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={handleResetFilters}
                data-testid="reset-filter-button"
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Reset Filter
              </button>
            </div>
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
            <table className="w-full" data-testid="karyawan-table">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status Wajah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status Kehadiran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredList.map((karyawan) => (
                  <tr key={karyawan.id_pengguna} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                      {karyawan.id_karyawan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {karyawan.nama_depan} {karyawan.nama_belakang}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        @{karyawan.nama_pengguna}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {karyawan.jabatan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {karyawan.alamat_surel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {karyawan.sudah_daftar_wajah ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          ✓ Terdaftar
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          ✗ Belum
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={
                        `px-2 py-1 text-xs font-semibold rounded-full ${
                          karyawan.status_kehadiran === 'Hadir'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`
                      }>
                        {karyawan.status_kehadiran}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(karyawan)}
                          data-testid={`view-detail-${karyawan.id_karyawan}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(karyawan)}
                          data-testid={`edit-${karyawan.id_karyawan}`}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || filterJabatan || filterStatusWajah || filterStatusKehadiran
                ? 'Tidak ada karyawan yang sesuai dengan filter'
                : 'Belum ada data karyawan'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <KaryawanDetailModal
        karyawan={selectedKaryawan}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onEdit={() => {
          setShowDetailModal(false)
          setShowEditModal(true)
        }}
        onViewRiwayat={() => {
          setShowDetailModal(false)
          setShowRiwayatModal(true)
        }}
      />

      <KaryawanEditModal
        karyawan={selectedKaryawan}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />

      <KaryawanRiwayatModal
        karyawan={selectedKaryawan}
        isOpen={showRiwayatModal}
        onClose={() => setShowRiwayatModal(false)}
      />
    </div>
  )
}

export default AdminKaryawanPage
