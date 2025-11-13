from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class PenggunaDaftarRequest(BaseModel):
    """
    Schema untuk POST /autentikasi/daftar.
    
    Input dari klien pas registrasi (form-data).
    - File KTP: OPSIONAL (upload via UploadFile)
    """
    # Auth (Wajib)
    nama_pengguna: str = Field(..., min_length=3, max_length=50, description="Username untuk login")
    kata_sandi: str = Field(..., min_length=6, description="Password (minimal 6 karakter)")
    
    # Identitas (Wajib)
    nama_depan: str = Field(..., min_length=2, max_length=100, description="Nama depan")
    nama_belakang: str = Field(..., min_length=2, max_length=100, description="Nama belakang")
    
    # Perusahaan/Kampus (Wajib)
    id_karyawan: str = Field(..., min_length=3, max_length=50, description="ID karyawan/pegawai unik")
    jabatan: str = Field(..., min_length=3, max_length=100, description="Jabatan/departemen")
    alamat_surel: EmailStr = Field(..., description="Email resmi")
    tanggal_masuk: datetime = Field(..., description="Tanggal mulai bekerja/kuliah")
    
    # Identifikasi Resmi (Opsional)
    nik: Optional[str] = Field(None, min_length=16, max_length=16, description="NIK KTP (16 digit, opsional)")


class PenggunaMasukRequest(BaseModel):
    """
    Schema untuk POST /autentikasi/masuk.
    Input dari klien pas login.
    """
    nama_pengguna: str = Field(..., description="Username")
    kata_sandi: str = Field(..., description="Password")


class TokenAkses(BaseModel):
    """
    Schema untuk response token.
    """
    token_akses: str
    tipe_token: str = "bearer"


class PenggunaDaftarResponse(BaseModel):
    """
    Schema untuk response POST /autentikasi/daftar (sukses).
    """
    status: str  # "sukses"
    pesan: str
    data: dict  # { id_pengguna, nama_lengkap, id_karyawan, jabatan, alamat_surel }


class RiwayatAbsensi(BaseModel):
    """
    Schema untuk satu entry riwayat absensi.
    """
    tanggal: str  # Format: YYYY-MM-DD
    jam: str      # Format: HH:MM:SS
    status: str   # "SUKSES" atau "GAGAL"


class ResponseAbsensi(BaseModel):
    """
    Schema untuk response POST /absensi/cek-masuk.
    """
    status: str
    pesan: str
