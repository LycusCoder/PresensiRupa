import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layouts
import { MainLayout } from '@/layouts/MainLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

// Route Guards
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicRoute } from '@/components/PublicRoute'

// Public Pages
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

// Karyawan Pages
import { DashboardPage } from '@/pages/DashboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { CheckInPage } from '@/pages/CheckInPage'
import { FaceRegistrationPage } from '@/pages/FaceRegistrationPage'
import { AttendanceHistoryPage } from '@/pages/AttendanceHistoryPage'
import { MaintenancePage } from '@/pages/MaintenancePage'

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminKaryawanPage } from '@/pages/admin/AdminKaryawanPage'
import { AdminKehadiranPage } from '@/pages/admin/AdminKehadiranPage'
import { AdminLaporanPage } from '@/pages/admin/AdminLaporanPage'
import { AdminProfilPage } from '@/pages/admin/AdminProfilPage'
import { AdminPengaturanPage } from '@/pages/admin/AdminPengaturanPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/masuk" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/daftar" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Root redirect */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profil" element={<MaintenancePage title="Profil Saya" description="Halaman profil sedang dalam pengembangan. Anda akan dapat mengelola profil pribadi Anda di sini." />} />
          <Route path="absen" element={<CheckInPage />} />
          <Route path="daftar-wajah" element={<FaceRegistrationPage />} />
          <Route path="riwayat" element={<MaintenancePage title="Riwayat Absensi" description="Anda akan dapat melihat riwayat kehadiran lengkap Anda di halaman ini." />} />
          <Route path="notifikasi" element={<MaintenancePage title="Notifikasi" description="Pusat notifikasi untuk semua update penting akan segera tersedia." />} />
          <Route path="bantuan" element={<MaintenancePage title="Bantuan" description="Pusat bantuan dan dokumentasi sedang dalam persiapan." />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="karyawan" element={<AdminKaryawanPage />} />
          <Route path="kehadiran" element={<AdminKehadiranPage />} />
          <Route path="laporan" element={<AdminLaporanPage />} />
          <Route path="profil" element={<AdminProfilPage />} />
          <Route path="pengaturan" element={<AdminPengaturanPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/masuk" replace />} />
      </Routes>
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  )
}
