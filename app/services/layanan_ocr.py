import cv2
import pytesseract
import numpy as np
from PIL import Image
from io import BytesIO
from typing import Optional, Tuple


class LayananOCR:
    """
    Layanan untuk OCR dan Image Processing dari KTP/Kartu Tanda Pengenal.
    
    Fitur:
    - Perspective Transform (lurusin KTP yang miring).
    - OCR pake Tesseract.
    - Ekstrak Nama dan NIK dari hasil OCR.
    """
    
    @staticmethod
    def _preprocess_image(image_array: np.ndarray) -> np.ndarray:
        """
        Preprocessing gambar sebelum OCR.
        
        Args:
            image_array: Gambar dalam format numpy array (dari cv2.imread atau PIL).
        
        Returns:
            Gambar yang sudah di-preprocess.
        """
        # Convert ke grayscale
        gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
        
        # Blur sedikit biar lebih smooth
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Thresholding biar kontras meningkat
        _, thresh = cv2.threshold(blurred, 150, 255, cv2.THRESH_BINARY)
        
        return thresh
    
    @staticmethod
    def _find_document_contour(image_array: np.ndarray) -> Optional[np.ndarray]:
        """
        Cari kontur dokumen (KTP) di dalam gambar.
        
        Args:
            image_array: Gambar input.
        
        Returns:
            Kontur terbesar yang ditemukan (atau None kalo gak ada).
        """
        gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Deteksi edge
        edges = cv2.Canny(blurred, 100, 200)
        
        # Cari contour
        contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        # Ambil contour terbesar
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Filter: hanya ambil contour dengan area cukup besar (untuk filter noise)
        if cv2.contourArea(largest_contour) < 10000:  # Adjust threshold sesuai kebutuhan
            return None
        
        return largest_contour
    
    @staticmethod
    def _perspective_transform(image_array: np.ndarray, contour: np.ndarray) -> np.ndarray:
        """
        Aplikasikan perspective transform ke gambar berdasarkan contour.
        
        Args:
            image_array: Gambar input.
            contour: Contour yang menjadi target transform.
        
        Returns:
            Gambar yang sudah di-transform (di-lurusin).
        """
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        
        if len(approx) != 4:
            # Kalo bukan rectangle, return gambar asli
            return image_array
        
        # Dapatkan koordinat 4 sudut
        pts = approx.reshape(4, 2)
        rect = np.zeros((4, 2), dtype="float32")
        
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]  # top-left
        rect[2] = pts[np.argmax(s)]  # bottom-right
        
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]  # top-right
        rect[3] = pts[np.argmax(diff)]  # bottom-left
        
        # Hitung dimensi baru
        (tl, tr, br, bl) = rect
        width_a = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        width_b = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        max_width = max(int(width_a), int(width_b))
        
        height_a = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        height_b = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        max_height = max(int(height_a), int(height_b))
        
        dst = np.array([
            [0, 0],
            [max_width - 1, 0],
            [max_width - 1, max_height - 1],
            [0, max_height - 1]
        ], dtype="float32")
        
        # Hitung matrix dan transform
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image_array, M, (max_width, max_height))
        
        return warped
    
    @staticmethod
    def lurusin_dan_ocr(file_bytes: bytes) -> Tuple[Optional[dict], Optional[str]]:
        """
        Lurusin KTP dan jalankan OCR.
        
        Args:
            file_bytes: Bytes dari file gambar KTP.
        
        Returns:
            Tuple (hasil_ocr_dict, error_message).
            hasil_ocr_dict: Dict dengan key "nama_lengkap" dan "nik".
            error_message: String error jika ada masalah.
        """
        try:
            # Baca bytes menjadi numpy array
            nparr = np.frombuffer(file_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return None, "Gagal membaca file gambar"
            
            # Cari contour dokumen
            contour = LayananOCR._find_document_contour(image)
            if contour is not None:
                image = LayananOCR._perspective_transform(image, contour)
            
            # Preprocess
            processed = LayananOCR._preprocess_image(image)
            
            # OCR pake Tesseract
            # Note: Pastikan Tesseract sudah di-install di system
            # Di Linux: sudo apt-get install tesseract-ocr
            # Di macOS: brew install tesseract
            # Di Windows: download dari https://github.com/UB-Mannheim/tesseract/wiki
            text = pytesseract.image_to_string(processed, lang='ind')  # 'ind' untuk Bahasa Indonesia
            
            # Parse hasil OCR (ini simplified, dalam production mungkin butuh parsing lebih kompleks)
            lines = text.split('\n')
            
            hasil = {
                "nama_lengkap": "",
                "nik": ""
            }
            
            # Simple pattern matching untuk cari NIK (16 digit)
            for line in lines:
                # Cari string dengan 16 digit (NIK)
                import re
                nik_match = re.search(r'\d{16}', line)
                if nik_match:
                    hasil["nik"] = nik_match.group()
                    break
            
            # Ambil baris pertama / kedua sebagai nama (simplified)
            for i, line in enumerate(lines):
                line = line.strip()
                if len(line) > 3 and not line.isdigit():
                    hasil["nama_lengkap"] = line
                    break
            
            return hasil, None
            
        except Exception as e:
            return None, f"Error saat OCR: {str(e)}"
