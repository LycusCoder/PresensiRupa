from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ========== DASHBOARD KARYAWAN ==========

class RiwayatSingkatItem(BaseModel):
    """Item riwayat absensi singkat untuk dashboard"""
    tanggal: str  # YYYY-MM-DD
    waktu: str  # HH:MM
    status: str  # SUKSES/GAGAL
    jumlah_cocok: Optional[int] = None
    
    class Config:
        from_attributes = True

class DashboardKaryawanStats(BaseModel):
    """Response statistik dashboard karyawan"""
    # User info
    nama_lengkap: str
    jabatan: str
    id_karyawan: str
    
    # Status
    sudah_daftar_wajah: bool
    sudah_absen_hari_ini: bool
    status_kehadiran_hari_ini: str  # "Hadir" / "Belum Absen" / "Terlambat"
    
    # Stats bulan ini
    total_hadir_bulan_ini: int
    total_hari_kerja_bulan_ini: int
    tingkat_kehadiran_bulan_ini: float  # 0-100
    
    # Riwayat terbaru
    riwayat_terbaru: List[RiwayatSingkatItem]
    
    # Admin notes
    catatan_admin: Optional[str] = None
    
    class Config:
        from_attributes = True
