# 📋 API Documentation - PresensiRupa

Dokumentasi lengkap untuk semua endpoints PresensiRupa.

## 🔐 Autentikasi

### 1️⃣ POST /autentikasi/daftar

**Daftar Pengguna Baru (Tanpa KTP Wajib)**

Registrasi user dengan data lengkap. **KTP opsional** (untuk verifikasi admin kemudian).

#### Request (form-data):

```
nama_pengguna:   "lycus"              (wajib, 3+ karakter)
kata_sandi:      "password123"        (wajib, 6+ karakter)
nama_depan:      "Lycus"              (wajib)
nama_belakang:   "Bendln"           (wajib)
id_karyawan:     "EMP001"             (wajib, unik per perusahaan)
jabatan:         "IT"                 (wajib: IT, Marketing, Sastra, dll)
alamat_surel:    "lycus@company.com"  (wajib, email)
tanggal_masuk:   "2025-01-15"         (wajib, format YYYY-MM-DD)
nik:             "1234567890123456"   (opsional, 16 digit)
foto_ktp:        [file]               (opsional, untuk OCR auto-ekstrak NIK)
```

#### Response (200):

```json
{
  "status": "sukses",
  "pesan": "Registrasi berhasil",
  "data": {
    "id_pengguna": 1,
    "nama_lengkap": "Lycus Bendln",
    "id_karyawan": "EMP001",
    "jabatan": "IT",
    "alamat_surel": "lycus@company.com",
    "nik": "1234567890123456"
  }
}
```

#### Error Cases:

```json
// Username sudah ada
{
  "detail": "nama_pengguna sudah terdaftar"
}

// Email sudah ada
{
  "detail": "alamat_surel sudah terdaftar"
}

// ID Karyawan sudah ada
{
  "detail": "id_karyawan sudah terdaftar"
}

// Format tanggal salah
{
  "detail": "Format tanggal_masuk harus YYYY-MM-DD"
}
```

#### cURL Example:

```bash
curl -X POST "http://localhost:8001/autentikasi/daftar" \
  -F "nama_pengguna=lycus" \
  -F "kata_sandi=password123" \
  -F "nama_depan=Lycus" \
  -F "nama_belakang=Bendln" \
  -F "id_karyawan=EMP001" \
  -F "jabatan=IT" \
  -F "alamat_surel=lycus@company.com" \
  -F "tanggal_masuk=2025-01-15" \
  -F "nik=1234567890123456" \
  -F "foto_ktp=@ktp.jpg"
```

---

### 2️⃣ POST /autentikasi/masuk

**Login & Dapatkan JWT Token**

Masuk ke sistem dan dapatkan access token untuk akses endpoint lainnya.

#### Request (JSON):

```json
{
  "nama_pengguna": "lycus",
  "kata_sandi": "password123"
}
```

#### Response (200):

```json
{
  "token_akses": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9wZW5nZ3VuYSI6MSwi...",
  "tipe_token": "bearer"
}
```

#### Error Cases:

```json
// Username/password salah
{
  "detail": "nama_pengguna atau kata_sandi salah"
}
```

#### cURL Example:

```bash
curl -X POST "http://localhost:8001/autentikasi/masuk" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_pengguna": "lycus",
    "kata_sandi": "password123"
  }'
```

---

## 👤 Profil

### 3️⃣ POST /profil/daftar-wajah

**Daftar 5 Foto Selfie (Master Embedding)**

Upload 5 foto selfie untuk bikin "profil wajah digital" yang disimpan sebagai embedding.

#### Headers:

```
Authorization: Bearer <TOKEN_DARI_LOGIN>
```

#### Request (form-data):

```
files: [foto1.jpg, foto2.jpg, foto3.jpg, foto4.jpg, foto5.jpg]
```

#### Response (200):

```json
{
  "status": "sukses",
  "pesan": "Wajah berhasil didaftarkan."
}
```

#### Error Cases:

```json
// Kurang dari 5 foto
{
  "detail": "Minimal 5 foto diperlukan, diterima 3"
}

// Tidak ada wajah yang terdeteksi
{
  "detail": "Tidak bisa ekstrak wajah dari foto. Pastikan ada wajah yang jelas di semua foto."
}

// User belum login
{
  "detail": "Header Authorization tidak ditemukan"
}
```

#### cURL Example:

