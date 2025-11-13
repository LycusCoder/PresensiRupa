from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional, List
import json
import numpy as np
from app.db.database import get_db
from app.db.models import Pengguna
from app.schemas.profil import ResponseDaftarWajah
from app.schemas.pengguna import ProfilPengguna, ProfilPenggunaUpdate
from app.core.security import verify_token_akses
from app.services.layanan_wajah import LayananWajah

router = APIRouter(prefix="/profil", tags=["Profil"])


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> Pengguna:
    """
    Dependency untuk validasi token dan ambil user dari database.
    
    Args:
        authorization: Header "Authorization: Bearer <token>"
        db: Database session
    
    Returns:
        Object Pengguna dari database
    
    Raises:
        HTTPException 401 jika token invalid atau user tidak ditemukan
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


@router.post("/daftar-wajah")
async def daftar_wajah(
    files: List[UploadFile] = File(...),
    current_user: Pengguna = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint: POST /profil/daftar-wajah
    
    Daftar wajah pengguna dengan mengirim 5 foto selfie.
    
    Request:
    - files: List UploadFile dengan minimal 5 foto
    - Header: Authorization: Bearer <token>
    
    Proses:
    1. Terima 5 foto.
    2. Ekstrak embedding dari tiap foto.
    3. Hitung rata-rata (master embedding).
    4. Simpan ke database.
    
    Response:
    {
        "status": "sukses",
        "pesan": "Wajah berhasil didaftarkan."
    }
    """
    try:
        if len(files) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimal 5 foto diperlukan, diterima {len(files)}"
            )
        
        # Baca bytes dari 5 file
        list_file_bytes = []
        for file in files[:5]:  # Ambil max 5 file
            bytes_data = await file.read()
            list_file_bytes.append(bytes_data)
        
        # Buat master embedding
        master_embedding = LayananWajah.buat_master_embedding(list_file_bytes)
        
        if master_embedding is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tidak bisa ekstrak wajah dari foto. Pastikan ada wajah yang jelas di semua foto."
            )
        
        # Ubah numpy array ke list biar bisa disimpan sebagai JSON
        embedding_list = master_embedding.tolist()
        embedding_json = json.dumps(embedding_list)
        
        # Update database
        current_user.embedding_wajah = embedding_json
        current_user.sudah_daftar_wajah = True
        
        db.commit()
        
        return {
            "status": "sukses",
            "pesan": "Wajah berhasil didaftarkan."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error mendaftar wajah: {str(e)}"
        )


@router.get("/saya", response_model=ProfilPengguna)
async def profil_saya(
    current_user: Pengguna = Depends(get_current_user)
) -> ProfilPengguna:
    """
    Endpoint: GET /profil/saya
    
    Ambil profil pengguna yang sedang login.
    
    Request:
    - Header: Authorization: Bearer <token>
    
    Response:
    {
        "id_pengguna": 1,
        "nama_pengguna": "lycus",
        "nama_depan": "Lycus",
        "nama_belakang": "Bendln",
        "id_karyawan": "EMP001",
        "jabatan": "IT",
        "alamat_surel": "lycus@example.com",
        "nik": "1234567890123456",
        "sudah_daftar_wajah": true,
        "status_kehadiran": "Hadir",
        "catatan_admin": null
    }
    """
    return ProfilPengguna(
        id_pengguna=current_user.id_pengguna,
        nama_pengguna=current_user.nama_pengguna,
        nama_depan=current_user.nama_depan,
        nama_belakang=current_user.nama_belakang,
        id_karyawan=current_user.id_karyawan,
        jabatan=current_user.jabatan,
        alamat_surel=current_user.alamat_surel,
        nik=current_user.nik,
        sudah_daftar_wajah=current_user.sudah_daftar_wajah,
        status_kehadiran=current_user.status_kehadiran,
        catatan_admin=current_user.catatan_admin
    )


@router.patch("/update")
async def update_profil(
    data: ProfilPenggunaUpdate,
    current_user: Pengguna = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint: PATCH /profil/update (Optional)
    
    Update beberapa field profil pengguna.
    
    Request (JSON):
    {
        "nama_depan": "Lycus Update",
        "nama_belakang": "Bendln",
        "alamat_surel": "newemail@example.com",
        "catatan_admin": "Catatan untuk admin"
    }
    
    Response: Updated profile data
    """
    try:
        # Update hanya field yang diberikan (non-null)
        if data.nama_depan:
            current_user.nama_depan = data.nama_depan
        
        if data.nama_belakang:
            current_user.nama_belakang = data.nama_belakang
        
        if data.alamat_surel:
            # Cek apakah email sudah dipakai orang lain
            email_existing = db.query(Pengguna).filter(
                Pengguna.alamat_surel == data.alamat_surel,
                Pengguna.id_pengguna != current_user.id_pengguna
            ).first()
            
            if email_existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email sudah digunakan orang lain"
                )
            
            current_user.alamat_surel = data.alamat_surel
        
        if data.catatan_admin is not None:
            current_user.catatan_admin = data.catatan_admin
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "status": "sukses",
            "pesan": "Profil berhasil diupdate",
            "data": {
                "id_pengguna": current_user.id_pengguna,
                "nama_depan": current_user.nama_depan,
                "nama_belakang": current_user.nama_belakang,
                "alamat_surel": current_user.alamat_surel,
                "catatan_admin": current_user.catatan_admin
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error update profil: {str(e)}"
        )
