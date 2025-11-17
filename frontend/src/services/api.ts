import axios, { AxiosInstance } from 'axios'
import { 
  LoginRequest, 
  RegisterRequest, 
  TokenResponse, 
  Pengguna, 
  UpdateProfilRequest, 
  CheckInRequest, 
  CheckInResponse, 
  AttendanceRecord,
  StatistikDashboard,
  TrendKehadiranResponse,
  AktivitasTerbaruResponse,
  DaftarKaryawanResponse
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/masuk'
        }
        return Promise.reject(error)
      }
    )
  }

  // ========== AUTHENTICATION ==========
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>('/autentikasi/masuk', data)
    return response.data
  }

  async register(data: RegisterRequest): Promise<Pengguna> {
    const formData = new FormData()
    formData.append('nama_pengguna', data.nama_pengguna)
    formData.append('kata_sandi', data.kata_sandi)
    formData.append('nama_depan', data.nama_depan)
    formData.append('nama_belakang', data.nama_belakang)
    formData.append('id_karyawan', data.id_karyawan)
    formData.append('jabatan', data.jabatan)
    formData.append('alamat_surel', data.alamat_surel)
    formData.append('tanggal_masuk', data.tanggal_masuk)
    if (data.nik) formData.append('nik', data.nik)
    if (data.foto_ktp) formData.append('foto_ktp', data.foto_ktp)

    const response = await this.client.post<Pengguna>('/autentikasi/daftar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  // ========== PROFILE ==========
  async getProfile(): Promise<Pengguna> {
    const response = await this.client.get<Pengguna>('/profil/saya')
    return response.data
  }

  async updateProfile(data: UpdateProfilRequest): Promise<Pengguna> {
    const response = await this.client.patch<Pengguna>('/profil/update', data)
    return response.data
  }

  async registerFace(files: File[]): Promise<{ message: string }> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`foto_${index + 1}`, file)
    })

    const response = await this.client.post<{ message: string }>('/profil/daftar-wajah', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  // ========== ATTENDANCE ==========
  async checkIn(data: CheckInRequest): Promise<CheckInResponse> {
    const formData = new FormData()
    formData.append('foto_1', data.foto_1)
    formData.append('foto_2', data.foto_2)
    formData.append('foto_3', data.foto_3)

    const response = await this.client.post<CheckInResponse>('/absensi/cek-masuk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  async getAttendanceHistory(): Promise<AttendanceRecord[]> {
    const response = await this.client.get<AttendanceRecord[]>('/absensi/riwayat')
    return response.data
  }

  // ========== ADMIN ==========
  
  /**
   * GET /admin/statistik
   * Ambil statistik dashboard admin (total karyawan, hadir hari ini, dll)
   */
  async getStatistik(): Promise<StatistikDashboard> {
    const response = await this.client.get<StatistikDashboard>('/admin/statistik')
    return response.data
  }

  /**
   * GET /admin/trend-kehadiran?hari=7
   * Ambil data trend kehadiran untuk N hari terakhir
   * @param hari - Jumlah hari (default: 7, min: 1, max: 30)
   */
  async getTrendKehadiran(hari: number = 7): Promise<TrendKehadiranResponse> {
    const response = await this.client.get<TrendKehadiranResponse>('/admin/trend-kehadiran', {
      params: { hari }
    })
    return response.data
  }

  /**
   * GET /admin/aktivitas-terbaru?limit=5
   * Ambil aktivitas absensi terbaru
   * @param limit - Jumlah aktivitas (default: 5, min: 1, max: 50)
   */
  async getAktivitasTerbaru(limit: number = 5): Promise<AktivitasTerbaruResponse> {
    const response = await this.client.get<AktivitasTerbaruResponse>('/admin/aktivitas-terbaru', {
      params: { limit }
    })
    return response.data
  }

  /**
   * GET /admin/daftar-karyawan
   * Ambil daftar lengkap semua karyawan
   */
  async getDaftarKaryawan(): Promise<DaftarKaryawanResponse> {
    const response = await this.client.get<DaftarKaryawanResponse>('/admin/daftar-karyawan')
    return response.data
  }
}

export const apiService = new ApiService()
