import os
import json
from datetime import datetime, date
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Date, Text
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.environ.get("SP_DB_PATH") or os.path.join(BASE_DIR, "smart_presence.db")
DB_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Mahasiswa(Base):
    __tablename__ = "tb_mahasiswa"
    nim = Column(String, primary_key=True, index=True)
    nama = Column(String, nullable=False)
    semester = Column(String)
    kelas = Column(String)
    jurusan = Column(String)
    photo_path = Column(String)
    timestamp_registrasi = Column(DateTime, default=datetime.utcnow)


class Encoding(Base):
    __tablename__ = "tb_encoding"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nim = Column(String, nullable=False, index=True)
    vector = Column(Text)  # store JSON array
    model = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class Absensi(Base):
    __tablename__ = "tb_absensi"
    id_absensi = Column(Integer, primary_key=True, autoincrement=True)
    nim = Column(String, nullable=False, index=True)
    tanggal = Column(Date, nullable=False)
    waktu_masuk = Column(DateTime)
    waktu_keluar = Column(DateTime, nullable=True)
    status = Column(String)
    source = Column(String)


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True) if os.path.dirname(DB_PATH) else None
    Base.metadata.create_all(bind=engine)
