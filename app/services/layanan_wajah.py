import face_recognition
import numpy as np
import cv2
from typing import Optional, List, Tuple
from app.core.config import get_settings

settings = get_settings()


class LayananWajah:
    """
    Layanan untuk face recognition dan embedding.
    
    Fitur:
    - Hitung face embedding dari foto.
    - Buat master embedding (average dari beberapa foto).
    - Bandingkan embedding (match 2 dari 3).
    """
    
    @staticmethod
    def ekstrak_embedding(file_bytes: bytes, model: str = "hog") -> Optional[np.ndarray]:
        """
        Ekstrak face embedding dari file gambar.
        
        Args:
            file_bytes: Bytes dari file gambar.
            model: Model untuk deteksi wajah ("hog" atau "cnn").
                   "hog" lebih cepat, "cnn" lebih akurat.
        
        Returns:
            Embedding (vektor 128-dimensi) atau None jika ada error.
        """
        try:
            # Load gambar
            nparr = np.frombuffer(file_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return None
            
            # Convert BGR ke RGB (face_recognition pake RGB)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Deteksi wajah
            face_locations = face_recognition.face_locations(image_rgb, model=model)
            
            if not face_locations:
                return None
            
            # Ambil wajah pertama (yang paling besar)
            # Simplified: asumsi cuma 1 wajah per foto
            encodings = face_recognition.face_encodings(image_rgb, face_locations)
            
            if not encodings:
                return None
            
            return encodings[0]  # Return embedding pertama
            
        except Exception as e:
            print(f"Error saat ekstrak embedding: {str(e)}")
            return None
    
    @staticmethod
    def buat_master_embedding(list_file_bytes: List[bytes]) -> Optional[np.ndarray]:
        """
        Buat master embedding dari 5 file foto.
        
        Args:
            list_file_bytes: List berisi bytes dari 5 file foto.
        
        Returns:
            Master embedding (rata-rata dari 5 embedding) atau None.
        """
        embeddings = []
        
        for file_bytes in list_file_bytes:
            embedding = LayananWajah.ekstrak_embedding(file_bytes, model=settings.FACE_RECOGNITION_MODEL)
            if embedding is not None:
                embeddings.append(embedding)
        
        if not embeddings:
            return None
        
        # Hitung rata-rata embedding
        master_embedding = np.mean(embeddings, axis=0)
        
        return master_embedding
    
    @staticmethod
    def bandingkan_embedding(master_embedding: np.ndarray, test_embedding: np.ndarray) -> bool:
        """
        Bandingkan dua embedding dan return True jika cocok.
        
        Args:
            master_embedding: Master embedding yang disimpan di DB.
            test_embedding: Embedding dari foto test.
        
        Returns:
            True jika cocok (distance < threshold), False jika tidak.
        """
        # face_recognition.compare_faces pake Euclidean distance
        distance = face_recognition.face_distance([master_embedding], test_embedding)
        
        # Distance lebih kecil = lebih mirip
        # Default threshold di face_recognition adalah 0.6
        return distance[0] < settings.FACE_MATCH_THRESHOLD
    
    @staticmethod
    def cek_absen_2dari3(master_embedding: np.ndarray, list_file_bytes: List[bytes]) -> Tuple[bool, int]:
        """
        Cek 2 dari 3 foto: apakah minimal 2 foto cocok dengan master embedding.
        
        Args:
            master_embedding: Master embedding dari DB.
            list_file_bytes: List berisi bytes dari 3 file foto.
        
        Returns:
            Tuple (hasil_absen, jumlah_cocok).
            hasil_absen: True jika >= 2 cocok, False jika < 2.
            jumlah_cocok: Jumlah foto yang cocok.
        """
        jumlah_cocok = 0
        
        for file_bytes in list_file_bytes:
            test_embedding = LayananWajah.ekstrak_embedding(
                file_bytes, 
                model=settings.FACE_RECOGNITION_MODEL
            )
            
            if test_embedding is not None:
                if LayananWajah.bandingkan_embedding(master_embedding, test_embedding):
                    jumlah_cocok += 1
        
        # Return True jika >= 2 cocok
        hasil = jumlah_cocok >= 2
        
        return hasil, jumlah_cocok