```bash
curl -X POST "http://localhost:8001/profil/daftar-wajah" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "files=@foto1.jpg" \
  -F "files=@foto2.jpg" \
  -F "files=@foto3.jpg" \
  -F "files=@foto4.jpg" \
  -F "files=@foto5.jpg"
```

---

### 4️⃣ GET /profil/saya

**Ambil Profil User Login**

Dapatkan data lengkap profil user yang sedang login.

#### Headers:

```
Authorization: Bearer <TOKEN>
```

#### Response (200):

```json
{
  "id_pengguna": 1,
  "nama_pengguna": "lycus",
  "nama_depan": "Lycus",
  "nama_belakang": "Bendln",
  "id_karyawan": "EMP001",
  "jabatan": "IT",
  "alamat_surel": "lycus@company.com",
  "nik": "1234567890123456",
  "sudah_daftar_wajah": true,
  "status_kehadiran": "Hadir",
  "catatan_admin": null
}
```

#### cURL Example:

```bash
curl -X GET "http://localhost:8001/profil/saya" \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 5️⃣ PATCH /profil/update

**Update Data Profil (Optional)**

User bisa update beberapa field profil mereka.

#### Headers:

```
Authorization: Bearer <TOKEN>
```

#### Request (JSON):

```json
{
  "nama_depan": "Lycus Update",
  "nama_belakang": "Bendln",
  "alamat_surel": "newemail@company.com",
  "catatan_admin": "Catatan khusus dari admin"
}
```

Semua field di atas **opsional**. Hanya kirim field yang mau di-update.

#### Response (200):

```json
{
  "status": "sukses",
  "pesan": "Profil berhasil diupdate",
  "data": {
    "id_pengguna": 1,
    "nama_depan": "Lycus Update",
    "nama_belakang": "Bendln",
    "alamat_surel": "newemail@company.com",
    "catatan_admin": "Catatan khusus dari admin"
  }
}
```

#### cURL Example:

```bash
curl -X PATCH "http://localhost:8001/profil/update" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_depan": "Lycus Update",
    "alamat_surel": "newemail@company.com"
  }'
```

---

## ✅ Absensi

### 6️⃣ POST /absensi/cek-masuk

**Cek Masuk (2-dari-3 Foto)**

Upload 3 foto selfie untuk absen. Minimal 2 foto harus cocok dengan master embedding.

#### Headers:

```
Authorization: Bearer <TOKEN>
```

#### Request (form-data):

```
files: [foto_1.jpg, foto_2.jpg, foto_3.jpg]
```

#### Response (200 - SUKSES):

```json
{
  "status": "sukses",
  "pesan": "Absen Berhasil! (3/3 foto cocok)"
}
```

#### Response (200 - GAGAL):

```json
{
  "status": "gagal",
  "pesan": "Wajah tidak cocok. Hanya 1/3 foto cocok. Coba lagi."
}
```

#### Error Cases:

```json
// User belum daftar wajah
{
  "detail": "Anda belum mendaftar wajah. Silakan daftar di /profil/daftar-wajah terlebih dahulu."
}

// Kurang dari 3 foto
{
  "detail": "Minimal 3 foto diperlukan, diterima 2"
}

// Sudah absen hari ini (SUKSES)
{
  "detail": "Anda sudah absen hari ini!"
}

// User belum login
{
  "detail": "Header Authorization tidak ditemukan"
}
```

#### cURL Example:

```bash
curl -X POST "http://localhost:8001/absensi/cek-masuk" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "files=@foto_1.jpg" \
  -F "files=@foto_2.jpg" \
  -F "files=@foto_3.jpg"
```

---

### 7️⃣ GET /absensi/riwayat

**Ambil Riwayat Absensi**

Lihat history absensi user (sukses dan gagal).

#### Headers:

```
Authorization: Bearer <TOKEN>
```

#### Response (200):

```json
[
  {
    "tanggal": "2025-11-13",
    "jam": "09:30:45",
    "status": "SUKSES"
  },
  {
    "tanggal": "2025-11-13",
    "jam": "08:00:00",
    "status": "GAGAL"
  },
  {
    "tanggal": "2025-11-12",
    "jam": "08:45:30",
    "status": "SUKSES"
  }
]
```

#### cURL Example:

```bash
curl -X GET "http://localhost:8001/absensi/riwayat" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🧪 Testing Flow

### Step 1: Daftar User

