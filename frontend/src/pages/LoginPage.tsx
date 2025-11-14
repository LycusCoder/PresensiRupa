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

const loginSchema = z.object({
  nama_pengguna: z.string().min(1, 'Username harus diisi'),
  kata_sandi: z.string().min(1, 'Password harus diisi'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { setToken, setUser, setError } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
  setIsLoading(true)
  const response = await apiService.login(data)

  // Simpan token terlebih dahulu supaya request berikutnya menyertakan header Authorization
  localStorage.setItem('token', response.access_token)
  setToken(response.access_token)

  // Setelah token tersimpan, ambil profil pengguna
  const profile = await apiService.getProfile()

  setUser(profile)
      setError(null)

      // Show success notification
      toast.success(`Selamat datang, ${profile.nama_depan}! 👋`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      navigate('/dashboard')
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo & Title */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">PR</span>
            </div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">PresensiRupa</h1>
            <p className="text-secondary-600">Sistem Absensi Pintar dengan Wajah</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Username"
              placeholder="Masukkan username"
              {...register('nama_pengguna')}
              error={errors.nama_pengguna?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password"
              {...register('kata_sandi')}
              error={errors.kata_sandi?.message}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Masuk
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-secondary-600 text-sm">
              Belum punya akun?{' '}
              <button
                onClick={() => navigate('/daftar')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Daftar di sini
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
