from sqlalchemy import Column, Integer, String, Float, LargeBinary, DateTime, Boolean, ARRAY
from sqlalchemy.sql import func
from app.db.database import Base
import json
from datetime import datetime


class Pengguna(Base):
    """
    Tabel untuk menyimpan data pengguna/karyawan.
    
    Field Wajib:
    - nama_pengguna: Username untuk login
    - hash_kata_sandi: Password (di-hash)
    - nama_depan: Nama depan
    - nama_belakang: Nama belakang
    - id_karyawan: ID internal (unik per perusahaan/kampus)
    - jabatan: Jabatan/departemen
    - alamat_surel: Email
    - tanggal_masuk: Tanggal mulai kerja/kuliah
    
    Field Opsional:
    - nik: Nomor Induk Kependudukan (dari KTP)
    - foto_ktp: File KTP (buat verifikasi admin)
    - catatan_admin: Catatan dari admin
    
    Field Sistem:
    - embedding_wajah: Master embedding (rata-rata dari 5 foto)
    - sudah_daftar_wajah: Flag apakah sudah daftar wajah
    - status_kehadiran: Status hari ini (Hadir, Izin, Cuti)
    """
    __tablename__ = "pengguna"
    
    # Primary Key
    id_pengguna = Column(Integer, primary_key=True, index=True)
    
    # Field Autentikasi (Wajib)
    nama_pengguna = Column(String(100), unique=True, nullable=False, index=True)
    hash_kata_sandi = Column(String(255), nullable=False)
    
    # Field Identitas Dasar (Wajib)
    nama_depan = Column(String(100), nullable=False)
    nama_belakang = Column(String(100), nullable=False)
    
    # Field Perusahaan/Kampus (Wajib)
    id_karyawan = Column(String(50), unique=True, nullable=False, index=True)  # ID unik internal
    jabatan = Column(String(100), nullable=False)  # Misal: IT, Marketing, Sastra, etc
    alamat_surel = Column(String(255), unique=True, nullable=False, index=True)  # Email
    tanggal_masuk = Column(DateTime, nullable=False)  # Kapan user mulai bekerja/kuliah
    
    # Field Identifikasi Resmi (Opsional)
    nik = Column(String(16), nullable=True)  # NIK dari KTP (16 digit)
    foto_ktp = Column(String(500), nullable=True)  # Path/URL ke file KTP (opsional)
    
    # Face Embedding (Sistem)
    # "Master Embedding" (rata-rata dari 5 foto)
    embedding_wajah = Column(String(5000), nullable=True)  # JSON stringified list
    sudah_daftar_wajah = Column(Boolean, default=False)
    
    # Status & Admin Notes (Sistem)
    status_kehadiran = Column(String(20), default="Tidak Ada Data")  # "Hadir", "Izin", "Cuti", dll
    catatan_admin = Column(String(500), nullable=True)  # Catatan dari admin (misal: "Wajah sulit dideteksi")
    
    # Timestamps
    dibuat_pada = Column(DateTime(timezone=True), server_default=func.now())
    diupdate_pada = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Pengguna(id={self.id_pengguna}, nama={self.nama_pengguna}, id_karyawan={self.id_karyawan})>"


class LogAbsensi(Base):
    """
    Tabel untuk menyimpan log setiap kali ada absensi (sukses atau gagal).
    
    Struktur:
    - id_pengguna: Reference ke pengguna
    - waktu: Timestamp absensi
    - status: "SUKSES" atau "GAGAL"
    - jumlah_cocok: Berapa foto yang cocok dari 3 (untuk debugging)
    - tipe_kehadiran: Jenis kehadiran (Hadir, Izin, Cuti, dll)
    """
    __tablename__ = "log_absensi"
    
    id_log = Column(Integer, primary_key=True, index=True)
    id_pengguna = Column(Integer, nullable=False, index=True)  # FK ke tabel pengguna
    
    waktu = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    status = Column(String(20), nullable=False)  # "SUKSES" atau "GAGAL"
    tipe_kehadiran = Column(String(20), default="Hadir")  # "Hadir", "Izin", "Cuti", dll
    
    # Metadata untuk debugging
    jumlah_cocok = Column(Integer, nullable=True)  # Berapa foto yang cocok dari 3
    
    def __repr__(self):
        return f"<LogAbsensi(id={self.id_log}, id_pengguna={self.id_pengguna}, status={self.status})>"
