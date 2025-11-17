from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db.database import engine, Base
from app.db.models import Pengguna, LogAbsensi  # Import models biar Base.metadata tahu
from app.api import autentikasi, profil, absensi

# Settings
settings = get_settings()

# Bikin tables kalau belum ada
Base.metadata.create_all(bind=engine)

# Inisialisasi FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Attendance System menggunakan Face Recognition"
)

# CORS middleware (biar frontend bisa akses)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dalam production, ubah ke domain spesifik
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Register routers
app.include_router(autentikasi.router)
app.include_router(profil.router)
app.include_router(absensi.router)


@app.get("/")
async def root():
    """
    Root endpoint. Simple health check.
    """
    return {
        "nama_aplikasi": settings.APP_NAME,
        "versi": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "timestamp": str(__import__('datetime').datetime.now())
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.DEBUG
    )
