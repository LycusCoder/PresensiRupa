import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Construction, ArrowLeft, Clock, Wrench } from 'lucide-react'

interface MaintenancePageProps {
  title?: string
  description?: string
}

export function MaintenancePage({ 
  title = 'Halaman Dalam Pengembangan',
  description = 'Fitur ini sedang dalam proses pengembangan dan akan segera hadir!' 
}: MaintenancePageProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Icon Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-full shadow-xl">
              <Construction className="w-16 h-16 text-white animate-bounce" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Segera Hadir</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <Wrench className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Dalam Renovasi</p>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
          data-testid="back-to-dashboard-btn"
        >
          <ArrowLeft size={20} />
          Kembali ke Dashboard
        </button>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tim kami sedang bekerja keras untuk menghadirkan fitur terbaik untuk Anda. 🚀
          </p>
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage
