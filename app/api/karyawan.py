from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from typing import Optional
from datetime import datetime, date, timedelta
import calendar

from app.db.database import get_db
from app.db.models import Pengguna, LogAbsensi
from app.schemas.karyawan import DashboardKaryawanStats, RiwayatSingkatItem
from app.core.security import verify_token_akses

router = APIRouter(prefix="/karyawan", tags=["Karyawan Dashboard"])


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> Pengguna:
    """
    Dependency untuk validasi token dan ambil user dari database.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Header Authorization tidak ditemukan"
        )
    
    try:
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Format Authorization header salah. Format: Bearer <token>"
            )
        
        token = parts[1]
        payload = verify_token_akses(token)
        id_pengguna = payload.get("id_pengguna")
        
        if not id_pengguna:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token tidak valid"
            )
        
        pengguna = db.query(Pengguna).filter(Pengguna.id_pengguna == id_pengguna).first()
        
        if not pengguna:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User tidak ditemukan"
            )
        
        return pengguna
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token tidak valid: {str(e)}"
        )


@router.get("/dashboard-stats", response_model=DashboardKaryawanStats)
async def get_dashboard_stats(
    current_user: Pengguna = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /karyawan/dashboard-stats
    
    Ambil statistik lengkap untuk dashboard karyawan:
    - Status hari ini (sudah absen atau belum)
    - Total hadir bulan ini
    - Tingkat kehadiran bulan ini
    - Status wajah terdaftar
    - Riwayat absensi terbaru (5 terakhir)
    - Catatan admin
    
    Returns:
        DashboardKaryawanStats dengan semua data dashboard
    """
    
    # Hitung nama lengkap
    nama_lengkap = f"{current_user.nama_depan} {current_user.nama_belakang}"
    
    # Cek status hari ini
    hari_ini = date.today()
    absen_hari_ini = db.query(LogAbsensi).filter(
        and_(
            LogAbsensi.id_pengguna == current_user.id_pengguna,
            func.date(LogAbsensi.waktu) == hari_ini
        )
    ).first()
    
    sudah_absen_hari_ini = absen_hari_ini is not None
    
    # Status kehadiran hari ini
    if sudah_absen_hari_ini:
        if absen_hari_ini.status == "SUKSES":
            # Cek apakah terlambat (setelah jam 09:00)
            waktu_absen = absen_hari_ini.waktu.time()
            if waktu_absen.hour >= 9:
                status_kehadiran_hari_ini = "Terlambat"
            else:
                status_kehadiran_hari_ini = "Hadir"
        else:
            status_kehadiran_hari_ini = "Gagal Absen"
    else:
        status_kehadiran_hari_ini = "Belum Absen"
    
    # Stats bulan ini
    now = datetime.now()
    tahun_ini = now.year
    bulan_ini = now.month
    
    # Hitung total hari kerja bulan ini (exclude Sabtu & Minggu)
    # Simplified: Anggap semua hari adalah hari kerja kecuali weekend
    total_days = calendar.monthrange(tahun_ini, bulan_ini)[1]
    first_day = date(tahun_ini, bulan_ini, 1)
    hari_kerja = 0
    for i in range(total_days):
        current_date = first_day + timedelta(days=i)
        # 5 = Saturday, 6 = Sunday
        if current_date.weekday() < 5:
            hari_kerja += 1
    
    total_hari_kerja_bulan_ini = hari_kerja
    
    # Hitung total hadir bulan ini (status SUKSES)
    total_hadir_bulan_ini = db.query(func.count(LogAbsensi.id_log)).filter(
        and_(
            LogAbsensi.id_pengguna == current_user.id_pengguna,
            LogAbsensi.status == "SUKSES",
            extract('year', LogAbsensi.waktu) == tahun_ini,
            extract('month', LogAbsensi.waktu) == bulan_ini
        )
    ).scalar() or 0
    
    # Hitung tingkat kehadiran
    if total_hari_kerja_bulan_ini > 0:
        tingkat_kehadiran_bulan_ini = round((total_hadir_bulan_ini / total_hari_kerja_bulan_ini) * 100, 1)
    else:
        tingkat_kehadiran_bulan_ini = 0.0
    
    # Ambil riwayat terbaru (5 terakhir)
    riwayat_query = db.query(LogAbsensi).filter(
        LogAbsensi.id_pengguna == current_user.id_pengguna
    ).order_by(LogAbsensi.waktu.desc()).limit(5).all()
    
    riwayat_terbaru = [
        RiwayatSingkatItem(
            tanggal=log.waktu.strftime("%Y-%m-%d"),
            waktu=log.waktu.strftime("%H:%M"),
            status=log.status,
            jumlah_cocok=log.jumlah_cocok
        )
        for log in riwayat_query
    ]
    
    # Build response
    return DashboardKaryawanStats(
        nama_lengkap=nama_lengkap,
        jabatan=current_user.jabatan,
        id_karyawan=current_user.id_karyawan,
        sudah_daftar_wajah=current_user.sudah_daftar_wajah,
        sudah_absen_hari_ini=sudah_absen_hari_ini,
        status_kehadiran_hari_ini=status_kehadiran_hari_ini,
        total_hadir_bulan_ini=total_hadir_bulan_ini,
        total_hari_kerja_bulan_ini=total_hari_kerja_bulan_ini,
        tingkat_kehadiran_bulan_ini=tingkat_kehadiran_bulan_ini,
        riwayat_terbaru=riwayat_terbaru,
        catatan_admin=current_user.catatan_admin
    )
