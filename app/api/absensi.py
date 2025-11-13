from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from datetime import datetime, date
import json
import numpy as np
from app.db.database import get_db
from app.db.models import Pengguna, LogAbsensi
from app.schemas.absensi import ResponseAbsensi, ResponseRiwayatAbsensi
from app.core.security import verify_token_akses
from app.services.layanan_wajah import LayananWajah

router = APIRouter(prefix="/absensi", tags=["Absensi"])


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> Pengguna:
    """
    Dependency untuk validasi token dan ambil user dari database.
    (Reuse dari profil.py)
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


@router.post("/cek-masuk")
async def cek_masuk(
    files: List[UploadFile] = File(...),
    current_user: Pengguna = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ResponseAbsensi:
    """
    Endpoint: POST /absensi/cek-masuk
    
    Cek absensi menggunakan 3 foto dengan logika 2-dari-3.
    
    Request:
    - files: List UploadFile dengan 3 foto
    - Header: Authorization: Bearer <token>
    
    Proses:
    1. Ambil id_pengguna dari token.
    2. Cek anti-dobel (sudah absen hari ini?).
    3. Ambil embedding induk si user dari DB.
    4. Loop 3 foto:
       - Ekstrak embedding foto.
       - Bandingkan dengan embedding induk.
       - Jika cocok, jumlah_cocok += 1.
    5. Jika jumlah_cocok >= 2: SUKSES, simpan log.
       Jika jumlah_cocok < 2: GAGAL, simpan log.
    
    Response:
    {
        "status": "sukses" atau "gagal",
        "pesan": "Absen Berhasil!" atau "Wajah tidak cocok. Coba lagi."
    }
    """
    try:
        if not current_user.sudah_daftar_wajah:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Anda belum mendaftar wajah. Silakan daftar di /profil/daftar-wajah terlebih dahulu."
            )
        
        if len(files) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimal 3 foto diperlukan, diterima {len(files)}"
            )
        
        # Cek anti-dobel (sudah absen SUKSES hari ini?)
        hari_ini = date.today()
        absen_hari_ini = db.query(LogAbsensi).filter(
            and_(
                LogAbsensi.id_pengguna == current_user.id_pengguna,
                LogAbsensi.status == "SUKSES",
                # Filter by tanggal (datetime >= hari ini pukul 00:00)
                db.func.date(LogAbsensi.waktu) == hari_ini
            )
        ).first()
        
        if absen_hari_ini:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Anda sudah absen hari ini!"
            )
        
        # Ambil embedding induk dari DB
        if not current_user.embedding_wajah:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Embedding wajah tidak ditemukan. Silakan daftar wajah terlebih dahulu."
            )
        
        master_embedding_list = json.loads(current_user.embedding_wajah)
        master_embedding = np.array(master_embedding_list)
        
        # Baca 3 file foto
        list_file_bytes = []
        for file in files[:3]:
            bytes_data = await file.read()
            list_file_bytes.append(bytes_data)
        
        # Cek 2 dari 3
        hasil_cocok, jumlah_cocok = LayananWajah.cek_absen_2dari3(
            master_embedding,
            list_file_bytes
        )
        
        # Simpan log
        if hasil_cocok:
            status_absen = "SUKSES"
            pesan = f"Absen Berhasil! ({jumlah_cocok}/3 foto cocok)"
        else:
            status_absen = "GAGAL"
            pesan = f"Wajah tidak cocok. Hanya {jumlah_cocok}/3 foto cocok. Coba lagi."
        
        log_absensi = LogAbsensi(
            id_pengguna=current_user.id_pengguna,
            status=status_absen,
            jumlah_cocok=jumlah_cocok
        )
        
        db.add(log_absensi)
        db.commit()
        
        return ResponseAbsensi(
            status="sukses" if hasil_cocok else "gagal",
            pesan=pesan
        )
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cek absensi: {str(e)}"
        )


@router.get("/riwayat")
async def riwayat_absensi(
    current_user: Pengguna = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[ResponseRiwayatAbsensi]:
    """
    Endpoint: GET /absensi/riwayat
    
    Ambil riwayat absensi pengguna yang sedang login.
    
    Request:
    - Header: Authorization: Bearer <token>
    
    Response:
    [
        {
            "tanggal": "2025-11-13",
            "jam": "09:30:45",
            "status": "SUKSES"
        },
        ...
    ]
    """
    try:
        logs = db.query(LogAbsensi).filter(
            LogAbsensi.id_pengguna == current_user.id_pengguna
        ).order_by(LogAbsensi.waktu.desc()).all()
        
        result = []
        for log in logs:
            tanggal = log.waktu.strftime("%Y-%m-%d")
            jam = log.waktu.strftime("%H:%M:%S")
            
            result.append(ResponseRiwayatAbsensi(
                tanggal=tanggal,
                jam=jam,
                status=log.status
            ))
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error ambil riwayat: {str(e)}"
        )
