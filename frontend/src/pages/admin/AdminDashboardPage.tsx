import React from 'react'
import { Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

export function AdminDashboardPage() {
  // Placeholder stats - nanti akan diambil dari API
  const stats = [
    { title: 'Total Karyawan', value: '0', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Hadir Hari Ini', value: '0', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Belum Absen', value: '0', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Tingkat Kehadiran', value: '0%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Admin</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Ringkasan kehadiran karyawan</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Placeholder untuk chart dan recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Trend Kehadiran 7 Hari</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Chart akan ditampilkan di sini
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Belum ada aktivitas</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
