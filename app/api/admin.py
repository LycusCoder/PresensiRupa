from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, or_
from typing import List, Optional
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
    KaryawanItem,
    UpdateKaryawanRequest,
    LogAbsensiItem,
    RiwayatKaryawanResponse,
    DaftarKehadiranResponse,
    LogKehadiranDetail,
    ManualAttendanceRequest,
    LogDetailResponse
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


# ========== FASE 2.3 - KELOLA KARYAWAN ==========

@router.patch("/karyawan/{id_pengguna}", response_model=KaryawanItem)
async def update_karyawan(
    id_pengguna: int,
    update_data: UpdateKaryawanRequest,
    current_admin: Pengguna = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> KaryawanItem:
    """
    Endpoint: PATCH /admin/karyawan/{id_pengguna}
    
    Update data karyawan tertentu (admin only).
    
    Request:
    - Path param: id_pengguna
    - Body: UpdateKaryawanRequest (semua field optional)
    - Header: Authorization: Bearer <token> (harus admin)
    
    Response: KaryawanItem (data updated)
    """
    try:
        # Cari karyawan
        karyawan = db.query(Pengguna).filter(Pengguna.id_pengguna == id_pengguna).first()
        
        if not karyawan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Karyawan dengan ID {id_pengguna} tidak ditemukan"
            )
        
        # Update field yang ada
        update_dict = update_data.dict(exclude_unset=True)
        
        for key, value in update_dict.items():
            setattr(karyawan, key, value)
        
        db.commit()
        db.refresh(karyawan)
        
        return KaryawanItem(
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
        )
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error mengupdate karyawan: {str(e)}"
        )


@router.get("/karyawan/{id_pengguna}/riwayat", response_model=RiwayatKaryawanResponse)
async def get_riwayat_karyawan(
    id_pengguna: int,
    tanggal_mulai: Optional[str] = Query(None, description="Filter tanggal mulai (YYYY-MM-DD)"),
    tanggal_akhir: Optional[str] = Query(None, description="Filter tanggal akhir (YYYY-MM-DD)"),
    current_admin: Pengguna = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> RiwayatKaryawanResponse:
    """
    Endpoint: GET /admin/karyawan/{id_pengguna}/riwayat
    
    Ambil riwayat absensi untuk satu karyawan.
    
    Request:
    - Path param: id_pengguna
    - Query params (optional): tanggal_mulai, tanggal_akhir
    - Header: Authorization: Bearer <token> (harus admin)
    
    Response: RiwayatKaryawanResponse
    """
    try:
        # Cari karyawan
        karyawan = db.query(Pengguna).filter(Pengguna.id_pengguna == id_pengguna).first()
        
        if not karyawan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Karyawan dengan ID {id_pengguna} tidak ditemukan"
            )
        
        # Query riwayat absensi
        query = db.query(LogAbsensi).filter(LogAbsensi.id_pengguna == id_pengguna)
        
        # Apply date filters
        if tanggal_mulai:
            try:
                start_date = datetime.strptime(tanggal_mulai, "%Y-%m-%d").date()
                query = query.filter(func.date(LogAbsensi.waktu) >= start_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Format tanggal_mulai salah. Gunakan YYYY-MM-DD"
                )
        
        if tanggal_akhir:
            try:
                end_date = datetime.strptime(tanggal_akhir, "%Y-%m-%d").date()
                query = query.filter(func.date(LogAbsensi.waktu) <= end_date)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Format tanggal_akhir salah. Gunakan YYYY-MM-DD"
                )
        
        # Execute query & order by waktu descending
        logs = query.order_by(desc(LogAbsensi.waktu)).all()
        
        # Format response
        riwayat_list = [
            LogAbsensiItem(
                id_log=log.id_log,
                waktu=log.waktu,
                status=log.status,
                tipe_kehadiran=log.tipe_kehadiran,
                jumlah_cocok=log.jumlah_cocok
            )
            for log in logs
        ]
        
        return RiwayatKaryawanResponse(
            karyawan=KaryawanItem(
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
            ),
            riwayat=riwayat_list,
            total=len(riwayat_list)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error mengambil riwayat karyawan: {str(e)}"
        )


# ========== FASE 2.4 - KELOLA KEHADIRAN ==========

