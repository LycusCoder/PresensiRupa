import React, { useState } from 'react'
import { 
  Settings, 
  Bell, 
  Lock, 
  Globe, 
  Mail, 
  Shield,
  Clock,
  Database,
  Save,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-toastify'

export function AdminPengaturanPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Notifikasi
    emailNotifications: true,
    pushNotifications: true,
    dailyReport: true,
    
    // Sistem
    autoBackup: true,
    backupFrequency: 'daily',
    timezone: 'Asia/Jakarta',
    language: 'id',
    
    // Keamanan
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    
    // Absensi
    autoClockOut: true,
    clockOutTime: '18:00',
    lateThreshold: '09:00',
    minMatchScore: '5',
  })

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Implementasi API save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Pengaturan berhasil disimpan!', {
        position: 'top-right',
        autoClose: 2000
      })
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error('Gagal menyimpan pengaturan', {
        position: 'top-right'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSettings({
      emailNotifications: true,
      pushNotifications: true,
      dailyReport: true,
      autoBackup: true,
      backupFrequency: 'daily',
      timezone: 'Asia/Jakarta',
      language: 'id',
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordExpiry: '90',
      autoClockOut: true,
      clockOutTime: '18:00',
      lateThreshold: '09:00',
      minMatchScore: '5',
    })
    toast.info('Pengaturan direset ke default', {
      position: 'top-right',
      autoClose: 2000
    })
  }

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
      data-testid="toggle-switch"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola konfigurasi sistem PresensiRupa</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            data-testid="reset-settings-btn"
          >
            <RefreshCw size={18} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
            data-testid="save-settings-btn"
          >
            <Save size={18} />
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Notifikasi Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Bell className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifikasi</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Email Notifikasi</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Terima notifikasi melalui email</p>
            </div>
            <ToggleSwitch 
              enabled={settings.emailNotifications} 
              onChange={() => handleToggle('emailNotifications')} 
            />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Push Notifikasi</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notifikasi push di browser</p>
            </div>
            <ToggleSwitch 
              enabled={settings.pushNotifications} 
              onChange={() => handleToggle('pushNotifications')} 
            />
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Laporan Harian</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kirim laporan kehadiran setiap hari</p>
            </div>
            <ToggleSwitch 
              enabled={settings.dailyReport} 
              onChange={() => handleToggle('dailyReport')} 
            />
          </div>
        </div>
      </div>

      {/* Sistem Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Database className="text-green-600 dark:text-green-400" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sistem</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Auto Backup</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Backup otomatis database</p>
            </div>
            <ToggleSwitch 
              enabled={settings.autoBackup} 
              onChange={() => handleToggle('autoBackup')} 
            />
          </div>
          
          <div className="py-3 border-b border-gray-200 dark:border-gray-700">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Frekuensi Backup
            </label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              data-testid="backup-frequency-select"
            >
              <option value="hourly">Setiap Jam</option>
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>
          
          <div className="py-3 border-b border-gray-200 dark:border-gray-700">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              <Globe className="inline mr-2" size={16} />
              Zona Waktu
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              data-testid="timezone-select"
            >
              <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
              <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
              <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
            </select>
          </div>
          
          <div className="py-3">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              <Globe className="inline mr-2" size={16} />
              Bahasa
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              data-testid="language-select"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Keamanan Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Shield className="text-red-600 dark:text-red-400" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Keamanan</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Keamanan ekstra dengan 2FA</p>
            </div>
            <ToggleSwitch 
              enabled={settings.twoFactorAuth} 
              onChange={() => handleToggle('twoFactorAuth')} 
            />
          </div>
          
          <div className="py-3 border-b border-gray-200 dark:border-gray-700">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              <Clock className="inline mr-2" size={16} />
              Session Timeout (menit)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              data-testid="session-timeout-input"
            />
          </div>
          
          <div className="py-3">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              <Lock className="inline mr-2" size={16} />
              Password Expiry (hari)
            </label>
            <input
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              data-testid="password-expiry-input"
            />
          </div>
        </div>
      </div>

      {/* Absensi Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Clock className="text-purple-600 dark:text-purple-400" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Absensi</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Auto Clock Out</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Otomatis absen keluar pada jam tertentu</p>
            </div>
            <ToggleSwitch 
              enabled={settings.autoClockOut} 
              onChange={() => handleToggle('autoClockOut')} 
            />
          </div>
          
          <div className="py-3 border-b border-gray-200 dark:border-gray-700">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Waktu Clock Out Otomatis
            </label>
            <input
              type="time"
              value={settings.clockOutTime}
              onChange={(e) => handleInputChange('clockOutTime', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              data-testid="clock-out-time-input"
            />
          </div>
          
          <div className="py-3 border-b border-gray-200 dark:border-gray-700">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Batas Waktu Terlambat
            </label>
            <input
              type="time"
              value={settings.lateThreshold}
              onChange={(e) => handleInputChange('lateThreshold', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              data-testid="late-threshold-input"
            />
          </div>
          
          <div className="py-3">
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Minimum Match Score
            </label>
            <input
              type="number"
              value={settings.minMatchScore}
              onChange={(e) => handleInputChange('minMatchScore', e.target.value)}
              min="1"
              max="10"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              data-testid="min-match-score-input"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Skor minimum pencocokan wajah (1-10)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPengaturanPage