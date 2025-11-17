# 🧪 PresensiRupa - Testing Guide

## ✅ Test Accounts Created

**Status**: Test accounts telah berhasil ditambahkan ke database! 🎉

### Test Credentials

```
Format: username / password
════════════════════════════════════════════════════════════════════

1. ADMIN
   Username: admin
   Password: admin123
   Jabatan:  Administrator
   Email:    admin@presensi-rupa.com
   ID:       ADM001

2. KARYAWAN IT
   Username: john_doe
   Password: john123
   Jabatan:  Software Engineer
   Email:    john.doe@company.com
   ID:       IT001

3. KARYAWAN MARKETING
   Username: jane_smith
   Password: jane123
   Jabatan:  Marketing Manager
   Email:    jane.smith@company.com
   ID:       MKT001

4. KARYAWAN HR
   Username: bob_wilson
   Password: bob123
   Jabatan:  HR Specialist
   Email:    bob.wilson@company.com
   ID:       HR001

5. MAHASISWA
   Username: alice_chen
   Password: alice123
   Jabatan:  Mahasiswa
   Email:    alice.chen@university.edu
   ID:       STU001
```

---

## 🚀 Cara Menjalankan Testing

### 1. Start Backend & Frontend

```bash
# Terminal 1: Start Development
./dev.sh              # Linux/macOS
dev.bat              # Windows

# Tunggu sampai kedua service ready:
# ✅ Backend: http://localhost:8001
# ✅ Frontend: http://localhost:5173
```

### 2. Buka Application

```
Frontend:  http://localhost:5173
Backend:   http://localhost:8001/docs
```

---

## 🧪 Testing Checklist

### A. Authentication Testing

#### Test 1.1: Login dengan akun yang benar ✓
```
Steps:
1. Buka http://localhost:5173
2. Masuk halaman login (default page)
3. Input:
   - Username: admin
   - Password: admin123
4. Klik "Masuk"

Expected:
✅ Login berhasil
✅ Redirect ke /dashboard
✅ Halaman menampilkan: "Selamat datang Admin System"
✅ Token disimpan di localStorage
✅ Navbar menampilkan nama user: "Admin System"
✅ User bisa klik "Keluar" untuk logout
```

#### Test 1.2: Login dengan akun karyawan ✓
```
Steps:
1. Logout dulu (klik "Keluar")
2. Input:
   - Username: john_doe
   - Password: john123
3. Klik "Masuk"

Expected:
✅ Login berhasil
✅ Redirect ke /dashboard
✅ Navbar menampilkan: "John Doe"
✅ Navbar menampilkan jabatan: "Software Engineer"
```

#### Test 1.3: Login dengan password salah ✗
```
Steps:
1. Input:
   - Username: admin
   - Password: wrong_password
2. Klik "Masuk"

Expected:
❌ Login gagal
❌ Muncul error message
❌ Tetap di halaman login
```

#### Test 1.4: Login dengan username tidak ada ✗
```
Steps:
1. Input:
   - Username: nonexistent_user
   - Password: password123
2. Klik "Masuk"

Expected:
❌ Login gagal
❌ Muncul error message
❌ Tetap di halaman login
```

#### Test 1.5: Protected Routes ✓
```
Steps:
1. Logout atau clear localStorage
2. Buka http://localhost:5173/dashboard
3. Atau buka http://localhost:5173/profil

Expected:
✅ Redirect ke /masuk (login page)
✅ User harus login dulu untuk akses protected routes
```

### B. Frontend API Testing

#### Test 2.1: API Dokumentasi ✓
```
Steps:
1. Buka http://localhost:8001/docs
2. Lihatlah interactive API documentation (Swagger UI)

Expected:
✅ Semua endpoints terlihat
✅ Bisa klik "Try it out" untuk test endpoint
✅ Bisa lihat request/response format
```