```bash
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8001/autentikasi/daftar" \
  -F "nama_pengguna=lycus" \
  -F "kata_sandi=password123" \
  -F "nama_depan=Lycus" \
  -F "nama_belakang=Bendln" \
  -F "id_karyawan=EMP001" \
  -F "jabatan=IT" \
  -F "alamat_surel=lycus@company.com" \
  -F "tanggal_masuk=2025-01-15")

echo $TOKEN_RESPONSE
```

### Step 2: Login

```bash
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8001/autentikasi/masuk" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_pengguna": "lycus",
    "kata_sandi": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token_akses')
echo "Token: $TOKEN"
```

### Step 3: Daftar Wajah

```bash
curl -s -X POST "http://localhost:8001/profil/daftar-wajah" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@foto1.jpg" \
  -F "files=@foto2.jpg" \
  -F "files=@foto3.jpg" \
  -F "files=@foto4.jpg" \
  -F "files=@foto5.jpg" | jq
```

### Step 4: Lihat Profil

```bash
curl -s -X GET "http://localhost:8001/profil/saya" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Step 5: Absensi

```bash
curl -s -X POST "http://localhost:8001/absensi/cek-masuk" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@foto_1.jpg" \
  -F "files=@foto_2.jpg" \
  -F "files=@foto_3.jpg" | jq
```

### Step 6: Lihat Riwayat

```bash
curl -s -X GET "http://localhost:8001/absensi/riwayat" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 📊 Data Field Reference

### Tabel: pengguna

| Field | Type | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id_pengguna | INT | PK | ID unik |
| nama_pengguna | VARCHAR(100) | UNIQUE, NOT NULL | Username untuk login |
| hash_kata_sandi | VARCHAR(255) | NOT NULL | Password (di-hash bcrypt) |
| nama_depan | VARCHAR(100) | NOT NULL | Nama depan |
| nama_belakang | VARCHAR(100) | NOT NULL | Nama belakang |
| id_karyawan | VARCHAR(50) | UNIQUE, NOT NULL | ID internal perusahaan |
| jabatan | VARCHAR(100) | NOT NULL | Jabatan/departemen |
| alamat_surel | VARCHAR(255) | UNIQUE, NOT NULL | Email resmi |
| tanggal_masuk | DATETIME | NOT NULL | Tanggal mulai bekerja |
| nik | VARCHAR(16) | NULLABLE | NIK KTP (16 digit) |
| foto_ktp | VARCHAR(500) | NULLABLE | Path ke file KTP |
| embedding_wajah | VARCHAR(5000) | NULLABLE | Master embedding (JSON) |
| sudah_daftar_wajah | BOOLEAN | DEFAULT FALSE | Flag daftar wajah |
| status_kehadiran | VARCHAR(20) | DEFAULT "Tidak Ada Data" | Status hari ini |
| catatan_admin | VARCHAR(500) | NULLABLE | Catatan admin |
| dibuat_pada | DATETIME | AUTO | Timestamp buat |
| diupdate_pada | DATETIME | AUTO | Timestamp update |

### Tabel: log_absensi

| Field | Type | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id_log | INT | PK | ID unik log |
| id_pengguna | INT | FK, NOT NULL | Reference ke pengguna |
| waktu | DATETIME | AUTO | Timestamp absensi |
| status | VARCHAR(20) | NOT NULL | "SUKSES" atau "GAGAL" |
| tipe_kehadiran | VARCHAR(20) | DEFAULT "Hadir" | "Hadir", "Izin", "Cuti", dll |
| jumlah_cocok | INT | NULLABLE | 0, 1, 2, atau 3 (foto cocok) |

---

## 🔐 Security Notes

1. **Token JWT**: Valid untuk 8 jam (480 menit). Jangan share token dengan orang lain.
2. **Password**: Minimal 6 karakter, di-hash dengan bcrypt.
3. **Email**: Unik per user. Tidak bisa ada 2 user dengan email yang sama.
4. **ID Karyawan**: Unik per perusahaan/kampus.
5. **Face Embedding**: Disimpan di database sebagai JSON. Jangan bisa di-access lewat API untuk privacy.

---

## ⚙️ Configuration

**File**: `.env`

```env
# Database
DATABASE_URL=sqlite:///./presensi_rupa.db

# JWT
SECRET_KEY=<ganti-dengan-string-random-panjang>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Face Recognition
FACE_RECOGNITION_MODEL=hog
FACE_MATCH_THRESHOLD=0.6

# App
DEBUG=True
APP_NAME=PresensiRupa
APP_VERSION=1.0.0
```

---

Selesai! Dokumentasi lengkap untuk semua endpoints. 🚀
