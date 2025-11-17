# PresensiRupa - Smart Attendance System 🇮🇩

Sistem absensi cerdas menggunakan Face Recognition (pengenalan wajah) + OCR (pembacaan dokumen KTP).

## 🎯 Fitur Utama

1. **Registrasi Karyawan via KTP**
   - Scan KTP dengan kamera.
   - OCR otomatis ekstrak Nama Lengkap dan NIK.
   - Hash password dengan aman (bcrypt).

2. **Setup Wajah (Face Registration)**
   - Daftar 5 foto selfie.
   - Sistem bikin "Master Embedding" (profil wajah digital).

3. **Absensi dengan 2-dari-3 Foto**
   - Kirim 3 foto selfie saat absensi.
   - Minimal 2 foto harus cocok dengan wajah yang terdaftar.
   - Anti-fraud (tidak bisa pakai foto).
   - Anti-dobel absen (hanya 1x per hari).

4. **Riwayat Absensi**
   - Lihat history absensi pribadi.

## 📦 Tech Stack

- **Backend**: FastAPI, SQLAlchemy (ORM)
- **Database**: SQLite (atau PostgreSQL di production)
- **Face Recognition**: `face_recognition` (Dlib)
- **OCR**: Tesseract
- **Image Processing**: OpenCV
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcrypt

## 📋 Struktur Direktori

```
presensi_rupa/
├── .env                          # Konfigurasi (SECRET_KEY, DB URL, dll)
├── .gitignore
├── requirements.txt
├── README.md
│
└── app/
    ├── __init__.py
    ├── main.py                   # Entry point, FastAPI initialization
    │
    ├── api/                      # API Endpoints/Routers
    │   ├── __init__.py
    │   ├── autentikasi.py        # POST /autentikasi/daftar, POST /autentikasi/masuk
    │   ├── profil.py             # POST /profil/daftar-wajah, GET /profil/saya
    │   └── absensi.py            # POST /absensi/cek-masuk, GET /absensi/riwayat
    │
    ├── core/                     # Core logic, security, config
    │   ├── __init__.py
    │   ├── config.py             # Settings dari .env
    │   └── security.py           # JWT, password hashing
    │
    ├── db/                       # Database setup, models
    │   ├── __init__.py
    │   ├── database.py           # SQLAlchemy engine, session
    │   └── models.py             # Pengguna, LogAbsensi
    │
    ├── schemas/                  # Pydantic models (validasi input/output)
    │   ├── __init__.py
    │   ├── autentikasi.py        # PenggunaDaftar, PenggnaaMasuk, TokenAkses
    │   ├── profil.py             # ResponseDaftarWajah
    │   ├── absensi.py            # ResponseAbsensi, ResponseRiwayatAbsensi
    │   └── pengguna.py           # ProfilPengguna
    │
    └── services/                 # Business logic, heavy computations
        ├── __init__.py
        ├── layanan_ocr.py        # OCR + perspective transform
        └── layanan_wajah.py      # Face embedding, face matching
```

## 🚀 Setup & Run

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: Tesseract harus di-install terpisah di system:
- **Linux**: `sudo apt-get install tesseract-ocr`
- **macOS**: `brew install tesseract`
- **Windows**: Download dari https://github.com/UB-Mannheim/tesseract/wiki

### 2. Setup Environment Variables

Edit file `.env`:

```env
DATABASE_URL=sqlite:///./presensi_rupa.db
SECRET_KEY=your-super-secret-key-lycus-2025-ganti-ini-sebelum-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
DEBUG=True
APP_NAME=PresensiRupa
APP_VERSION=1.0.0
```

### 3. Run Server

```bash
# Development
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Production (tanpa reload)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Server akan jalan di `http://localhost:8001`

### 4. Dokumentasi API

FastAPI otomatis generate docs:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 📡 API Endpoints

### 1. Autentikasi

#### `POST /autentikasi/daftar`
Daftar pengguna baru dengan KTP.

**Request** (form-data):
```
nama_pengguna: "lycus"
kata_sandi: "password123"
foto_ktp: [file gambar KTP]
```

**Response** (200):
```json
{
  "status": "sukses",
  "pesan": "Registrasi berhasil",
  "data": {
    "id_pengguna": 1,
    "nama": "Lycus Bendln",
    "nik": "1234567890123456"
  }
}
```

#### `POST /autentikasi/masuk`
Login dan dapatkan JWT token.

**Request** (JSON):
```json
{
  "nama_pengguna": "lycus",
  "kata_sandi": "password123"
}
```

**Response** (200):
```json
{
  "token_akses": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipe_token": "bearer"
}
```

### 2. Profil

#### `POST /profil/daftar-wajah`
Daftar 5 foto selfie untuk bikin master embedding.

**Headers**: `Authorization: Bearer <token_akses>`

**Request** (form-data):
```
files: [file1.jpg, file2.jpg, file3.jpg, file4.jpg, file5.jpg]
```

**Response** (200):
```json
{
  "status": "sukses",
  "pesan": "Wajah berhasil didaftarkan."
}
```

#### `GET /profil/saya`
Ambil profil user yang sedang login.

**Headers**: `Authorization: Bearer <token_akses>`

