from pydantic import BaseModel
from typing import Optional


class ProfilPengguna(BaseModel):
    """
    Schema untuk response GET /profil/saya.
    Return data profil lengkap user yang sedang login.
    """
    id_pengguna: int
    nama_pengguna: str
    nama_depan: str
    nama_belakang: str
    id_karyawan: str
    jabatan: str
    alamat_surel: str
    nik: Optional[str]
    sudah_daftar_wajah: bool
    status_kehadiran: str  # "Hadir", "Izin", "Cuti", dll
    catatan_admin: Optional[str]


class ProfilPenggunaUpdate(BaseModel):
    """
    Schema untuk PATCH /profil/update (opsional).
    User bisa update beberapa field.
    """
    nama_depan: Optional[str] = None
    nama_belakang: Optional[str] = None
    alamat_surel: Optional[str] = None
    catatan_admin: Optional[str] = None  # Admin notes (misal: "Wajah sulit dideteksi")
