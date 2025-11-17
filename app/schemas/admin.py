from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime


class StatistikDashboard(BaseModel):
    """
    Schema untuk response GET /admin/statistik
    
    Berisi statistik dashboard admin:
    - Total karyawan terdaftar
    - Hadir hari ini (yang sudah absen SUKSES)
    - Belum absen hari ini
    - Tingkat kehadiran hari ini (%)
    """
    total_karyawan: int = Field(..., description="Total karyawan yang terdaftar di sistem")
    hadir_hari_ini: int = Field(..., description="Jumlah karyawan yang sudah absen hari ini (SUKSES)")
    belum_absen: int = Field(..., description="Jumlah karyawan yang belum absen hari ini")
    tingkat_kehadiran: float = Field(..., description="Persentase kehadiran hari ini (0-100)")


class TrendHarianItem(BaseModel):
    """
    Schema untuk satu item trend harian.
    
    Digunakan dalam response GET /admin/trend-kehadiran
    """
    tanggal: str = Field(..., description="Tanggal dalam format YYYY-MM-DD")
    jumlah_hadir: int = Field(..., description="Jumlah karyawan yang hadir di tanggal tersebut")
    tingkat_kehadiran: float = Field(..., description="Persentase kehadiran (0-100)")


class TrendKehadiranResponse(BaseModel):
    """
    Schema untuk response GET /admin/trend-kehadiran
    
    Berisi data trend kehadiran untuk beberapa hari terakhir.
    """
    data: List[TrendHarianItem] = Field(..., description="List data trend per hari")
    total_hari: int = Field(..., description="Total hari yang di-query")


class AktivitasTerbaruItem(BaseModel):
    """
    Schema untuk satu item aktivitas terbaru.
    
    Digunakan dalam response GET /admin/aktivitas-terbaru
    """
    id_log: int = Field(..., description="ID log absensi")
    nama_lengkap: str = Field(..., description="Nama lengkap karyawan")
    id_karyawan: str = Field(..., description="ID karyawan")
    aksi: str = Field(..., description="Deskripsi aksi, misal: 'Absen Masuk'")
    waktu: datetime = Field(..., description="Timestamp aktivitas")
    status: str = Field(..., description="Status: SUKSES atau GAGAL")


class AktivitasTerbaruResponse(BaseModel):
    """
    Schema untuk response GET /admin/aktivitas-terbaru
    
    Berisi list aktivitas absensi terbaru.
    """
    data: List[AktivitasTerbaruItem] = Field(..., description="List aktivitas terbaru")
    total: int = Field(..., description="Total aktivitas yang dikembalikan")


class KaryawanItem(BaseModel):
    """
    Schema untuk satu item karyawan.
    
    Digunakan dalam response GET /admin/daftar-karyawan
    """
    id_pengguna: int
    nama_pengguna: str
    nama_depan: str
    nama_belakang: str
    id_karyawan: str
    jabatan: str
    alamat_surel: str
    sudah_daftar_wajah: bool
    status_kehadiran: str
    tanggal_masuk: datetime
    catatan_admin: Optional[str] = None


class DaftarKaryawanResponse(BaseModel):
    """
    Schema untuk response GET /admin/daftar-karyawan
    
    Berisi list semua karyawan yang terdaftar.
    """
    data: List[KaryawanItem] = Field(..., description="List semua karyawan")
    total: int = Field(..., description="Total karyawan")


# ========== FASE 2.3 - KELOLA KARYAWAN ==========

class UpdateKaryawanRequest(BaseModel):
    """
    Schema untuk request PATCH /admin/karyawan/{id_pengguna}
    
    Admin bisa update data karyawan tertentu.
    """
    nama_depan: Optional[str] = Field(None, description="Nama depan baru")
    nama_belakang: Optional[str] = Field(None, description="Nama belakang baru")
    jabatan: Optional[str] = Field(None, description="Jabatan baru")
    alamat_surel: Optional[EmailStr] = Field(None, description="Email baru")
    catatan_admin: Optional[str] = Field(None, description="Catatan admin")


class LogAbsensiItem(BaseModel):
    """
    Schema untuk satu log absensi.
    
    Digunakan dalam response GET /admin/karyawan/{id_pengguna}/riwayat
    """
    id_log: int
    waktu: datetime
    status: str  # SUKSES/GAGAL
    tipe_kehadiran: str
    jumlah_cocok: Optional[int] = None


class RiwayatKaryawanResponse(BaseModel):
    """
    Schema untuk response GET /admin/karyawan/{id_pengguna}/riwayat
    
    Berisi riwayat absensi untuk satu karyawan.
    """
    karyawan: KaryawanItem
    riwayat: List[LogAbsensiItem]
    total: int


# ========== FASE 2.4 - KELOLA KEHADIRAN ==========

class LogKehadiranDetail(BaseModel):
    """
    Schema untuk detail log kehadiran dengan join ke data pengguna.
    
    Digunakan dalam response GET /admin/kehadiran
    """
    id_log: int
    waktu: datetime
    status: str
    tipe_kehadiran: str
    jumlah_cocok: Optional[int] = None
    
    # Data karyawan (join)
    id_pengguna: int
    nama_lengkap: str
    id_karyawan: str
    jabatan: str


class DaftarKehadiranResponse(BaseModel):
    """
    Schema untuk response GET /admin/kehadiran
    
    Berisi list log kehadiran dengan filters.
    """
    data: List[LogKehadiranDetail]
    total: int


class ManualAttendanceRequest(BaseModel):
    """
    Schema untuk request POST /admin/kehadiran/manual
    
    Admin bisa input kehadiran manual (untuk emergency/correction).
    """
    id_pengguna: int = Field(..., description="ID pengguna")
    tanggal: str = Field(..., description="Tanggal absensi (YYYY-MM-DD)")
    waktu: str = Field(..., description="Waktu absensi (HH:MM)")
    tipe_kehadiran: str = Field("Hadir", description="Tipe: Hadir, Izin, Cuti, dll")
    catatan: Optional[str] = Field(None, description="Catatan untuk entry manual")


class LogDetailResponse(BaseModel):
    """
    Schema untuk response GET /admin/kehadiran/{id_log}
    
    Detail lengkap satu log absensi.
    """
    log: LogKehadiranDetail
    karyawan: KaryawanItem
