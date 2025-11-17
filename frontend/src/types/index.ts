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

// ========== API ERROR ==========
export interface ApiError {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>
}
