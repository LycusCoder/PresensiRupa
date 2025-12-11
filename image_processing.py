import numpy as np
import cv2
import face_recognition
from facenet_pytorch import InceptionResnetV1
import torch
from PIL import Image
import io

# Load FaceNet model (pretrained on VGGFace2)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
facenet_model = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Global state for temporal liveness (blink detection)
_prev_frame_gray = None
_blink_counter = 0


def preprocess_frame(frame_bytes: bytes):
    """
    Preprocessing: Decode, resize, dan BGR->RGB conversion.
    Returns: numpy array (RGB format, HxWx3)
    """
    if frame_bytes is None or len(frame_bytes) == 0:
        return None
    # Decode bytes to numpy array
    nparr = np.frombuffer(frame_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    # Resize untuk mempercepat processing (max 640px width)
    h, w = img.shape[:2]
    if w > 640:
        scale = 640.0 / w
        new_w, new_h = 640, int(h * scale)
        img = cv2.resize(img, (new_w, new_h))
    # Convert BGR (OpenCV) -> RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return img_rgb


def detect_faces_hog(img_rgb):
    """
    Deteksi wajah menggunakan HOG (face_recognition library, backend dlib).
    Returns: list of face locations [(top, right, bottom, left), ...]
    """
    if img_rgb is None:
        return []
    face_locations = face_recognition.face_locations(img_rgb, model='hog')
    return face_locations


def extract_facenet_embedding(img_rgb, face_location):
    """
    Ekstraksi fitur 512-d menggunakan FaceNet (InceptionResnetV1).
    Args:
        img_rgb: numpy array (RGB)
        face_location: (top, right, bottom, left) tuple
    Returns: numpy array (512-d) atau None
    """
    top, right, bottom, left = face_location
    face_img = img_rgb[top:bottom, left:right]
    if face_img.size == 0:
        return None
    
    # Resize ke 160x160 (FaceNet input size)
    face_pil = Image.fromarray(face_img)
    face_pil = face_pil.resize((160, 160))
    
    # Normalize to [-1, 1]
    face_tensor = torch.tensor(np.array(face_pil)).permute(2, 0, 1).float()
    face_tensor = (face_tensor - 127.5) / 128.0
    face_tensor = face_tensor.unsqueeze(0).to(device)
    
    # Forward pass
    with torch.no_grad():
        embedding = facenet_model(face_tensor)
    
    # Convert to numpy and normalize (L2)
    embedding_np = embedding.cpu().numpy().flatten()
    embedding_np = embedding_np / np.linalg.norm(embedding_np)
    return embedding_np


def liveness_check(frame_bytes: bytes) -> dict:
    """
    Liveness detection sederhana menggunakan temporal consistency (blink/motion).
    Menggunakan perubahan intensitas grayscale antar frame sebagai indikator kehidupan.
    
    Returns: dict {"live": bool, "score": float}
    """
    global _prev_frame_gray, _blink_counter
    
    img_rgb = preprocess_frame(frame_bytes)
    if img_rgb is None:
        return {"live": False, "score": 0.0}
    
    # Convert to grayscale
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    
    # Deteksi wajah untuk region of interest
    face_locs = detect_faces_hog(img_rgb)
    if len(face_locs) == 0:
        return {"live": False, "score": 0.0}
    
    top, right, bottom, left = face_locs[0]
    face_gray = gray[top:bottom, left:right]
    
    if _prev_frame_gray is not None and _prev_frame_gray.shape == face_gray.shape:
        # Hitung perbedaan intensitas (motion/blink indicator)
        diff = cv2.absdiff(_prev_frame_gray, face_gray)
        motion_score = np.mean(diff) / 255.0
        
        # Jika ada perubahan signifikan (> 0.02), anggap ada kehidupan
        if motion_score > 0.02:
            _blink_counter += 1
        
        # Liveness threshold: minimal ada 1 perubahan dalam beberapa frame
        live = _blink_counter > 0
        score = min(motion_score * 10, 1.0)  # normalize ke [0,1]
        
        _prev_frame_gray = face_gray.copy()
        return {"live": live, "score": score}
    else:
        _prev_frame_gray = face_gray.copy()
        # Frame pertama, assume live (butuh temporal comparison)
        return {"live": True, "score": 0.5}


def get_face_encoding(frame_bytes: bytes):
    """
    Pipeline lengkap: preprocessing -> HOG detection -> FaceNet embedding.
    Returns: numpy array (512-d) atau None jika tidak ada wajah.
    """
    img_rgb = preprocess_frame(frame_bytes)
    if img_rgb is None:
        return None
    
    # Deteksi wajah dengan HOG
    face_locations = detect_faces_hog(img_rgb)
    if len(face_locations) == 0:
        return None
    
    # Ambil wajah pertama (largest area)
    face_locations = sorted(face_locations, key=lambda loc: (loc[1]-loc[3])*(loc[2]-loc[0]), reverse=True)
    face_loc = face_locations[0]
    
    # Ekstraksi embedding FaceNet
    embedding = extract_facenet_embedding(img_rgb, face_loc)
    return embedding


def get_multiple_encodings(frame_bytes: bytes, count: int = 5):
    """
    Return multiple encodings untuk augmentasi (rotasi ringan, brightness).
    Untuk simplicity, kita return embedding yang sama (atau bisa augment).
    """
    encodings = []
    base_encoding = get_face_encoding(frame_bytes)
    if base_encoding is None:
        return []
    
    # Untuk augmentasi sederhana, kita bisa tambahkan noise kecil
    for i in range(count):
        noise = np.random.normal(0, 0.01, base_encoding.shape)
        aug_encoding = base_encoding + noise
        aug_encoding = aug_encoding / np.linalg.norm(aug_encoding)
        encodings.append(aug_encoding)
    
    return encodings
