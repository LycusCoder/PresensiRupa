# 🏗️ Smart Presence - Architecture Documentation

## System Overview

Smart Presence adalah sistem absensi berbasis pengenalan wajah dengan arsitektur modular yang memisahkan backend (Flask), face recognition pipeline, vector database (ChromaDB), dan frontend (modular JavaScript).

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Browser)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ index.html   │  │  pages.js    │  │   app.js     │     │
│  │ (Shell)      │◄─┤ (Page Loader)│◄─┤ (Logic)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                           │                                  │
│                      HTTP/REST API                           │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                      Backend (Flask)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                      app.py                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │ │
│  │  │ API Routes   │  │ Image        │  │ Chroma     │  │ │
│  │  │ /api/*       │──┤ Processing   │──┤ Client     │  │ │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │         │                        │
│              ┌────────────┴─────┐   │                        │
│              │                  │   │                        │
│    ┌─────────▼────────┐ ┌──────▼───▼──────┐                │
│    │  SQLite DB       │ │  ChromaDB        │                │
│    │  ┌────────────┐  │ │  ┌────────────┐ │                │
│    │  │ Mahasiswa  │  │ │  │ Embeddings │ │                │
│    │  │ Encoding   │  │ │  │ (512-d)    │ │                │
│    │  │ Absensi    │  │ │  └────────────┘ │                │
│    │  └────────────┘  │ └─────────────────┘                │
│    └──────────────────┘                                      │
└───────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│              Face Recognition Pipeline                        │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │ Preprocess│─→│ HOG       │─→│ FaceNet   │─→│ Liveness │ │
│  │ (OpenCV)  │  │ Detection │  │ Embedding │  │ Check    │ │
│  └───────────┘  └───────────┘  └───────────┘  └──────────┘ │
│                      (dlib)       (PyTorch)                   │
└───────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Frontend Layer

#### **index.html** (Layout Shell)
- Minimal HTML dengan header, sidebar navigation, dan `#page-container`
- Tidak ada Alpine.js (dihapus karena timing issues)
- Vanilla JavaScript untuk event handling

**Key Elements:**
```html
<main id="page-container">
  <!-- Page components loaded dynamically here -->
</main>
```

#### **pages.js** (Page Loader)
Mengelola loading dan initialization page components secara dinamis.

**Key Class:**
```javascript
class PageLoader {
  async loadPage(pageName) {
    // 1. Fetch HTML dari /static/pages/{pageName}.html
    // 2. Cache untuk performance
    // 3. Inject ke #page-container
    // 4. Update navigation active state
    // 5. Call page-specific initialization
  }
}
```

**Page Components:**
- `registrasi.html` - Form registrasi wajah + dropdown mahasiswa
- `data.html` - Tabel data mahasiswa
- `dashboard.html` - Dashboard statistik
- `laporan.html` - Filter dan preview laporan

**Initialization Functions:**
- `initRegistrasiPage()` - Load dropdown, attach capture handlers
- `initDataPage()` - Render student table
- `initDashboardPage()` - Load statistics
- `initLaporanPage()` - Setup filters

#### **app.js** (Application Logic)
- Webcam management
- Frame capture & upload
- Real-time presence detection
- Admin panel logic

---

### 2. Backend Layer

#### **app.py** (Flask Application)

**Core Routes:**

1. **Static Pages**
```python
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/static/pages/<path:filename>")
def serve_page(filename):
    return send_from_directory("interface/templates/pages", filename)
```

2. **Student API**
```python
@app.route('/api/data/students', methods=['GET'])
def get_students():
    # Query all students with encoding status
    # Returns: [{ nim, nama, semester, kelas, has_encoding, ... }]
```

3. **Face Registration**
```python
@app.route("/api/register/capture", methods=["POST"])
def register_capture():
    # Accept frames_b64 (list) or single frame_b64
    # For each frame:
    #   1. Decode base64 → bytes
    #   2. Preprocess frame
    #   3. Detect faces (HOG)
    #   4. Extract FaceNet embedding (512-d)
    #   5. Check liveness
    #   6. Store in SQLite + ChromaDB
```

4. **Attendance Marking**
```python
@app.route("/api/presence/mark", methods=["POST"])
def mark_presence():
    # 1. Get frame_b64 from request
    # 2. Extract face encoding
    # 3. Query ChromaDB (Euclidean distance)
    # 4. Validate match (threshold 0.6)
    # 5. Record attendance if match found
```

**Database Models:**

```python
# models.py
class Mahasiswa(Base):
    nim = Column(String, primary_key=True)
    nama = Column(String, nullable=False)
    semester = Column(String)
    kelas = Column(String)
    jurusan = Column(String)
    photo_path = Column(String)
    timestamp_registrasi = Column(DateTime)

class Encoding(Base):
    id = Column(Integer, primary_key=True)
    nim = Column(String, ForeignKey('tb_mahasiswa.nim'))
    encoding_vector = Column(PickleType)  # 512-d numpy array
    timestamp_created = Column(DateTime)

class Absensi(Base):
    id = Column(Integer, primary_key=True)
    nim = Column(String, ForeignKey('tb_mahasiswa.nim'))
    timestamp_absensi = Column(DateTime)
    confidence = Column(Float)  # Distance score
```

---

### 3. Face Recognition Pipeline

#### **image_processing.py**

**Pipeline Flow:**
```
Frame Bytes → Preprocess → Face Detection → Feature Extraction → Liveness Check
```

**1. Preprocessing**
```python
def preprocess_frame(frame_bytes: bytes) -> np.ndarray:
    # Decode bytes → numpy array
    # Resize to max 640px (maintain aspect ratio)
    # Convert BGR → RGB
    return frame_rgb
```

**2. Face Detection (HOG)**
```python
def detect_faces_hog(frame: np.ndarray) -> List[Tuple]:
    # Uses dlib HOG detector via face_recognition
    # Returns: [(top, right, bottom, left), ...]
    face_locations = face_recognition.face_locations(frame, model='hog')
    return face_locations
```

**3. Feature Extraction (FaceNet)**
```python
def extract_facenet_embedding(frame: np.ndarray, face_location: Tuple) -> np.ndarray:
    # 1. Crop face from frame using location
    # 2. Resize to 160x160 (FaceNet input size)
    # 3. Normalize pixel values to [-1, 1]
    # 4. Convert to torch tensor
    # 5. Forward pass through InceptionResnetV1
    # 6. L2 normalize output → 512-d unit vector
    
    model = InceptionResnetV1(pretrained='vggface2').eval()
    embedding = model(face_tensor)
    return F.normalize(embedding, p=2, dim=1).detach().numpy()[0]
```

**4. Liveness Detection**
```python
def liveness_check(current_frame: np.ndarray, prev_frame: np.ndarray) -> bool:
    # 1. Convert both frames to grayscale
    # 2. Calculate absolute difference
    # 3. Compute motion score (mean of diff)
    # 4. Return True if score > 0.02 (indicates movement/blink)
    
    diff = cv2.absdiff(gray_current, gray_prev)
    motion_score = np.mean(diff) / 255.0
    return motion_score > 0.02
```

**5. Complete Pipeline**
```python
def get_face_encoding(frame_bytes: bytes) -> Optional[np.ndarray]:
    frame = preprocess_frame(frame_bytes)
    faces = detect_faces_hog(frame)
    
    if len(faces) == 0:
        return None
    
    # Take first detected face
    embedding = extract_facenet_embedding(frame, faces[0])
    return embedding  # 512-d numpy array
```

---

### 4. Vector Database Layer

#### **chroma_client.py**

**ChromaDB Integration:**
```python
class ChromaFaceClient:
    def __init__(self):
        self.client = chromadb.PersistentClient(path="./chroma_embeddings")
        self.collection = self.client.get_or_create_collection(
            name="face_encodings",
            metadata={"hnsw:space": "l2"}  # Euclidean distance
        )
    
    def add_encoding(self, nim: str, embedding: np.ndarray):
        # Store 512-d embedding with NIM as ID
        self.collection.add(
            embeddings=[embedding.tolist()],
            ids=[f"{nim}_{timestamp}"],
            metadatas=[{"nim": nim}]
        )
    
    def search_encoding(self, query_embedding: np.ndarray, threshold=0.6):
        # Query using Euclidean distance
        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=1
        )
        
        if results['distances'][0][0] < threshold:
            return results['metadatas'][0][0]['nim']
        return None
```

**Distance Threshold:**
- `< 0.6` → Match (same person)
- `≥ 0.6` → No match (different person or low quality)

---

## Data Flow

### Registration Flow

```
User selects student from dropdown
    ↓
Click "Mulai Capture Wajah (5)"
    ↓
Webcam captures 5 frames
    ↓
Frames → base64 encoding
    ↓
POST /api/register/capture { nim, frames_b64[] }
    ↓
Backend processes each frame:
  1. Decode base64 → bytes
  2. Preprocess (resize, BGR→RGB)
  3. Detect face (HOG)
  4. Extract embedding (FaceNet 512-d)
  5. Check liveness (temporal diff)
    ↓
Store in databases:
  - SQLite: Encoding table (nim, vector, timestamp)
  - ChromaDB: Vector with metadata
    ↓
Response: { ok: true, added: 5 }
```

### Attendance Flow

```
User clicks "Aktifkan Absensi"
    ↓
Webcam starts streaming
    ↓
Every 2 seconds:
  Capture frame → base64
    ↓
POST /api/presence/mark { frame_b64 }
    ↓
Backend processes frame:
  1. Decode & preprocess
  2. Detect face (HOG)
  3. Extract embedding (FaceNet 512-d)
    ↓
Query ChromaDB:
  - Search nearest neighbor (L2 distance)
  - If distance < 0.6 → Match found
    ↓
Record attendance:
  - Insert to tb_absensi (nim, timestamp, confidence)
    ↓
Response: { ok: true, nim, nama, distance }
    ↓
Frontend displays result
```

---

## Performance Considerations

### 1. **Page Loading**
- **Caching**: HTML pages cached in `PageLoader.pageCache`
- **Lazy Loading**: Pages loaded on-demand, not upfront
- **DOM Injection**: `innerHTML` untuk speed

### 2. **Face Recognition**
- **Preprocessing**: Resize to max 640px untuk speed vs accuracy balance
- **HOG vs CNN**: HOG lebih cepat (CPU-friendly), CNN lebih akurat (GPU)
- **Embedding Size**: 512-d optimal untuk balance antara accuracy & storage

### 3. **Database**
- **ChromaDB**: In-memory index dengan persistent storage
- **SQLite**: Single-file database untuk simplicity
- **Batch Operations**: Multi-frame registration dalam single transaction

### 4. **Network**
- **Base64 Encoding**: Efficient untuk image transfer via JSON
- **Compression**: Consider JPEG compression untuk frames (quality 85%)

---

## Security Considerations

⚠️ **Current Implementation**: Development mode only

**Production Requirements:**
1. **HTTPS**: SSL/TLS untuk encrypt traffic
2. **Authentication**: JWT tokens untuk API access
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Prevent brute-force attacks
5. **CORS**: Restrict allowed origins
6. **Admin Panel**: Strong password hashing (bcrypt)
7. **Face Spoofing**: Enhanced liveness detection (eye blink, head turn)

---

## Scalability

### Current Limitations
- **SQLite**: Single-file database, not suitable for high concurrency
- **Flask Dev Server**: Single-threaded, max ~100 requests/sec
- **ChromaDB**: In-memory, limited by RAM

### Production Recommendations
1. **Database**: Migrate to PostgreSQL + pgvector
2. **Web Server**: Gunicorn + Nginx
3. **Caching**: Redis untuk session & query cache
4. **CDN**: Serve static assets dari CDN
5. **Load Balancing**: Multiple Flask instances behind load balancer
6. **GPU**: CUDA-enabled server untuk faster inference
7. **Microservices**: Separate face recognition service (async queue)

---

## Monitoring & Logging

### Current Logging
- **Console Logs**: Extensive logging untuk debugging
- **Flask Logs**: Request/response logs

### Production Monitoring
- **Application Logs**: Structured logging (JSON format)
- **Performance Metrics**: Response time, throughput
- **Error Tracking**: Sentry atau equivalent
- **Database Monitoring**: Query performance, connection pool
- **Alerting**: Anomaly detection untuk failed recognition attempts

---

## Testing Strategy

### Unit Tests
```python
# test_image_processing.py
def test_preprocess_frame():
    assert preprocess_frame(sample_bytes).shape == (480, 640, 3)

def test_face_detection():
    faces = detect_faces_hog(sample_frame)
    assert len(faces) > 0

def test_embedding_dimension():
    embedding = extract_facenet_embedding(frame, face_loc)
    assert embedding.shape == (512,)
```

### Integration Tests
```python
# test_api.py
def test_register_capture():
    response = client.post('/api/register/capture', json={
        'nim': '24225046',
        'frames_b64': [base64_frame1, base64_frame2]
    })
    assert response.status_code == 200
```

### E2E Tests
- Selenium untuk test full registration & attendance flow
- Mock webcam dengan pre-recorded images

---

## Future Enhancements

1. **Multi-Face Detection**: Handle multiple people in single frame
2. **Face Quality Score**: Reject low-quality images
3. **Anti-Spoofing**: Photo/video attack detection
4. **Face Mask Detection**: Handle masked faces (COVID-era)
5. **Mobile App**: Native Android/iOS app
6. **Offline Mode**: PWA dengan service workers
7. **Real-time Notifications**: WebSocket untuk live updates
8. **Analytics Dashboard**: Attendance trends, patterns
9. **Export Reports**: Excel, CSV, PDF generation
10. **Multi-tenant**: Support multiple organizations

---

## References

- **dlib**: http://dlib.net/
- **face_recognition**: https://github.com/ageitgey/face_recognition
- **FaceNet Paper**: https://arxiv.org/abs/1503.03832
- **ChromaDB Docs**: https://docs.trychroma.com/
- **Flask Documentation**: https://flask.palletsprojects.com/
