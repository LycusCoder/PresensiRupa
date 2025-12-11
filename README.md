# 🐻 Smart Presence - Sistem Absensi Berbasis Pengenalan Wajah

**Universitas Harkat Negeri**

Sistem absensi otomatis menggunakan teknologi face recognition dengan pipeline production-ready:
- **HOG Face Detection** (dlib)
- **FaceNet Embeddings** (InceptionResnetV1, 512-d)
- **Liveness Detection** (temporal motion analysis)
- **ChromaDB** untuk vector similarity search
- **Modern Web UI** dengan modular page loading

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Windows PowerShell
- Webcam (untuk capture & absensi real-time)

### Installation

```powershell
# 1. Clone repository
git clone https://github.com/LycusCoder/PresensiRupa.git
cd PresensiRupa

# 2. Create virtual environment
python -m venv .venv

# 3. Activate virtual environment
.\.venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt
```

### Running the Application

```powershell
# Activate venv (if not already)
.\.venv\Scripts\Activate.ps1

# Run Flask server
python run_flask.py

# Open browser
# http://127.0.0.1:5000
```

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Flask (web framework)
- SQLAlchemy (ORM)
- SQLite (database)
- ChromaDB (vector database)

**Face Recognition Pipeline:**
- `dlib 20.0.0` - HOG face detector
- `face_recognition 1.3.0` - Face detection wrapper
- `facenet-pytorch 2.6.0` - FaceNet embeddings (512-d)
- `torch 2.2.2` - PyTorch backend
- `opencv-python 4.11.0` - Image preprocessing

**Frontend:**
- Vanilla JavaScript (modular page loader)
- Tailwind CSS
- Font Awesome icons

### Project Structure

```
PresensiRupa/
├── app.py                      # Flask application & API endpoints
├── run_flask.py               # Flask runner script
├── models.py                  # SQLAlchemy models (Mahasiswa, Encoding, Absensi)
├── chroma_client.py           # ChromaDB wrapper for vector search
├── image_processing.py        # Face recognition pipeline (HOG + FaceNet + liveness)
├── requirements.txt           # Python dependencies
├── smart_presence.db          # SQLite database
├── chroma_embeddings/         # ChromaDB storage
├── interface/
│   ├── templates/
│   │   ├── index.html        # Main layout shell
│   │   ├── admin.html        # Admin panel untuk CRUD mahasiswa
│   │   └── pages/            # Modular page components
│   │       ├── registrasi.html   # Face registration form
│   │       ├── data.html         # Student data table
│   │       ├── dashboard.html    # Statistics dashboard
│   │       └── laporan.html      # Attendance reports
│   └── static/
│       ├── js/
│       │   ├── pages.js      # Page loader & initialization
│       │   └── app.js        # Main application logic
│       └── css/
│           └── tailwind.css  # Tailwind CSS
└── docs/                      # Documentation
    ├── ARCHITECTURE.md
    ├── API.md
    └── FACE_RECOGNITION.md
```

---

## 🎯 Features

### ✅ Implemented

1. **Face Registration**
   - Dropdown mahasiswa (filtered: belum ada face data)
   - Multi-frame capture (5 poses)
   - Real-time liveness detection
   - 512-d FaceNet embeddings
   - ChromaDB vector storage

2. **Attendance System**
   - Live webcam stream
   - HOG face detection
   - FaceNet feature extraction
   - Euclidean distance matching (threshold: 0.6)
   - Auto-record attendance to database

3. **Data Management**
   - Student CRUD (admin panel)
   - Encoding management
   - Attendance history

4. **Modern UI**
   - Modular page loading (no page reload)
   - Responsive design (Tailwind CSS)
   - Real-time status updates
   - Activity logs

### 🚧 In Progress

- Data Mahasiswa table rendering (timing issue being fixed)
- Dashboard analytics & charts
- Report generation & export (PDF)

---

## 📚 API Endpoints

### Student Management
- `GET /api/data/students` - Get all students with encoding status
- `POST /api/admin/student` - Create new student
- `PUT /api/admin/student/<nim>` - Update student
- `DELETE /api/admin/student/<nim>` - Delete student

### Face Registration
- `POST /api/register/capture` - Upload face frames & create encodings
  ```json
  {
    "nim": "24225046",
    "frames_b64": ["base64_frame1", "base64_frame2", ...]
  }
  ```

### Attendance
- `POST /api/presence/mark` - Mark attendance with face frame
  ```json
  {
    "frame_b64": "base64_encoded_image"
  }
  ```

### Admin
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Get system statistics

**Full API documentation:** [docs/API.md](docs/API.md)

---

## 🔬 Face Recognition Pipeline

### 1. Preprocessing
```python
# Resize frame (max 640px), convert BGR → RGB
frame = preprocess_frame(frame_bytes)
```

### 2. Face Detection (HOG)
```python
# dlib HOG detector via face_recognition library
faces = detect_faces_hog(frame)
```

### 3. Feature Extraction (FaceNet)
```python
# InceptionResnetV1 (VGGFace2 pretrained)
# Crop face → 160x160 → normalize [-1,1] → forward pass → L2 normalize
embedding = extract_facenet_embedding(frame, face_location)  # 512-d vector
```

### 4. Liveness Detection
```python
# Temporal grayscale difference, motion threshold 0.02
is_live = liveness_check(frame, prev_frame)
```

### 5. Matching (ChromaDB)
```python
# Euclidean distance search, threshold 0.6
results = chroma_collection.query(query_embeddings=[embedding], n_results=1)
```

**Detailed documentation:** [docs/FACE_RECOGNITION.md](docs/FACE_RECOGNITION.md)

---

## 🛠️ Development

### Adding New Pages

1. Create HTML file in `interface/templates/pages/`:
```html
<!-- example.html -->
<section id="page-example" class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
  <h3>New Page</h3>
  <!-- content -->
</section>
```

2. Add initialization function in `interface/static/js/pages.js`:
```javascript
function initExamplePage() {
  console.log('[Example] Initializing page');
  // setup logic
}
```

3. Update `PageLoader.initializePage()`:
```javascript
case 'example':
  initExamplePage();
  break;
```

4. Add nav button in `index.html`:
```html
<button onclick="pageLoader.loadPage('example')" id="nav-example" class="nav-btn">
  <i class="fas fa-icon"></i>
  New Page
</button>
```

---

## 🐛 Known Issues

1. **Data Mahasiswa table rendering** - Timing issue dengan DOM injection (fix in progress)
2. **Browser cache** - Use Ctrl+Shift+R untuk hard refresh saat development

---

## 📝 Notes

- **Development Server**: Flask debug mode, **NOT for production**
- **Admin Credentials**: Set via env vars `SP_ADMIN_USER`, `SP_ADMIN_PASS` (default: admin/adminpass)
- **Face Recognition**: Requires good lighting & webcam quality for best accuracy
- **Database**: SQLite untuk development, migrate ke PostgreSQL untuk production

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

Project untuk keperluan akademik - Universitas Harkat Negeri

---

## 👥 Authors

**Team Smart Presence**
- Muhammad Affif (24225046)

---

## 🙏 Acknowledgments

- dlib & face_recognition by Adam Geitgey
- FaceNet implementation by timesler (facenet-pytorch)
- ChromaDB team
- Flask & SQLAlchemy communities
