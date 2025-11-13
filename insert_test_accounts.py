#!/usr/bin/env python3
"""
Script untuk menambahkan test accounts ke database PresensiRupa.
Berguna untuk testing login, registrasi, dan fitur lainnya.

Usage:
    python insert_test_accounts.py

Accounts yang akan dibuat:
    1. admin (Admin) - username: admin, password: admin123
    2. john_doe (Karyawan IT) - username: john_doe, password: john123
    3. jane_smith (Karyawan Marketing) - username: jane_smith, password: jane123
    4. bob_wilson (Karyawan HR) - username: bob_wilson, password: bob123
    5. alice_chen (Mahasiswa) - username: alice_chen, password: alice123
"""

from sqlalchemy.orm import Session
from datetime import datetime
from app.db.database import SessionLocal, engine
from app.db.models import Pengguna, Base
from app.core.security import hash_kata_sandi

# Create tables
Base.metadata.create_all(bind=engine)

# Test data
TEST_ACCOUNTS = [
    {
        "nama_pengguna": "admin",
        "kata_sandi": "admin123",
        "nama_depan": "Admin",
        "nama_belakang": "System",
        "id_karyawan": "ADM001",
        "jabatan": "Administrator",
        "alamat_surel": "admin@presensi-rupa.com",
        "tanggal_masuk": datetime(2024, 1, 1),
        "nik": "1234567890123456",
        "catatan_admin": "System Administrator - for testing only"
    },
    {
        "nama_pengguna": "john_doe",
        "kata_sandi": "john123",
        "nama_depan": "John",
        "nama_belakang": "Doe",
        "id_karyawan": "IT001",
        "jabatan": "Software Engineer",
        "alamat_surel": "john.doe@company.com",
        "tanggal_masuk": datetime(2023, 6, 15),
        "nik": "3201234567890123",
        "catatan_admin": "Test account - IT Department"
    },
    {
        "nama_pengguna": "jane_smith",
        "kata_sandi": "jane123",
        "nama_depan": "Jane",
        "nama_belakang": "Smith",
        "id_karyawan": "MKT001",
        "jabatan": "Marketing Manager",
        "alamat_surel": "jane.smith@company.com",
        "tanggal_masuk": datetime(2023, 3, 1),
        "nik": "3201234567890124",
        "catatan_admin": "Test account - Marketing Department"
    },
    {
        "nama_pengguna": "bob_wilson",
        "kata_sandi": "bob123",
        "nama_depan": "Bob",
        "nama_belakang": "Wilson",
        "id_karyawan": "HR001",
        "jabatan": "HR Specialist",
        "alamat_surel": "bob.wilson@company.com",
        "tanggal_masuk": datetime(2022, 9, 10),
        "nik": "3201234567890125",
        "catatan_admin": "Test account - HR Department"
    },
    {
        "nama_pengguna": "alice_chen",
        "kata_sandi": "alice123",
        "nama_depan": "Alice",
        "nama_belakang": "Chen",
        "id_karyawan": "STU001",
        "jabatan": "Mahasiswa",
        "alamat_surel": "alice.chen@university.edu",
        "tanggal_masuk": datetime(2024, 9, 1),
        "nik": "3201234567890126",
        "catatan_admin": "Test account - Student"
    }
]


def insert_test_accounts():
    """Insert test accounts ke database."""
    db = SessionLocal()
    
    try:
        print("=" * 70)
        print("PresensiRupa - Test Accounts Insertion Script")
        print("=" * 70)
        print()
        
        # Check if accounts already exist
        existing = db.query(Pengguna).filter(
            Pengguna.nama_pengguna.in_([acc["nama_pengguna"] for acc in TEST_ACCOUNTS])
        ).all()
        
        if existing:
            print(f"⚠️  Found {len(existing)} existing account(s):")
            for acc in existing:
                print(f"  - {acc.nama_pengguna} ({acc.nama_depan} {acc.nama_belakang})")
            print()
            
            response = input("Apakah ingin hapus dan buat ulang? (y/n): ").strip().lower()
            if response == 'y':
                for acc in existing:
                    db.delete(acc)
                    print(f"  ✓ Deleted: {acc.nama_pengguna}")
                db.commit()
                print()
            else:
                print("❌ Pembatalan. Akun tidak ditambahkan.")
                return False
        
        # Insert test accounts
        print("📝 Menambahkan test accounts...")
        print()
        
        created_accounts = []
        for acc_data in TEST_ACCOUNTS:
            pengguna = Pengguna(
                nama_pengguna=acc_data["nama_pengguna"],
                hash_kata_sandi=hash_kata_sandi(acc_data["kata_sandi"]),
                nama_depan=acc_data["nama_depan"],
                nama_belakang=acc_data["nama_belakang"],
                id_karyawan=acc_data["id_karyawan"],
                jabatan=acc_data["jabatan"],
                alamat_surel=acc_data["alamat_surel"],
                tanggal_masuk=acc_data["tanggal_masuk"],
                nik=acc_data["nik"],
                catatan_admin=acc_data["catatan_admin"],
                status_kehadiran="Tidak Ada Data"
            )
            db.add(pengguna)
            created_accounts.append((acc_data["nama_pengguna"], acc_data["kata_sandi"]))
            print(f"  ✓ {acc_data['nama_pengguna']} - {acc_data['nama_depan']} {acc_data['nama_belakang']}")
        
        db.commit()
        
        print()
        print("✅ Test accounts berhasil ditambahkan!")
        print()
        print("=" * 70)
        print("TEST ACCOUNTS UNTUK LOGIN")
        print("=" * 70)
        print()
        print("📌 Format: username / password")
        print()
        
        for username, password in created_accounts:
            print(f"  • {username:20} / {password}")
        
        print()
        print("=" * 70)
        print("📍 Test Endpoints:")
        print("  - Frontend:  http://localhost:5173")
        print("  - Backend:   http://localhost:8000")
        print("  - API Docs:  http://localhost:8000/docs")
        print()
        print("✨ Sekarang bisa test login dengan akun-akun di atas!")
        print("=" * 70)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    insert_test_accounts()
