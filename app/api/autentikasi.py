from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Form
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.database import get_db
from app.db.models import Pengguna
from app.schemas.autentikasi import (
    PenggunaDaftarRequest, 
    PenggunaMasukRequest, 
    TokenAkses,
    PenggunaDaftarResponse
)
from app.core.security import hash_kata_sandi, verify_kata_sandi, buat_token_akses
from app.services.layanan_ocr import LayananOCR

router = APIRouter(prefix="/autentikasi", tags=["Autentikasi"])


@router.post("/daftar", response_model=PenggunaDaftarResponse)
async def daftar_pengguna(
    nama_pengguna: str = Form(..., min_length=3),
    kata_sandi: str = Form(..., min_length=6),
    nama_depan: str = Form(..., min_length=2),
    nama_belakang: str = Form(..., min_length=2),
    id_karyawan: str = Form(..., min_length=3),
    jabatan: str = Form(..., min_length=3),
    alamat_surel: str = Form(...),
    tanggal_masuk: str = Form(...),  # Format: YYYY-MM-DD
    nik: str = Form(None),
    foto_ktp: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """
    Endpoint: POST /autentikasi/daftar
    
    Daftar pengguna baru (TANPA KTP WAJIB).
    
    Field Wajib:
    - nama_pengguna: Username
    - kata_sandi: Password (min 6 karakter)
    - nama_depan, nama_belakang
    - id_karyawan: ID unik perusahaan/kampus
    - jabatan: Jabatan/departemen
    - alamat_surel: Email
    - tanggal_masuk: Tanggal mulai (format: YYYY-MM-DD)
    
    Field Opsional:
    - nik: NIK KTP (16 digit)
    - foto_ktp: File KTP (untuk verifikasi admin)
    
    Request: form-data
    Response: JSON dengan data pengguna yang terdaftar
    """
    try:
        # Validasi input
        if not nama_pengguna or len(nama_pengguna) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="nama_pengguna minimal 3 karakter"
            )
        
        if not kata_sandi or len(kata_sandi) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="kata_sandi minimal 6 karakter"
            )
        
        # Cek apakah nama_pengguna sudah ada
        pengguna_existing = db.query(Pengguna).filter(
            Pengguna.nama_pengguna == nama_pengguna
        ).first()
        
        if pengguna_existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="nama_pengguna sudah terdaftar"
            )
        
        # Cek apakah id_karyawan sudah ada
        karyawan_existing = db.query(Pengguna).filter(
            Pengguna.id_karyawan == id_karyawan
        ).first()
        
        if karyawan_existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="id_karyawan sudah terdaftar"
            )
        
        # Cek apakah email sudah ada
        email_existing = db.query(Pengguna).filter(
            Pengguna.alamat_surel == alamat_surel
        ).first()
        
        if email_existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="alamat_surel sudah terdaftar"
            )
        
        # Parse tanggal_masuk
        try:
            tanggal_masuk_dt = datetime.strptime(tanggal_masuk, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format tanggal_masuk harus YYYY-MM-DD"
            )
        
        # OPSIONAL: Jika ada foto KTP, jalankan OCR
        nik_dari_ocr = nik  # Default: pake nik yang dikirim user
        nama_lengkap_final = f"{nama_depan} {nama_belakang}"
        
        if foto_ktp and foto_ktp.filename:
            foto_bytes = await foto_ktp.read()
            hasil_ocr, error_ocr = LayananOCR.lurusin_dan_ocr(foto_bytes)
            
            if error_ocr:
                # Jangan error fatal, cuma warning
                print(f"[WARNING] Gagal OCR KTP: {error_ocr}")
            else:
                # Pake hasil OCR jika available
                if hasil_ocr.get("nik"):
                    nik_dari_ocr = hasil_ocr.get("nik")
                if hasil_ocr.get("nama_lengkap"):
                    # Bisa di-update kalau mau, tapi kita prioritas input form
                    pass
        
        # Hash password
        hash_kata_sandi_val = hash_kata_sandi(kata_sandi)
        
        # Simpan ke database
        pengguna_baru = Pengguna(
            nama_pengguna=nama_pengguna,
            hash_kata_sandi=hash_kata_sandi_val,
            nama_depan=nama_depan,
            nama_belakang=nama_belakang,
            id_karyawan=id_karyawan,
            jabatan=jabatan,
            alamat_surel=alamat_surel,
            tanggal_masuk=tanggal_masuk_dt,
            nik=nik_dari_ocr,
            sudah_daftar_wajah=False,
            status_kehadiran="Tidak Ada Data"
        )
        
        db.add(pengguna_baru)
        db.commit()
        db.refresh(pengguna_baru)
        
        return {
            "status": "sukses",
            "pesan": "Registrasi berhasil",
            "data": {
                "id_pengguna": pengguna_baru.id_pengguna,
                "nama_lengkap": nama_lengkap_final,
                "id_karyawan": id_karyawan,
                "jabatan": jabatan,
                "alamat_surel": alamat_surel,
                "nik": nik_dari_ocr
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registrasi: {str(e)}"
        )


@router.post("/masuk", response_model=TokenAkses)
async def masuk_pengguna(
    data: PenggunaMasukRequest,
    db: Session = Depends(get_db)
):
    """
    Endpoint: POST /autentikasi/masuk
    
    Login pengguna dan dapatkan JWT token.
    
    Request Body (JSON):
    {
        "nama_pengguna": "...",
        "kata_sandi": "..."
    }
    
    Response (200):
    {
        "token_akses": "eyJhbGc...",
        "tipe_token": "bearer"
    }
    """
    try:
        # Cari pengguna berdasarkan nama_pengguna
        pengguna = db.query(Pengguna).filter(
            Pengguna.nama_pengguna == data.nama_pengguna
        ).first()
        
        if not pengguna:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="nama_pengguna atau kata_sandi salah"
            )
        
        # Verify password
        if not verify_kata_sandi(data.kata_sandi, pengguna.hash_kata_sandi):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="nama_pengguna atau kata_sandi salah"
            )
        
        # Buat token
        token = buat_token_akses({"id_pengguna": pengguna.id_pengguna})
        
        return {
            "token_akses": token,
            "tipe_token": "bearer"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error login: {str(e)}"
        )
