from pydantic import BaseModel, Field
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
