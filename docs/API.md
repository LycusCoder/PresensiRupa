# 📡 Smart Presence - API Documentation

Base URL: `http://127.0.0.1:5000`

---

## Authentication

### Admin Login
**Endpoint:** `POST /api/admin/login`

**Request:**
```json
{
  "username": "admin",
  "password": "adminpass"
}
```

**Response:**
```json
{
  "ok": true,
  "token": "session_token_here"
}
```

**Error:**
```json
{
  "ok": false,
  "message": "Invalid credentials"
}
```

---

## Student Management

### Get All Students
**Endpoint:** `GET /api/data/students`

**Response:**
```json
[
  {
    "nim": "24225046",
    "nama": "Muhammad Affif",
    "semester": "5",
    "kelas": "A",
    "jurusan": "Teknik Informatika",
    "photo_path": null,
    "has_encoding": false,
    "encodings_count": 0,
    "timestamp_registrasi": "2025-12-11T03:18:54.651674"
  }
]
```

### Create Student
**Endpoint:** `POST /api/admin/student`

**Request:**
```json
{
  "nim": "24225047",
  "nama": "Ahmad Rizki",
  "semester": "5",
  "kelas": "B",
  "jurusan": "Teknik Informatika"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Student created",
  "nim": "24225047"
}
```

### Update Student
**Endpoint:** `PUT /api/admin/student/<nim>`

**Request:**
```json
{
  "nama": "Ahmad Rizki Updated",
  "semester": "6",
  "kelas": "A"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Student updated"
}
```

### Delete Student
**Endpoint:** `DELETE /api/admin/student/<nim>`

**Response:**
```json
{
  "ok": true,
  "message": "Student deleted"
}
```

---

## Face Registration

### Register Face (Single Frame)
**Endpoint:** `POST /api/register/capture`

**Request:**
```json
{
  "nim": "24225046",
  "frame_b64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Encoding registered successfully",
  "added": 1
}
```

### Register Face (Multiple Frames)
**Endpoint:** `POST /api/register/capture`

**Request:**
```json
{
  "nim": "24225046",
  "frames_b64": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUg...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAA..."
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Encodings registered successfully",
  "added": 3,
  "failed": 0
}
```

**Error Cases:**
```json
// No NIM provided
{
  "ok": false,
  "message": "nim required"
}

// Student not found
{
  "ok": false,
  "message": "nim not found, register data first"
}

// No face detected
{
  "ok": false,
  "message": "No face detected in frame"
}

// Liveness check failed
{
  "ok": false,
  "message": "Liveness check failed"
}
```

---

## Attendance

### Mark Attendance
**Endpoint:** `POST /api/presence/mark`

**Request:**
```json
{
  "frame_b64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response (Match Found):**
```json
{
  "ok": true,
  "nim": "24225046",
  "nama": "Muhammad Affif",
  "distance": 0.42,
  "message": "Kehadiran tercatat"
}
```

**Response (No Match):**
```json
{
  "ok": false,
  "message": "Wajah tidak dikenali (distance: 0.78)"
}
```

**Error Cases:**
```json
// No frame provided
{
  "ok": false,
  "message": "frame_b64 required"
}

// No face detected
{
  "ok": false,
  "message": "Tidak ada wajah terdeteksi"
}

// Liveness check failed
{
  "ok": false,
  "message": "Liveness check gagal (foto/video?)"
}

