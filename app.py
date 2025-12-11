import base64
import json
from datetime import date, datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from sqlalchemy.orm import sessionmaker

from models import init_db, SessionLocal, Mahasiswa, Encoding, Absensi
from chroma_client import ChromaClient
import image_processing as ip

app = Flask(__name__, template_folder="interface/templates", static_folder="interface/static")


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/static/pages/<path:filename>")
def serve_page(filename):
    """Serve page components dari folder templates/pages"""
    return send_from_directory('interface/templates/pages', filename)

# init db
init_db()

# Chroma client (local or real)
chroma = ChromaClient(collection_name="smart_presence")

# simple in-memory admin token store
import uuid, time
ADMIN_TOKENS = {}  # token -> expiry
ADMIN_TTL = 60 * 60  # 1 hour

from functools import wraps

def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.headers.get('X-Admin-Token') or request.args.get('admin_token')
        if not token:
            return jsonify({'ok': False, 'message': 'admin token required'}), 401
        exp = ADMIN_TOKENS.get(token)
        if not exp or exp < time.time():
            return jsonify({'ok': False, 'message': 'invalid or expired token'}), 403
        return fn(*args, **kwargs)
    return wrapper


@app.route("/api/register/data", methods=["POST"])
def register_data():
    data = request.get_json()
    if not data:
        return jsonify({"ok": False, "message": "JSON body required"}), 400
    required = ["nim", "nama"]
    for r in required:
        if r not in data:
            return jsonify({"ok": False, "message": f"{r} required"}), 400

    db = SessionLocal()
    existing = db.query(Mahasiswa).filter_by(nim=data["nim"]).first()
    if existing:
        return jsonify({"ok": False, "message": "NIM already registered"}), 409

    m = Mahasiswa(nim=data["nim"], nama=data.get("nama"), semester=data.get("semester"), kelas=data.get("kelas"), jurusan=data.get("jurusan"))
    db.add(m)
    db.commit()
    db.close()
    return jsonify({"ok": True, "message": "Data cached, ready for capture", "nim": data["nim"]}), 201


@app.route("/api/register/capture", methods=["POST"])
def register_capture():
    # Accept either multipart form with file or base64 frame + nim
    nim = request.form.get("nim") or (request.json or {}).get("nim")
    if not nim:
        return jsonify({"ok": False, "message": "nim required"}), 400

    # Accept either a single frame (frame_b64) or multiple frames (frames_b64 list)
    payload = request.get_json() or {}
    frames = []
    if "frames_b64" in payload and isinstance(payload["frames_b64"], list):
        frames = payload["frames_b64"]
    else:
        b64 = payload.get("frame_b64") or request.form.get("frame_b64")
        if b64:
            frames = [b64]

    if not frames:
        return jsonify({"ok": False, "message": "frame_b64 or frames_b64 required"}), 400

    db = SessionLocal()
    student = db.query(Mahasiswa).filter_by(nim=nim).first()
    if not student:
        db.close()
        return jsonify({"ok": False, "message": "nim not found, register data first"}), 404

    added = 0
    for b64 in frames:
        try:
            frame_bytes = base64.b64decode(b64)
        except Exception:
            continue
        vec = ip.get_face_encoding(frame_bytes)
        if vec is None:
            continue
        e = Encoding(nim=nim, vector=json.dumps([float(x) for x in vec]), model="stub-128d")
        db.add(e)
        db.commit()
        chroma.add(id=str(e.id), vector=list(vec), metadata={"nim": nim, "nama": student.nama})
        added += 1

    db.close()
    return jsonify({"ok": True, "nim": nim, "encodings_added": added})


@app.route('/api/check-nim/<nim>', methods=['GET'])
def check_nim(nim):
    """Check whether a NIM is already registered."""
    db = SessionLocal()
    student = db.query(Mahasiswa).filter_by(nim=nim).first()
    db.close()
    return jsonify({"exists": bool(student)})


