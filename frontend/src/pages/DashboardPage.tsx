import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { apiService } from '@/services/api'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    async function loadRecent() {
      try {
        const data = await apiService.getAttendanceHistory()
        if (mounted) setRecent(data.slice(0, 5))
      } catch (e) {
        // ignore for now
      }
    }
    loadRecent()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Banner / CTA */}
      <div className="bg-white border-l-8 border-primary-600 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">
              Selamat Datang, {user?.nama_depan ?? 'Pengguna'}!
            </h2>
            <p className="text-sm text-secondary-600">{user?.jabatan ?? ''}</p>
          </div>
          <div>
            <Button variant="primary" size="lg" onClick={() => navigate('/absen')}>
              Absen Sekarang
            </Button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-secondary-500">Status Hari Ini</p>
          <p className={`mt-2 font-semibold ${user?.status_kehadiran === 'Hadir' ? 'text-green-600' : 'text-yellow-600'}`}>
            {user?.status_kehadiran ?? 'Belum Absen'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-secondary-500">Total Hadir (Bulan Ini)</p>
          <p className="mt-2 font-semibold text-primary-600">—</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-secondary-500">Status Wajah</p>
          <p className={`mt-2 font-semibold ${user?.sudah_daftar_wajah ? 'text-green-600' : 'text-red-600'}`}>
            {user?.sudah_daftar_wajah ? 'Terdaftar' : 'Belum Terdaftar'}
          </p>
        </div>
      </div>

      {/* Bottom columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">Riwayat Absensi Terbaru</h3>
          <div className="space-y-2">
            {recent.length === 0 && <p className="text-sm text-secondary-500">Belum ada riwayat.</p>}
            {recent.map((r, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div>{r.tanggal ?? r.tanggal_absen ?? '—'}</div>
                <div className="font-medium">{r.status ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-3">Catatan Admin</h3>
          <p className="text-sm text-secondary-600">{user?.catatan_admin ?? 'Tidak ada catatan.'}</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

