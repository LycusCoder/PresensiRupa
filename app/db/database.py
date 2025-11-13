from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import get_settings

settings = get_settings()

# Bikin engine (koneksi ke database)
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # Ini khusus SQLite
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class untuk semua models
Base = declarative_base()


def get_db():
    """
    Dependency buat dapetin DB session di setiap endpoint.
    
    Usage di endpoint:
        @app.post("/...")
        def create_something(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