@app.route('/api/data/students', methods=['GET'])
def get_students():
    try:
        db = SessionLocal()
        rows = db.query(Mahasiswa).order_by(Mahasiswa.nama).all()
        out = []
        for r in rows:
            enc_count = db.query(Encoding).filter_by(nim=r.nim).count()
            out.append({
                'nim': r.nim,
                'nama': r.nama,
                'semester': getattr(r, 'semester', ''),
                'kelas': r.kelas,
                'jurusan': r.jurusan,
                'photo_path': r.photo_path,
                'has_encoding': enc_count > 0,
                'encodings_count': enc_count,
                'timestamp_registrasi': r.timestamp_registrasi.isoformat() if r.timestamp_registrasi else None,
            })
        db.close()
        return jsonify(out)
    except Exception as e:
        import traceback
        print('ERROR /api/data/students:', traceback.format_exc())
        return jsonify({'ok': False, 'message': 'Server error', 'error': str(e)}), 500


import os

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    user = data.get('username')
    pwd = data.get('password')
    ADMIN_USER = os.environ.get('SP_ADMIN_USER', 'admin')
    ADMIN_PASS = os.environ.get('SP_ADMIN_PASS', 'adminpass')
    if user == ADMIN_USER and pwd == ADMIN_PASS:
        token = str(uuid.uuid4())
        ADMIN_TOKENS[token] = time.time() + ADMIN_TTL
        return jsonify({'ok': True, 'token': token, 'ttl': ADMIN_TTL})
    return jsonify({'ok': False, 'message': 'invalid credentials'}), 401


@app.route('/admin/docs', methods=['GET'])
@require_admin
def admin_docs():
    docs = {
        'endpoints': [
            {'path': '/api/register/data', 'method': 'POST', 'desc': 'Create student'},
            {'path': '/api/register/capture', 'method': 'POST', 'desc': 'Upload face frames for student (frames_b64 array)'},
            {'path': '/api/presence/stream', 'method': 'POST', 'desc': 'Send frame for recognition'},
            {'path': '/api/data/students', 'method': 'GET', 'desc': 'List students'},
            {'path': '/api/data/attendance', 'method': 'GET', 'desc': 'Recent attendance'},
        ]
    }
    return jsonify(docs)


@app.route('/admin', methods=['GET'])
def admin_page():
    return render_template('admin.html')


@app.route('/api/data/attendance', methods=['GET'])
def get_attendance():
    """Return recent attendance records. Query param: limit"""
    limit = int(request.args.get('limit', 5))
    db = SessionLocal()
    rows = db.query(Absensi).order_by(Absensi.waktu_masuk.desc()).limit(limit).all()
    out = []
    for r in rows:
        # try to get student name
        s = db.query(Mahasiswa).filter_by(nim=r.nim).first()
        out.append({
            'nim': r.nim,
            'nama': s.nama if s else None,
            'waktu_masuk': r.waktu_masuk.isoformat() if r.waktu_masuk else None,
            'tanggal': r.tanggal.isoformat() if r.tanggal else None,
            'status': r.status,
            'source': r.source,
        })
    db.close()
    return jsonify(out)


@app.route("/api/presence/stream", methods=["POST"])
def presence_stream():
    payload = request.get_json() or {}
    frame_b64 = payload.get("frame_b64")
    if not frame_b64:
        return jsonify({"ok": False, "message": "frame_b64 required"}), 400

    frame = base64.b64decode(frame_b64)

    # Liveness check
    live_score = ip.liveness_check(frame)
    if not live_score["live"]:
        return jsonify({"ok": False, "reason": "liveness_failed", "score": live_score}), 403

    # get encoding
    vec = ip.get_face_encoding(frame)
    if vec is None:
        return jsonify({"ok": False, "message": "no face detected"}), 404

    # query chroma for nearest
    res = chroma.query(vector=list(vec), n_results=3)
    # res -> list of dicts with id, distance, metadata
    if not res:
        return jsonify({"ok": False, "message": "no match"}), 404

    best = res[0]
    distance = best.get("distance", 1.0)
    THRESH = 0.6
    if distance > THRESH:
        return jsonify({"ok": False, "message": "no match within threshold", "distance": distance}), 404

    nim = best.get("metadata", {}).get("nim")
    # record attendance (if not already recorded for today)
    db = SessionLocal()
    today = date.today()
    existing = db.query(Absensi).filter_by(nim=nim, tanggal=today).first()
    if not existing:
        a = Absensi(nim=nim, tanggal=today, waktu_masuk=datetime.now(), status="hadir", source="webcam")
        db.add(a)
        db.commit()
    db.close()

    return jsonify({"ok": True, "nim": nim, "distance": distance, "message": "Kehadiran tercatat"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