**Response** (200):
```json
{
  "nama_pengguna": "lycus",
  "nama_lengkap": "Lycus Bendln",
  "nik": "1234567890123456",
  "sudah_daftar_wajah": true
}
```

### 3. Absensi

#### `POST /absensi/cek-masuk`
Absensi dengan 3 foto (2-dari-3 harus cocok).

**Headers**: `Authorization: Bearer <token_akses>`

**Request** (form-data):
```
files: [foto_1.jpg, foto_2.jpg, foto_3.jpg]
```

**Response** (200, jika SUKSES):
```json
{
  "status": "sukses",
  "pesan": "Absen Berhasil! (3/3 foto cocok)"
}
```

**Response** (200, jika GAGAL):
```json
{
  "status": "gagal",
  "pesan": "Wajah tidak cocok. Hanya 1/3 foto cocok. Coba lagi."
}
```

#### `GET /absensi/riwayat`
Lihat riwayat absensi user.

**Headers**: `Authorization: Bearer <token_akses>`

**Response** (200):
```json
[
  {
    "tanggal": "2025-11-13",
    "jam": "09:30:45",
    "status": "SUKSES"
  },
  {
    "tanggal": "2025-11-12",
    "jam": "08:45:30",
    "status": "SUKSES"
  }
]
```

## 🧪 Testing dengan cURL/Postman

### 1. Daftar User

```bash
curl -X POST "http://localhost:8001/autentikasi/daftar" \
  -F "nama_pengguna=lycus" \
  -F "kata_sandi=password123" \
  -F "foto_ktp=@ktp.jpg"
```

### 2. Login

```bash
curl -X POST "http://localhost:8001/autentikasi/masuk" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_pengguna": "lycus",
    "kata_sandi": "password123"
  }'
```

(Catat token dari response, gunakan di request selanjutnya)

### 3. Daftar Wajah

```bash
curl -X POST "http://localhost:8001/profil/daftar-wajah" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "files=@foto1.jpg" \
  -F "files=@foto2.jpg" \
  -F "files=@foto3.jpg" \
  -F "files=@foto4.jpg" \
  -F "files=@foto5.jpg"
```

### 4. Cek Profil

```bash
curl -X GET "http://localhost:8001/profil/saya" \
  -H "Authorization: Bearer <TOKEN>"
```

### 5. Absensi

```bash
curl -X POST "http://localhost:8001/absensi/cek-masuk" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "files=@foto1.jpg" \
  -F "files=@foto2.jpg" \
  -F "files=@foto3.jpg"
```

### 6. Riwayat Absensi

```bash
curl -X GET "http://localhost:8001/absensi/riwayat" \
  -H "Authorization: Bearer <TOKEN>"
```

## ⚙️ Konfigurasi Penting

### Face Recognition Model

Di `.env`:
```env
FACE_RECOGNITION_MODEL=hog  # "hog" atau "cnn"
FACE_MATCH_THRESHOLD=0.6    # Semakin rendah = semakin strict
```

- **hog** (Histogram of Oriented Gradients): Cepat, CPU-based, cocok untuk demo 8GB RAM.
- **cnn** (Convolutional Neural Networks): Lebih akurat, tapi butuh GPU. Jangan pake di demo!

### Face Match Threshold

- **0.6** (default): Moderate. Agak lenient, cocok buat demo.
- **0.5**: Lebih strict. Perlu match lebih dekat.
- **0.4**: Sangat strict. Hanya cocok jika kualitas foto sempurna.

## 🔒 Security Tips (Sebelum Production)

1. **Ubah SECRET_KEY** di `.env` dengan string random yang panjang.
2. **Gunakan PostgreSQL** bukan SQLite.
3. **Enable HTTPS** (SSL/TLS).
4. **Restrict CORS** ke domain spesifik.
5. **Rate limiting** untuk endpoint sensitive (login, absensi).
6. **Backup database** regularly.

## 🐛 Troubleshooting

### Error: `pytesseract.TesseractNotFoundError`
Solusi: Install Tesseract di system (lihat bagian Setup).

### Error: `face_recognition tidak bisa ekstrak wajah`
Solusi: Pastikan foto jelas, terang, dan ada wajah yang terlihat.

### Error: `Token tidak valid`
Solusi: Pastikan format header benar: `Authorization: Bearer <token>`

### Error: `Embedding tidak cocok meski orangnya sama`
Solusi: Cek kualitas foto, lighting, angle. Reduce `FACE_MATCH_THRESHOLD` jika terlalu strict.

## 📝 Notes untuk Demo

- **Anti-Lag**: Semua logic jalan di satu laptop 8GB. Tidak ada streaming video over network.
- **Kecepatan**: Inference untuk 3 foto biasanya < 2 detik (pake hog model).
- **Akurasi**: Minimal 85% jika user kooperatif dan foto cukup bagus.
- **Database**: Simpan di SQLite buat demo. Jangan pake shared network database.

## 📚 Reference

- FastAPI: https://fastapi.tiangolo.com/
- face_recognition: https://github.com/ageitgey/face_recognition
- Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
- OpenCV: https://opencv.org/

## 👨‍💻 Author

Lycus Bendln - Pengolahan Citra Digital

---

**Semoga sukses presentasinya, Lycus! 🚀🇮🇩**