#### Test 2.2: Login via API ✓
```
Steps:
1. Buka http://localhost:8001/docs
2. Cari endpoint: POST /autentikasi/masuk
3. Klik "Try it out"
4. Input request body:
   {
     "nama_pengguna": "admin",
     "kata_sandi": "admin123"
   }
5. Klik "Execute"

Expected:
✅ Response 200 (OK)
✅ Menerima:
   {
     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "token_type": "bearer"
   }
```

#### Test 2.3: Get Profile (setelah login) ✓
```
Steps:
1. Copy token dari login response
2. Di Swagger UI, klik "Authorize" (tombol di atas)
3. Paste token di field "bearer_token"
4. Cari endpoint: GET /profil/saya
5. Klik "Try it out" → "Execute"

Expected:
✅ Response 200 (OK)
✅ Menerima profil user:
   {
     "id_pengguna": 1,
     "nama_pengguna": "admin",
     "nama_depan": "Admin",
     "nama_belakang": "System",
     ...
   }
```

### C. Frontend Pages Testing

#### Test 3.1: Login Page ✓
```
✅ Halaman muncul dengan:
   - Logo "PR" (PresensiRupa)
   - Judul "PresensiRupa"
   - Subtitle "Sistem Absensi Pintar dengan Wajah"
   - Username input field
   - Password input field
   - "Masuk" button
   - "Daftar di sini" link

✅ Form validation:
   - Field wajib tidak boleh kosong
   - Bisa submit hanya jika kedua field terisi
   - Error message jika ada error

✅ Loading state:
   - Button berubah jadi "Memproses..." saat submit
   - Button disabled saat loading
   - Ada spinner icon
```

#### Test 3.2: Dashboard Page (Placeholder)
```
✅ Halaman muncul setelah login
✅ Navbar menampilkan user info
✅ Page menampilkan placeholder text
✅ Ready untuk implementasi

Expected selanjutnya:
- Welcome message
- Quick action tiles
- Recent attendance stats
```

#### Test 3.3: Navbar ✓
```
✅ Sticky di atas
✅ Menampilkan:
   - Logo "PR"
   - Title "PresensiRupa"
   - User name
   - User role/jabatan
   - "Keluar" button

✅ Klik "Keluar":
   - Token dihapus dari localStorage
   - Redirect ke /masuk
   - User logout
```

### D. State Management Testing

#### Test 4.1: Token Persistence ✓
```
Steps:
1. Login dengan salah satu akun
2. Refresh halaman (F5)
3. Halaman masih di /dashboard

Expected:
✅ User tetap login (token di-restore dari localStorage)
✅ Tidak ada redirect ke /masuk
✅ User info tetap ditampilkan
```

#### Test 4.2: Logout & Clear State ✓
```
Steps:
1. Di dashboard, klik "Keluar"
2. Kembali ke login page
3. Open browser console (F12)
4. Check localStorage (Application tab)

Expected:
✅ localStorage tidak ada token
✅ Auth store di-reset
✅ User tidak bisa akses protected routes
```

### E. Backend API Testing (via Swagger UI)

#### Test 5.1: Register New User
```
Endpoint: POST /autentikasi/daftar

Request:
{
  "nama_pengguna": "test_user_2",
  "kata_sandi": "password123",
  "nama_depan": "Test",
  "nama_belakang": "User",
  "id_karyawan": "TST002",
  "jabatan": "Tester",
  "alamat_surel": "test@example.com",
  "tanggal_masuk": "2024-11-13"
}

Expected:
✅ Response 200 (OK)
✅ User berhasil ditambahkan
✅ Bisa login dengan akun baru ini

Test:
Setelah register, login dengan akun baru
- Username: test_user_2
- Password: password123
```

#### Test 5.2: Get All Pengguna (Admin only)
```
Endpoint: GET /pengguna/daftar (jika ada)

Expected:
✅ List semua pengguna
✅ Format:
   [
     {
       "id_pengguna": 1,
       "nama_pengguna": "admin",
       "nama_depan": "Admin",
       ...
     },
     ...
   ]
```