@router.get("/kehadiran", response_model=DaftarKehadiranResponse)
async def get_daftar_kehadiran(
    tanggal: Optional[str] = Query(None, description="Filter tanggal (YYYY-MM-DD), default: hari ini"),
    status_filter: Optional[str] = Query(None, description="Filter status (SUKSES/GAGAL)"),
    jabatan: Optional[str] = Query(None, description="Filter jabatan"),
    search: Optional[str] = Query(None, description="Search nama atau id_karyawan"),
    current_admin: Pengguna = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> DaftarKehadiranResponse:
    """
    Endpoint: GET /admin/kehadiran
    
    Ambil daftar kehadiran dengan filters.
    
    Request:
    - Query params (all optional):
      - tanggal: YYYY-MM-DD (default: hari ini)
      - status_filter: SUKSES atau GAGAL
      - jabatan: filter by jabatan
      - search: search by nama atau id_karyawan
    - Header: Authorization: Bearer <token> (harus admin)
    
    Response: DaftarKehadiranResponse
    """
    try:
        # Default tanggal = hari ini
        if tanggal:
            try:
                target_date = datetime.strptime(tanggal, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Format tanggal salah. Gunakan YYYY-MM-DD"
                )
        else:
            target_date = date.today()
        
        # Query dengan join
        query = db.query(
            LogAbsensi.id_log,
            LogAbsensi.waktu,
            LogAbsensi.status,
            LogAbsensi.tipe_kehadiran,
            LogAbsensi.jumlah_cocok,
            LogAbsensi.id_pengguna,
            Pengguna.nama_depan,
            Pengguna.nama_belakang,
            Pengguna.id_karyawan,
            Pengguna.jabatan
        ).join(
            Pengguna,
            LogAbsensi.id_pengguna == Pengguna.id_pengguna
        ).filter(
            func.date(LogAbsensi.waktu) == target_date
        )
        
        # Apply filters
        if status_filter:
            query = query.filter(LogAbsensi.status == status_filter.upper())
        
        if jabatan:
            query = query.filter(Pengguna.jabatan.ilike(f"%{jabatan}%"))
        
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Pengguna.nama_depan.ilike(search_pattern),
                    Pengguna.nama_belakang.ilike(search_pattern),
                    Pengguna.id_karyawan.ilike(search_pattern)
                )
            )
        
        # Execute & order by waktu descending
        logs = query.order_by(desc(LogAbsensi.waktu)).all()
        
        # Format response
        data_list = [
            LogKehadiranDetail(
                id_log=log.id_log,
                waktu=log.waktu,
                status=log.status,
                tipe_kehadiran=log.tipe_kehadiran,
                jumlah_cocok=log.jumlah_cocok,
                id_pengguna=log.id_pengguna,
                nama_lengkap=f"{log.nama_depan} {log.nama_belakang}",
                id_karyawan=log.id_karyawan,
                jabatan=log.jabatan
            )
            for log in logs
        ]
        
        return DaftarKehadiranResponse(
            data=data_list,
            total=len(data_list)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error mengambil daftar kehadiran: {str(e)}"
        )


@router.post("/kehadiran/manual", response_model=LogAbsensiItem)
async def create_manual_attendance(
    request: ManualAttendanceRequest,
    current_admin: Pengguna = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> LogAbsensiItem:
    """
    Endpoint: POST /admin/kehadiran/manual
    
    Buat entry kehadiran manual (untuk emergency/correction).
    
    Request:
    - Body: ManualAttendanceRequest
    - Header: Authorization: Bearer <token> (harus admin)
    
    Response: LogAbsensiItem (created)
    """
    try:
        # Validasi karyawan exists
        karyawan = db.query(Pengguna).filter(Pengguna.id_pengguna == request.id_pengguna).first()
        
        if not karyawan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Karyawan dengan ID {request.id_pengguna} tidak ditemukan"
            )
        
        # Parse tanggal & waktu
        try:
            tanggal_obj = datetime.strptime(request.tanggal, "%Y-%m-%d").date()
            waktu_obj = datetime.strptime(request.waktu, "%H:%M").time()
            waktu_lengkap = datetime.combine(tanggal_obj, waktu_obj)
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Format tanggal/waktu salah: {str(ve)}"
            )
        
        # Buat log absensi manual
        new_log = LogAbsensi(
            id_pengguna=request.id_pengguna,
            waktu=waktu_lengkap,
            status="SUKSES",  # Manual entry selalu SUKSES
            tipe_kehadiran=request.tipe_kehadiran,
            jumlah_cocok=None  # Manual, tidak ada matching
        )
        
        db.add(new_log)
        
        # Update status kehadiran karyawan jika hari ini
        if tanggal_obj == date.today():
            karyawan.status_kehadiran = request.tipe_kehadiran
        
        db.commit()
        db.refresh(new_log)
        
        return LogAbsensiItem(
            id_log=new_log.id_log,
            waktu=new_log.waktu,
            status=new_log.status,
            tipe_kehadiran=new_log.tipe_kehadiran,
            jumlah_cocok=new_log.jumlah_cocok
        )
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error membuat entry manual: {str(e)}"
        )


@router.get("/kehadiran/{id_log}", response_model=LogDetailResponse)
async def get_log_detail(
    id_log: int,
    current_admin: Pengguna = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> LogDetailResponse:
    """
    Endpoint: GET /admin/kehadiran/{id_log}
    
    Ambil detail lengkap untuk satu log absensi.
    
    Request:
    - Path param: id_log
    - Header: Authorization: Bearer <token> (harus admin)
    
    Response: LogDetailResponse
    """
    try:
        # Query log dengan join
        log_data = db.query(
            LogAbsensi.id_log,
            LogAbsensi.waktu,
            LogAbsensi.status,
            LogAbsensi.tipe_kehadiran,
            LogAbsensi.jumlah_cocok,
            LogAbsensi.id_pengguna,
            Pengguna.nama_depan,
            Pengguna.nama_belakang,
            Pengguna.id_karyawan,
            Pengguna.jabatan
        ).join(
            Pengguna,
            LogAbsensi.id_pengguna == Pengguna.id_pengguna
        ).filter(
            LogAbsensi.id_log == id_log
        ).first()
        
        if not log_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Log dengan ID {id_log} tidak ditemukan"
            )
        
        # Get full karyawan data
        karyawan = db.query(Pengguna).filter(Pengguna.id_pengguna == log_data.id_pengguna).first()
        
        return LogDetailResponse(
            log=LogKehadiranDetail(
                id_log=log_data.id_log,
                waktu=log_data.waktu,
                status=log_data.status,
                tipe_kehadiran=log_data.tipe_kehadiran,
                jumlah_cocok=log_data.jumlah_cocok,
                id_pengguna=log_data.id_pengguna,
                nama_lengkap=f"{log_data.nama_depan} {log_data.nama_belakang}",
                id_karyawan=log_data.id_karyawan,
                jabatan=log_data.jabatan
            ),
            karyawan=KaryawanItem(
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
            )
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error mengambil detail log: {str(e)}"
        )
