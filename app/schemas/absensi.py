from pydantic import BaseModel
from typing import List


class ResponseRiwayatAbsensi(BaseModel):
    """
    Schema untuk list riwayat absensi.
    """
    tanggal: str  # YYYY-MM-DD
    jam: str      # HH:MM:SS
    status: str   # "SUKSES" atau "GAGAL"


class ResponseAbsensi(BaseModel):
    """
    Schema untuk response POST /absensi/cek-masuk.
    """
    status: str
    pesan: str
