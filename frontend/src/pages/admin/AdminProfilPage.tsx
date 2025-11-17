import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { User, Mail, Briefcase, Calendar, Shield, Edit2, Save, X } from 'lucide-react'
import { toast } from 'react-toastify'

export function AdminProfilPage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    nama_depan: user?.nama_depan || '',
    nama_belakang: user?.nama_belakang || '',
    email: user?.email || '',
    jabatan: user?.jabatan || '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nama_depan: user.nama_depan || '',
        nama_belakang: user.nama_belakang || '',
        email: user.email || '',
        jabatan: user.jabatan || '',
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Implementasi API update profil
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Profil berhasil diperbarui!', {
        position: 'top-right',
        autoClose: 2000
      })
      setIsEditing(false)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Gagal memperbarui profil', {
        position: 'top-right'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      nama_depan: user?.nama_depan || '',
      nama_belakang: user?.nama_belakang || '',
      email: user?.email || '',
      jabatan: user?.jabatan || '',
    })
    setIsEditing(false)
  }

  const profileFields = [
    {
      icon: User,
      label: 'Nama Depan',
      value: formData.nama_depan,
      name: 'nama_depan',
      editable: true
    },
    {
      icon: User,
      label: 'Nama Belakang',
      value: formData.nama_belakang,
      name: 'nama_belakang',
      editable: true
    },
    {
      icon: Mail,
      label: 'Email',
      value: formData.email,
      name: 'email',
      editable: true
    },
    {
      icon: Briefcase,
      label: 'Jabatan',
      value: formData.jabatan,
      name: 'jabatan',
      editable: true
    },
    {
      icon: Shield,
      label: 'Role',
      value: user?.role || 'admin',
      name: 'role',
      editable: false
    },
    {
      icon: Calendar,
      label: 'Tanggal Bergabung',
      value: user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : '-',
      name: 'created_at',
      editable: false
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil Admin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola informasi profil Anda</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-500/30"
            data-testid="edit-profile-btn"
          >
            <Edit2 size={18} />
            Edit Profil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              data-testid="cancel-edit-btn"
            >
              <X size={18} />
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition-all shadow-lg shadow-green-500/30 disabled:opacity-50"
              data-testid="save-profile-btn"
            >
              <Save size={18} />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header dengan gradient */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-500"></div>
        
        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="-mt-16 mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white dark:ring-gray-800 shadow-xl">
              {user?.nama_depan?.charAt(0)}{user?.nama_belakang?.charAt(0) || ''}
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.nama_lengkap || `${user?.nama_depan || ''} ${user?.nama_belakang || ''}`}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user?.jabatan || 'Administrator'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {profileFields.map((field, index) => {
                const Icon = field.icon
                return (
                  <div key={index} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Icon size={16} />
                      {field.label}
                    </label>
                    {isEditing && field.editable ? (
                      <input
                        type="text"
                        name={field.name}
                        value={field.value}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        data-testid={`input-${field.name}`}
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        {field.value || '-'}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Akun</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Admin</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Level Akses</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">Aktif</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Status Akun</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user?.id_karyawan || '-'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">ID Karyawan</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfilPage