# 🚀 Quick Start Guide - PresensiRupa

Setup dan run PresensiRupa dalam 5 menit.

---

## 1️⃣ Clone / Setup

```bash
# Navigate ke folder project
cd presensi_rupa

# Pastikan di folder yang benar
pwd  # Output: /home/lycus/Nourivex/MataKuliah/Pengolahan CItra/presensi_rupa
```

---

## 2️⃣ Install System Dependencies

### Linux (Ubuntu/Debian)

```bash
# Install Tesseract OCR
sudo apt-get update
sudo apt-get install tesseract-ocr

# Verify
tesseract --version
```

### macOS

```bash
# Install via Homebrew
brew install tesseract

# Verify
tesseract --version
```

### Windows

1. Download installer: https://github.com/UB-Mannheim/tesseract/wiki
2. Install di folder default (C:\Program Files\Tesseract-OCR)
3. Verify di Command Prompt: `tesseract --version`

---

## 3️⃣ Install Python Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate venv
# Linux/macOS:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

**Expected output**: `Successfully installed fastapi uvicorn sqlalchemy ... (15 packages)`

---

## 4️⃣ Setup Environment Variables

Edit file `.env`:

```env
# Database
DATABASE_URL=sqlite:///./presensi_rupa.db

# JWT Secret (GANTI INI untuk production!)
SECRET_KEY=super-secret-key-lycus-2025-ganti-sebelum-production

# JWT Config
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Face Recognition
FACE_RECOGNITION_MODEL=hog      # hog (CPU-fast) atau cnn (GPU-akurat)
FACE_MATCH_THRESHOLD=0.6        # 0.5 = strict, 0.6 = moderate, 0.7 = lenient

# App
DEBUG=True
APP_NAME=PresensiRupa
APP_VERSION=1.0.0
```

---

## 5️⃣ Run Server

```bash
# Development mode (with auto-reload)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Output yang diharapkan:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete
```

---

## 6️⃣ Test API

Buka di browser atau terminal:

### Swagger UI (Interactive API Docs)
```
http://localhost:8001/docs
```

### ReDoc (API Reference)
```
http://localhost:8001/redoc
```

### Health Check
```bash
curl http://localhost:8001/health
```

---

## 🧪 Quick Test Flow

### 1. Register User

```bash
curl -X POST "http://localhost:8001/autentikasi/daftar" \
  -F "nama_pengguna=test_user" \
  -F "kata_sandi=password123" \
  -F "nama_depan=Test" \
  -F "nama_belakang=User" \
  -F "id_karyawan=EMP001" \
  -F "jabatan=IT" \
  -F "alamat_surel=test@example.com" \
  -F "tanggal_masuk=2025-01-15"
```

Response:
```json
{
  "status": "sukses",
  "pesan": "Registrasi berhasil",
  "data": {
    "id_pengguna": 1,
    "nama_lengkap": "Test User",
    "id_karyawan": "EMP001",
    "jabatan": "IT",
    "alamat_surel": "test@example.com",
    "nik": null
  }
}
```

### 2. Login

```bash
curl -X POST "http://localhost:8001/autentikasi/masuk" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_pengguna": "test_user",
    "kata_sandi": "password123"
  }'
```

Response:
```json
{
  "token_akses": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipe_token": "bearer"
}
```

**Catat TOKEN untuk request berikutnya!**

### 3. Get Profile

```bash
TOKEN="<paste-token-dari-response-login>"

curl -X GET "http://localhost:8001/profil/saya" \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "id_pengguna": 1,
  "nama_pengguna": "test_user",
  "nama_depan": "Test",
  "nama_belakang": "User",
  "id_karyawan": "EMP001",
  "jabatan": "IT",
  "alamat_surel": "test@example.com",
  "nik": null,
  "sudah_daftar_wajah": false,
  "status_kehadiran": "Tidak Ada Data",
  "catatan_admin": null
}
```

---

## 📁 Database

Setelah first run, akan ada file:

```
presensi_rupa.db  (SQLite database)
```

Untuk reset database:
```bash
rm presensi_rupa.db
# Run server lagi, akan bikin database baru
```

---

## ⚙️ Konfigurasi Face Recognition

### Model Choice

**HOG** (Histogram of Oriented Gradients) - **RECOMMENDED untuk demo**
- ✅ CPU-based, cepat (< 2 detik inference)
- ✅ Cocok laptop 8GB
- ✅ Akurasi 85-90%
- ❌ Tidak bisa pake GPU

```env
FACE_RECOGNITION_MODEL=hog
```

**CNN** (Convolutional Neural Network)
- ✅ Lebih akurat (95%+)
- ❌ Butuh GPU (CUDA)
- ❌ Inference lambat (~10 detik per 3 foto)
- ❌ Tidak cocok buat demo laptop 8GB

```env
FACE_RECOGNITION_MODEL=cnn
```

### Threshold Tuning

```env
FACE_MATCH_THRESHOLD=0.6  # Default
```

- **0.4**: Sangat strict (hanya cocok foto pixel-perfect)
- **0.5**: Strict (rekomendasi untuk high-security)
- **0.6**: Moderate (rekomendasi untuk demo)
- **0.7**: Lenient (cocok dengan pencahayaan buruk)

---

## 🐛 Troubleshooting

### Error: `ModuleNotFoundError: No module named 'fastapi'`

Solusi: Install requirements
```bash
pip install -r requirements.txt
```

### Error: `pytesseract.TesseractNotFoundError`

Solusi: Install Tesseract di system (lihat bagian "Install System Dependencies")

### Error: `face_recognition tidak bisa ekstrak wajah`

Penyebab:
- Foto terlalu gelap
- Wajah terhalang (masker, kacamata gelap)
- Angle aneh (profil, dari bawah)
- Kualitas foto rendah

Solusi: Gunakan foto berkualitas bagus dengan pencahayaan cukup.

### Database error: `database is locked`

Penyebab: Multiple instances mengakses DB bersamaan

Solusi: Close semua window/terminal lain yang run app, restart server

### Token expired: `Token tidak valid atau sudah expired`

Penyebab: Token sudah valid 8 jam

Solusi: Login ulang (`POST /autentikasi/masuk`)

---

## 📝 Useful Commands

```bash
# Run dengan specific port
python -m uvicorn app.main:app --reload --port 9000

# Run tanpa reload (production)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001

# Run dengan worker count (production)
python -m uvicorn app.main:app --workers 4 --port 8001

# Check if server running
curl http://localhost:8001/health

# View all endpoints
curl http://localhost:8001/openapi.json | jq

# Kill process di port 8001
lsof -ti:8001 | xargs kill -9
```

---

## 🎯 Next Steps

1. **Daftar beberapa user** untuk testing
2. **Upload foto wajah** (5 foto per user) untuk setup face recognition
3. **Test absensi** dengan 3 foto
4. **Lanjut frontend** (React) untuk UI

---

## 📚 Full Documentation

- `README.md` - Overview & setup lengkap
- `API_DOCS.md` - API documentation dengan cURL examples
- `COMPLETION_CHECKLIST.md` - Feature checklist
- `QUICK_START.md` - File ini

---

**Happy coding! 🚀🇮🇩**
