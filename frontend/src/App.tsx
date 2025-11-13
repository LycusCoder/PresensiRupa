import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Navbar } from '@/components/Navbar'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { FaceRegistrationPage } from '@/pages/FaceRegistrationPage'
import { CheckInPage } from '@/pages/CheckInPage'
import { AttendanceHistoryPage } from '@/pages/AttendanceHistoryPage'
import '@/index.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) {
    return <Navigate to="/masuk" replace />
  }
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

function App() {
  const { token } = useAuthStore()

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken && !token) {
      useAuthStore.setState({ token: savedToken })
    }
  }, [token])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/masuk" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/daftar" element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daftar-wajah"
          element={
            <ProtectedRoute>
              <FaceRegistrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/absen"
          element={
            <ProtectedRoute>
              <CheckInPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/riwayat"
          element={
            <ProtectedRoute>
              <AttendanceHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