// Database empty
{
  "ok": false,
  "message": "Database kosong, tidak ada wajah terdaftar"
}
```

---

## Statistics

### Get System Stats
**Endpoint:** `GET /api/admin/stats`

**Response:**
```json
{
  "total_students": 124,
  "students_with_face": 98,
  "total_encodings": 478,
  "total_attendance_today": 87,
  "attendance_rate_today": 88.7,
  "last_attendance": {
    "nim": "24225046",
    "nama": "Muhammad Affif",
    "timestamp": "2025-12-11T08:45:23"
  }
}
```

---

## Page Components

### Serve Page Component
**Endpoint:** `GET /static/pages/<filename>`

**Examples:**
- `/static/pages/registrasi.html`
- `/static/pages/data.html`
- `/static/pages/dashboard.html`
- `/static/pages/laporan.html`

**Response:** HTML content

---

## Data Models

### Student (Mahasiswa)
```typescript
{
  nim: string;           // Primary key, e.g., "24225046"
  nama: string;          // Full name
  semester: string;      // e.g., "5"
  kelas: string;         // e.g., "A"
  jurusan: string;       // e.g., "Teknik Informatika"
  photo_path: string | null;  // Path to photo (optional)
  timestamp_registrasi: string;  // ISO 8601 datetime
}
```

### Encoding
```typescript
{
  id: number;           // Auto-increment
  nim: string;          // Foreign key to Mahasiswa
  encoding_vector: number[];  // 512-d FaceNet embedding
  timestamp_created: string;  // ISO 8601 datetime
}
```

### Attendance (Absensi)
```typescript
{
  id: number;           // Auto-increment
  nim: string;          // Foreign key to Mahasiswa
  timestamp_absensi: string;  // ISO 8601 datetime
  confidence: number;   // Distance score (0.0 - 1.0)
}
```

---

## Face Recognition Pipeline

### Image Format
- **Input:** Base64-encoded JPEG or PNG
- **Prefix:** `data:image/jpeg;base64,` or `data:image/png;base64,`
- **Max Size:** 10MB (recommended: < 2MB for performance)

### Processing Steps
1. **Decode Base64** → bytes
2. **Preprocess:** Resize to max 640px, BGR→RGB
3. **Face Detection:** HOG detector (dlib)
4. **Feature Extraction:** FaceNet InceptionResnetV1 → 512-d embedding
5. **Liveness Check:** Temporal motion analysis (threshold: 0.02)
6. **Matching:** ChromaDB Euclidean distance search (threshold: 0.6)

### Distance Threshold
- `< 0.6` → **Match** (same person)
- `≥ 0.6` → **No Match** (different person or low quality)

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Missing required parameters |
| 404 | Not Found | Resource not found (e.g., NIM not exist) |
| 500 | Internal Server Error | Server-side error (check logs) |

---

## Rate Limiting

⚠️ **Development Mode:** No rate limiting

**Production Recommendations:**
- `/api/register/capture`: 5 requests/minute per IP
- `/api/presence/mark`: 30 requests/minute per IP
- `/api/data/students`: 60 requests/minute per IP

---

## Best Practices

### Image Capture
1. **Lighting:** Ensure good lighting (avoid shadows)
2. **Distance:** Face should occupy 30-50% of frame
3. **Angle:** Front-facing (avoid extreme angles)
4. **Quality:** Minimum 480p resolution
5. **Multiple Frames:** Capture 3-5 frames for better accuracy

### Registration
1. **Verify Student:** Ensure NIM exists before registration
2. **Multiple Poses:** Capture slight variations (head turn, smile)
3. **Quality Check:** Verify face detected in all frames
4. **Batch Upload:** Use `frames_b64[]` for efficiency

### Attendance
1. **Interval:** Don't spam requests (recommended: 2-second interval)
2. **Error Handling:** Handle "no face detected" gracefully
3. **Duplicate Prevention:** Check last attendance timestamp
4. **Confidence Display:** Show distance score to user

---

## WebSocket Support

🚧 **Coming Soon:** Real-time updates via WebSocket

**Planned Events:**
- `attendance.marked` - New attendance recorded
- `student.registered` - New face encoding added
- `system.stats` - Real-time statistics updates

---

## Changelog

### v0.2.0 (2025-12-11)
- ✅ Production face recognition pipeline (HOG + FaceNet + liveness)
- ✅ Modular page loading system
- ✅ Multiple frame registration support
- ✅ Enhanced error responses with distance scores

### v0.1.0 (2025-12-10)
- Initial scaffold with stub functions
- Basic CRUD operations
- Simple face registration (single frame)
- SQLite + ChromaDB integration

---

## Support

**Issues:** [GitHub Issues](https://github.com/LycusCoder/PresensiRupa/issues)

**Documentation:** [Full Docs](../README.md)