#### Test 5.3: Check-In Flow (Future)
```
Endpoint: POST /absensi/cek-masuk

Will test:
✅ 3-photo upload
✅ Face matching algorithm
✅ Attendance record creation
✅ Response with confidence level

(Pending: Camera integration)
```

---

## 📊 Data Structure Reference

### User (Pengguna)
```json
{
  "id_pengguna": 1,
  "nama_pengguna": "admin",
  "nama_depan": "Admin",
  "nama_belakang": "System",
  "id_karyawan": "ADM001",
  "jabatan": "Administrator",
  "alamat_surel": "admin@presensi-rupa.com",
  "tanggal_masuk": "2024-01-01T00:00:00",
  "nik": "1234567890123456",
  "sudah_daftar_wajah": false,
  "status_kehadiran": "Tidak Ada Data",
  "catatan_admin": "System Administrator - for testing only"
}
```

### Login Response
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

---

## 🛠️ Troubleshooting

### Problem: Login tidak berhasil

**Solusi**:
1. Check apakah backend running di port 8001
   ```bash
   curl http://localhost:8001/docs
   ```

2. Check console di browser (F12) untuk error message

3. Check backend logs untuk error detail

4. Pastikan test account sudah ditambahkan:
   ```bash
   python insert_test_accounts.py
   ```

### Problem: Token expired

**Solusi**:
1. Token valid selama 8 jam
2. Jika token expired, login ulang
3. Buat token baru via `/autentikasi/masuk` endpoint

### Problem: Protected route tidak bekerja

**Solusi**:
1. Clear localStorage
   ```javascript
   // Di browser console
   localStorage.clear()
   ```

2. Refresh halaman
3. Login kembali

---

## ✨ Next Testing Phase

Setelah fitur dasar sudah ditest:

### Phase 2: Register Page Testing
- Form validation
- Optional KTP upload
- Success notification
- Error handling

### Phase 3: Profile Page Testing
- Display user info
- Edit form
- Save functionality
- Profile picture upload

### Phase 4: Face Registration Testing
- Camera integration
- 5-photo capture
- Preview before upload
- API upload

### Phase 5: Check-In Testing
- Camera integration
- 3-photo capture
- Face matching
- Attendance record

### Phase 6: Attendance History Testing
- Table display
- Filtering
- Statistics
- Export

---

## 📝 Test Report Template

Use this template untuk dokumentasi test results:

```
Test Date: 2025-11-13
Tester: [Your Name]
Build: Commit #2

═══════════════════════════════════════════════════════

TEST CASE: [Test Name]
Status: ✅ PASS / ❌ FAIL
Evidence: [Screenshot/Link]
Notes: [Additional notes]

═══════════════════════════════════════════════════════

Overall Result:
Total Tests: 5
Passed: 5
Failed: 0
Success Rate: 100%

Issues Found:
[List any issues]

Recommendations:
[Suggestions for next phase]
```

---

## 🎯 Critical Features to Test First

Priority order:
1. ✅ **Login/Logout** - Core functionality
2. ✅ **Token Persistence** - State management
3. ✅ **Protected Routes** - Security
4. 🔲 **Register** - User creation
5. 🔲 **Profile** - User data management
6. 🔲 **Face Registration** - Camera + Backend
7. 🔲 **Check-In** - Main feature
8. 🔲 **History** - Data display

---

## 📞 Quick Command Reference

```bash
# Start application
./dev.sh

# Stop application
Ctrl+C

# Re-insert test accounts
python insert_test_accounts.py

# View API docs
http://localhost:8001/docs

# Frontend
http://localhost:5173

# Database query (SQLite)
sqlite3 presensi_rupa.db
SELECT * FROM pengguna;
.exit
```

---

**Status**: ✅ READY FOR TESTING

Test accounts ready. API working. Frontend connecting. Let's test! 🚀
