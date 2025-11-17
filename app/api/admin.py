from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from typing import List
from datetime import datetime, date, timedelta
from app.db.database import get_db
from app.db.models import Pengguna, LogAbsensi
from app.schemas.admin import (
    StatistikDashboard,
    TrendKehadiranResponse,
    TrendHarianItem,
    AktivitasTerbaruResponse,
    AktivitasTerbaruItem,
    DaftarKaryawanResponse,
    KaryawanItem
)
from app.core.security import verify_token_akses

router = APIRouter(prefix="/admin", tags=["Admin"])


def get_current_admin(authorization: str = Header(None), db: Session = Depends(get_db)) -> Pengguna:
    """
    Dependency untuk validasi token dan cek apakah user adalah admin.
    
    Args:
        authorization: Header "Authorization: Bearer <token>"
        db: Database session
    
    Returns:
        Object Pengguna dari database (harus admin)
    
    Raises:
        HTTPException 401 jika token invalid
        HTTPException 403 jika bukan admin
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
        
        # Cek apakah admin (jabatan contains 'admin' atau id_karyawan starts with 'ADM')
        is_admin = (
            pengguna.jabatan and "admin" in pengguna.jabatan.lower()
        ) or (
            pengguna.id_karyawan and pengguna.id_karyawan.upper().startswith("ADM")
        )
        
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses ditolak. Hanya admin yang bisa mengakses endpoint ini."
            )
        
        return pengguna
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token tidak valid: {str(e)}"
        )


@router.get("/statistik", response_model=StatistikDashboard)
async def get_statistik_dashboard(
    current_admin: Pengguna = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> StatistikDashboard:
    """
    Endpoint: GET /admin/statistik
    
    Ambil statistik dashboard admin untuk hari ini.
    
    Request:
    - Header: Authorization: Bearer <token> (harus admin)
    
    Response:
    {
        "total_karyawan": 50,
        "hadir_hari_ini": 45,
        "belum_absen": 5,
        "tingkat_kehadiran": 90.0
    }
    """
    try:
        # 1. Total karyawan
        total_karyawan = db.query(Pengguna).count()
        
        # 2. Hadir hari ini (yang sudah absen SUKSES)
        hari_ini = date.today()
        hadir_hari_ini = db.query(LogAbsensi).filter(
            and_(
                LogAbsensi.status == "SUKSES",
                func.date(LogAbsensi.waktu) == hari_ini
            )
        ).distinct(LogAbsensi.id_pengguna).count()
        
        # 3. Belum absen hari ini
        belum_absen = max(0, total_karyawan - hadir_hari_ini)
        
        # 4. Tingkat kehadiran (persentase)
        tingkat_kehadiran = (hadir_hari_ini / total_karyawan * 100) if total_karyawan > 0 else 0.0
        
        return StatistikDashboard(
            total_karyawan=total_karyawan,
            hadir_hari_ini=hadir_hari_ini,
            belum_absen=belum_absen,
            tingkat_kehadiran=round(tingkat_kehadiran, 2)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error mengambil statistik: {str(e)}"
        )


@router.get("/trend-kehadiran", response_model=TrendKehadiranResponse)
async def get_trend_kehadiran(
    hari: int = Query(7, ge=1, le=30, description="Jumlah hari terakhir untuk trend (default: 7)"),
    current_admin: Pengguna = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> TrendKehadiranResponse:
    """
    Endpoint: GET /admin/trend-kehadiran?hari=7
    
    Ambil data trend kehadiran untuk N hari terakhir.
    
    Request:
    - Query param: hari (default: 7, min: 1, max: 30)
    - Header: Authorization: Bearer <token> (harus admin)
    
    Response:
    {
        "data": [
            {
                "tanggal": "2024-11-17",
                "jumlah_hadir": 45,
                "tingkat_kehadiran": 90.0
            },
            ...
        ],
        "total_hari": 7
    }
    """
    try:
        total_karyawan = db.query(Pengguna).count()
        
        # Generate list tanggal dari hari ini mundur N hari
        hari_ini = date.today()
        data_trend = []
        
        for i in range(hari - 1, -1, -1):  # Dari N hari lalu sampai hari ini
            tanggal_target = hari_ini - timedelta(days=i)
            
            # Hitung jumlah hadir di tanggal tersebut
            jumlah_hadir = db.query(LogAbsensi).filter(
                and_(
                    LogAbsensi.status == "SUKSES",
                    func.date(LogAbsensi.waktu) == tanggal_target
                )
            ).distinct(LogAbsensi.id_pengguna).count()
            
            # Hitung tingkat kehadiran
            tingkat = (jumlah_hadir / total_karyawan * 100) if total_karyawan > 0 else 0.0
            
            data_trend.append(TrendHarianItem(
                tanggal=tanggal_target.strftime("%Y-%m-%d"),
                jumlah_hadir=jumlah_hadir,
                tingkat_kehadiran=round(tingkat, 2)
            ))
        
        return TrendKehadiranResponse(
            data=data_trend,
            total_hari=hari
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error mengambil trend kehadiran: {str(e)}"
        )


@router.get("/aktivitas-terbaru", response_model=AktivitasTerbaruResponse)
async def get_aktivitas_terbaru(
    limit: int = Query(5, ge=1, le=50, description="Jumlah aktivitas yang ditampilkan (default: 5)"),
    current_admin: Pengguna = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> AktivitasTerbaruResponse:
    """
    Endpoint: GET /admin/aktivitas-terbaru?limit=5
    
    Ambil aktivitas absensi terbaru dari semua karyawan.
    
    Request:
    - Query param: limit (default: 5, min: 1, max: 50)
    - Header: Authorization: Bearer <token> (harus admin)
    
    Response:
    {
        "data": [
            {
                "id_log": 123,
                "nama_lengkap": "John Doe",
                "id_karyawan": "EMP001",
                "aksi": "Absen Masuk",
                "waktu": "2024-11-17T09:30:00",
                "status": "SUKSES"
            },
            ...
        ],
        "total": 5
    }
    """
    try:
        # Query log absensi terbaru dengan join ke tabel pengguna
        logs = db.query(
            LogAbsensi.id_log,
            LogAbsensi.waktu,
            LogAbsensi.status,
            Pengguna.nama_depan,
            Pengguna.nama_belakang,
            Pengguna.id_karyawan
        ).join(
            Pengguna,
            LogAbsensi.id_pengguna == Pengguna.id_pengguna
        ).order_by(
            desc(LogAbsensi.waktu)
        ).limit(limit).all()
        
        # Format data
        aktivitas_list = []
        for log in logs:
            nama_lengkap = f"{log.nama_depan} {log.nama_belakang}"
            aksi = "Absen Masuk" if log.status == "SUKSES" else "Absen Gagal"
            
            aktivitas_list.append(AktivitasTerbaruItem(
                id_log=log.id_log,
                nama_lengkap=nama_lengkap,
                id_karyawan=log.id_karyawan,
                aksi=aksi,
                waktu=log.waktu,
                status=log.status
            ))
        
        return AktivitasTerbaruResponse(
            data=aktivitas_list,
            total=len(aktivitas_list)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error mengambil aktivitas terbaru: {str(e)}"
        )


@router.get("/daftar-karyawan", response_model=DaftarKaryawanResponse)
async def get_daftar_karyawan(
    current_admin: Pengguna = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> DaftarKaryawanResponse:
    """
    Endpoint: GET /admin/daftar-karyawan
    
    Ambil daftar semua karyawan yang terdaftar di sistem.
    
    Request:
    - Header: Authorization: Bearer <token> (harus admin)
    
    Response:
    {
        "data": [
            {
                "id_pengguna": 1,
                "nama_pengguna": "johndoe",
                "nama_depan": "John",
                "nama_belakang": "Doe",
                "id_karyawan": "EMP001",
                "jabatan": "IT",
                "alamat_surel": "john@example.com",
                "sudah_daftar_wajah": true,
                "status_kehadiran": "Hadir",
                "tanggal_masuk": "2024-01-15T00:00:00",
                "catatan_admin": null
            },
            ...
        ],
        "total": 50
    }
    """
    try:
        # Query semua karyawan
        karyawan_list = db.query(Pengguna).order_by(Pengguna.id_karyawan).all()
        
        # Format data
        data = []
        for karyawan in karyawan_list:
            data.append(KaryawanItem(
                id_pengguna=karyawan.id_pengguna,
                nama_pengguna=karyawan.nama_pengguna,
                nama_depan=karyawan.nama_depan,
                nama_belakang=karyawan.nama_belakang,
                id_karyawan=karyawan.id_karyawan,
                jabatan=karyawan.jabatan,
                alamat_surel=karyawan.alamat_surel,
                sudah_daftar_wajah=karyawan.sudah_daftar_wajah,
                status_kehadiran=karyawan.status_kehadiran,
                tanggal_masuk=karyawan.tanggal_masuk,
                catatan_admin=karyawan.catatan_admin
            ))
        
        return DaftarKaryawanResponse(
            data=data,
            total=len(data)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error mengambil daftar karyawan: {str(e)}"
        )
