from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Konfigurasi aplikasi PresensiRupa."""
    
    # Database
    DATABASE_URL: str = "sqlite:///./presensi_rupa.db"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-key-lycus-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 jam
    
    # App
    DEBUG: bool = True
    APP_NAME: str = "PresensiRupa"
    APP_VERSION: str = "1.0.0"
    
    # Face Recognition
    FACE_RECOGNITION_MODEL: str = "hog"  # "hog" atau "cnn" (cnn lebih akurat tapi butuh GPU)
    FACE_MATCH_THRESHOLD: float = 0.6
    PHOTO_EMBEDDING_COUNT: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Cache settings agar nggak di-load berulang kali.
    Gampang buat testing juga.
    """
    return Settings()
