// ========== AUTH TYPES ==========
export interface LoginRequest {
  nama_pengguna: string
  kata_sandi: string
}

export interface RegisterRequest {
  nama_pengguna: string
  kata_sandi: string
  nama_depan: string
  nama_belakang: string
  id_karyawan: string
  jabatan: string
  alamat_surel: string
  tanggal_masuk: string
  nik?: string
  foto_ktp?: File
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

// ========== USER TYPES ==========
export type UserRole = 'admin' | 'karyawan'

export interface Pengguna {
  id_pengguna: number
  nama_pengguna: string
  nama_depan: string
  nama_belakang: string
  id_karyawan: string
  jabatan: string
  alamat_surel: string
  tanggal_masuk: string
  nik?: string
  sudah_daftar_wajah: boolean
  status_kehadiran: string
  catatan_admin?: string
  role?: UserRole // Tambahan untuk role detection
}

export interface UpdateProfilRequest {
  nama_depan?: string
  nama_belakang?: string
  alamat_surel?: string
  catatan_admin?: string
}

// ========== ATTENDANCE TYPES ==========
export interface CheckInRequest {
  foto_1: File
  foto_2: File
  foto_3: File
}

export interface CheckInResponse {
  status: string
  pesan: string
}

export interface AttendanceRecord {
  tanggal: string
  jam: string
  status: string
}

// ========== ADMIN TYPES ==========

// Statistik Dashboard
export interface StatistikDashboard {
  total_karyawan: number
  hadir_hari_ini: number
  belum_absen: number
  tingkat_kehadiran: number // 0-100
}

// Trend Kehadiran
export interface TrendHarianItem {
  tanggal: string // "YYYY-MM-DD"
  jumlah_hadir: number
  tingkat_kehadiran: number // 0-100
}

export interface TrendKehadiranResponse {
  data: TrendHarianItem[]
  total_hari: number
}

// Aktivitas Terbaru
export interface AktivitasTerbaruItem {
  id_log: number
  nama_lengkap: string
  id_karyawan: string
  aksi: string
  waktu: string // ISO datetime
  status: string // "SUKSES" | "GAGAL"
}

export interface AktivitasTerbaruResponse {
  data: AktivitasTerbaruItem[]
  total: number
}

// Daftar Karyawan
export interface KaryawanItem {
  id_pengguna: number
  nama_pengguna: string
  nama_depan: string
  nama_belakang: string
  id_karyawan: string
  jabatan: string
  alamat_surel: string
  sudah_daftar_wajah: boolean
  status_kehadiran: string
  tanggal_masuk: string // ISO datetime
  catatan_admin: string | null
}

export interface DaftarKaryawanResponse {
  data: KaryawanItem[]
  total: number
}

// ========== API ERROR ==========
export interface ApiError {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>
}
