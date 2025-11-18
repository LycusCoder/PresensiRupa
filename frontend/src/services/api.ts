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
  DashboardKaryawanStats,
  StatistikDashboard,
  TrendKehadiranResponse,
  AktivitasTerbaruResponse,
  DaftarKaryawanResponse,
  UpdateKaryawanRequest,
  KaryawanItem,
  RiwayatKaryawanResponse,
  DaftarKehadiranResponse,
  ManualAttendanceRequest,
  LogAbsensiItem,
  LogDetailResponse,
  StatistikJabatanResponse,
  TrendBulananResponse,
  KeterlambatanResponse,
  RingkasanBulananResponse
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

  // ========== KARYAWAN DASHBOARD (FASE 3.1) ==========
  
  /**
   * GET /karyawan/dashboard-stats
   * Ambil statistik lengkap untuk dashboard karyawan
   */
  async getDashboardStats(): Promise<DashboardKaryawanStats> {
    const response = await this.client.get<DashboardKaryawanStats>('/karyawan/dashboard-stats')
    return response.data
  }

  // ========== ADMIN - DASHBOARD ==========
  
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

  // ========== ADMIN - KELOLA KARYAWAN (FASE 2.3) ==========

  /**
   * PATCH /admin/karyawan/{id_pengguna}
   * Update data karyawan
   */
  async updateKaryawan(id_pengguna: number, data: UpdateKaryawanRequest): Promise<KaryawanItem> {
    const response = await this.client.patch<KaryawanItem>(`/admin/karyawan/${id_pengguna}`, data)
    return response.data
  }

  /**
   * GET /admin/karyawan/{id_pengguna}/riwayat
   * Ambil riwayat absensi satu karyawan
   */
  async getKaryawanRiwayat(
    id_pengguna: number,
    tanggal_mulai?: string,
    tanggal_akhir?: string
  ): Promise<RiwayatKaryawanResponse> {
    const response = await this.client.get<RiwayatKaryawanResponse>(
      `/admin/karyawan/${id_pengguna}/riwayat`,
      {
        params: {
          tanggal_mulai,
          tanggal_akhir
        }
      }
    )
    return response.data
  }

  // ========== ADMIN - KELOLA KEHADIRAN (FASE 2.4) ==========

  /**
   * GET /admin/kehadiran
   * Ambil daftar kehadiran dengan filters
   */
  async getKehadiran(
    tanggal?: string,
    status_filter?: string,
    jabatan?: string,
    search?: string
  ): Promise<DaftarKehadiranResponse> {
    const response = await this.client.get<DaftarKehadiranResponse>('/admin/kehadiran', {
      params: {
        tanggal,
        status_filter,
        jabatan,
        search
      }
    })
    return response.data
  }

  /**
   * POST /admin/kehadiran/manual
   * Buat entry kehadiran manual
   */
  async createManualAttendance(data: ManualAttendanceRequest): Promise<LogAbsensiItem> {
    const response = await this.client.post<LogAbsensiItem>('/admin/kehadiran/manual', data)
    return response.data
  }

  /**
   * GET /admin/kehadiran/{id_log}
   * Ambil detail satu log absensi
   */

  // ========== ADMIN - LAPORAN & ANALYTICS (FASE 2.5) ==========

  /**
   * GET /admin/laporan/jabatan?bulan=YYYY-MM
   * Ambil statistik kehadiran per jabatan/department
   */
  async getStatistikJabatan(bulan?: string): Promise<StatistikJabatanResponse> {
    const response = await this.client.get<StatistikJabatanResponse>('/admin/laporan/jabatan', {
      params: { bulan }
    })
    return response.data
  }

  /**
   * GET /admin/laporan/trend-bulanan?jumlah_bulan=6
   * Ambil trend kehadiran bulanan (N bulan terakhir)
   */
  async getTrendBulanan(jumlah_bulan: number = 6): Promise<TrendBulananResponse> {
    const response = await this.client.get<TrendBulananResponse>('/admin/laporan/trend-bulanan', {
      params: { jumlah_bulan }
    })
    return response.data
  }

  /**
   * GET /admin/laporan/keterlambatan?bulan=YYYY-MM&limit=10
   * Ambil laporan karyawan yang sering terlambat
   */
  async getLaporanKeterlambatan(bulan?: string, limit: number = 10): Promise<KeterlambatanResponse> {
    const response = await this.client.get<KeterlambatanResponse>('/admin/laporan/keterlambatan', {
      params: { bulan, limit }
    })
    return response.data
  }

  /**
   * GET /admin/laporan/ringkasan-bulanan?bulan=YYYY-MM
   * Ambil ringkasan lengkap laporan bulanan
   */
  async getRingkasanBulanan(bulan?: string): Promise<RingkasanBulananResponse> {
    const response = await this.client.get<RingkasanBulananResponse>('/admin/laporan/ringkasan-bulanan', {
      params: { bulan }
    })
    return response.data
  }

  async getLogDetail(id_log: number): Promise<LogDetailResponse> {
    const response = await this.client.get<LogDetailResponse>(`/admin/kehadiran/${id_log}`)
    return response.data
  }
}

export const apiService = new ApiService()
