import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import { getErrorMessage } from '@/lib/utils'
import { User, Lock, LogIn, Sparkles } from 'lucide-react'

const loginSchema = z.object({
  nama_pengguna: z.string().min(1, 'Username harus diisi'),
  kata_sandi: z.string().min(1, 'Password harus diisi'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { setToken, setUser, setError } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      const response = await apiService.login(data)

      // Simpan token terlebih dahulu supaya request berikutnya menyertakan header Authorization
      localStorage.setItem('token', response.access_token)
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true')
      }
      setToken(response.access_token)

      // Setelah token tersimpan, ambil profil pengguna
      const profile = await apiService.getProfile()

      setUser(profile)
      setError(null)

      // Show success notification
      toast.success(`Selamat datang kembali, ${profile.nama_depan}! 👋`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      // Role-based redirect
      const isAdmin = profile.jabatan?.toLowerCase().includes('admin') || 
                      profile.id_karyawan?.toUpperCase().startsWith('ADM')
      
      if (isAdmin) {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      const message = getErrorMessage(error)
      setError(message)

      // Show error notification
      toast.error(`Login Gagal: ${message}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Animated Background Decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>

          {/* Card */}
          <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-10 border border-white/20 animate-slide-in">
            {/* Logo & Title */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-200">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                PresensiRupa
              </h1>
              <p className="text-secondary-600 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-primary-500" />
                Sistem Absensi Pintar dengan Wajah
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Username"
                placeholder="Masukkan username"
                icon={<User size={18} />}
                {...register('nama_pengguna')}
                error={errors.nama_pengguna?.message}
                data-testid="login-username-input"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Masukkan password"
                icon={<Lock size={18} />}
                {...register('kata_sandi')}
                error={errors.kata_sandi?.message}
                data-testid="login-password-input"
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-all"
                    data-testid="login-remember-me-checkbox"
                  />
                  <span className="ml-2 text-sm text-secondary-700 group-hover:text-secondary-900 transition-colors">
                    Ingat Saya
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  onClick={() => toast.info('Fitur lupa password segera hadir!')}
                >
                  Lupa Password?
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full shadow-lg hover:shadow-xl transition-all duration-200" 
                isLoading={isLoading}
                data-testid="login-submit-button"
              >
                {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-secondary-500">atau</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-secondary-600 text-sm">
                Belum punya akun?{' '}
                <button
                  onClick={() => navigate('/daftar')}
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                  data-testid="login-register-link"
                >
                  Daftar Sekarang
                </button>
              </p>
            </div>
          </div>

          {/* Version Info */}
          <p className="mt-6 text-center text-xs text-secondary-500">
            PresensiRupa v1.0 - Powered by Face Recognition AI
          </p>
        </div>
      </div>

      {/* Right Side - Illustration/Gradient (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="max-w-lg text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl mb-6">
              <Sparkles className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Selamat Datang di PresensiRupa
            </h2>
            <p className="text-lg text-primary-100">
              Sistem absensi modern dengan teknologi pengenalan wajah yang akurat dan aman.
              Kelola kehadiran karyawan dengan mudah dan efisien.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <div className="text-3xl font-bold">99%</div>
                <div className="text-sm text-primary-100 mt-1">Akurasi</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <div className="text-3xl font-bold">&lt;2s</div>
                <div className="text-sm text-primary-100 mt-1">Kecepatan</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-primary-100 mt-1">Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
