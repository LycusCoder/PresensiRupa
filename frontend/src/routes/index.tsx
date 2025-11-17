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

// Admin Pages (temporary placeholders)
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminKaryawanPage } from '@/pages/admin/AdminKaryawanPage'
import { AdminKehadiranPage } from '@/pages/admin/AdminKehadiranPage'

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

        {/* Karyawan Routes */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['karyawan']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profil" element={<ProfilePage />} />
          <Route path="absen" element={<CheckInPage />} />
          <Route path="daftar-wajah" element={<FaceRegistrationPage />} />
          <Route path="riwayat" element={<AttendanceHistoryPage />} />
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
