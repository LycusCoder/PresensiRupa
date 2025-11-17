# 🚀 Quick Start - After Updates

## Sekarang Sudah Siap!

Semua startup scripts sudah diupdate dengan:
- ✅ Python 3.11 version checking (hanya jika buat venv baru)
- ✅ Smart venv detection (skip check kalau sudah ada)
- ✅ Smart dependency checking (install hanya jika belum ada)
- ✅ Fast startup untuk repeated runs

---

## 🎯 Cara Pakai

### Linux/macOS

```bash
# Pertama kali
./dev.sh        # Akan check Python, create venv, install deps
# Time: ~45 seconds

# Kali berikutnya
./dev.sh        # Langsung jalan! Venv & deps udah ada
# Time: ~3 seconds ⚡
```

### Windows

```cmd
dev.bat         # Pertama kali: setup lengkap
dev.bat         # Kali berikutnya: langsung jalan
```

---

## ✅ Testing Checklist

- [ ] Run `./dev.sh` untuk pertama kali
  - Akan check Python version
  - Create venv dengan python3.11
  - Install dependencies
  - Start backend & frontend

- [ ] Run `./dev.sh` kedua kalinya
  - Hanya activate venv
  - Skip Python check
  - Skip dependency install
  - Langsung start services (3 detik!)

- [ ] Run `./start.sh` untuk production mode
  - Behavior sama seperti dev.sh
  - Hanya beda output formatting

- [ ] Test di Windows dengan `dev.bat` dan `start.bat`
  - Behavior sama seperti bash scripts
  - Hanya syntax pakai Windows batch

---

## 📊 Expected Output

### First Run
```
📍 Project Location: /path/to/presensi_rupa

Virtual environment not found. Checking Python version...
❌ Python version mismatch!
Current version: 3.13.5
Required version: 3.11.x

Options:
  1. Install Python 3.11...
  2. Use python3.11 if installed
  3. Continue anyway...

Continue with Python 3.13.5? (y/n): y

Creating Python virtual environment with Python 3.11...
Checking pip dependencies...
Installing Python dependencies from requirements.txt...
✅ Python dependencies installed
Checking npm dependencies...
Installing frontend dependencies...
✅ Frontend dependencies installed

✅ All checks passed! Starting services...
```

### Second Run
```
📍 Project Location: /path/to/presensi_rupa

✅ Virtual environment found!
Activating venv...
Checking pip dependencies...
✅ FastAPI found
Checking npm dependencies...
✅ Frontend dependencies found

✅ All checks passed! Starting services...
```

---

## 🔧 Troubleshooting

### Kalau ingin clean install ulang
```bash
rm -rf venv
./dev.sh
```

### Kalau perlu reinstall dependencies
```bash
rm -rf venv frontend/node_modules
./dev.sh
```

### Kalau script permission error
```bash
chmod +x dev.sh start.sh
./dev.sh
```

---

## 📚 Related Files

- `SCRIPT_IMPROVEMENTS.md` - Detail improvements
- `SCRIPTS_GUIDE.md` - Complete guide
- `PYTHON_VERSION.md` - Python 3.11 installation
- `PYTHON_VERSION_UPDATE.md` - Version check explanation

---

**Status:** ✅ Ready to use!
**Date:** November 13, 2025
