# 🚀 PresensiRupa - Startup Scripts Guide

## Overview

Kami menyediakan **4 convenient scripts** untuk memudahkan startup backend dan frontend sekaligus dalam 1 terminal!

## 📁 Scripts Available

### 1. **start.sh** (Linux/macOS - Production)
```bash
./start.sh
```

**Fitur:**
- ✅ Auto-check & create Python virtual environment
- ✅ Auto-install frontend dependencies jika belum ada
- ✅ Auto-verify Python & npm packages
- ✅ Start backend & frontend dalam 1 terminal
- ✅ Graceful shutdown dengan Ctrl+C
- ✅ Colored output untuk better readability

**Kapan digunakan:** Saat production atau testing final build

---

### 2. **dev.sh** (Linux/macOS - Development)
```bash
./dev.sh
```

**Fitur:**
- ✅ Sama seperti start.sh tapi fokus pada development
- ✅ Hot reload untuk backend (FastAPI --reload)
- ✅ Hot reload untuk frontend (Vite dev server)
- ✅ Better formatting output
- ✅ Development tips dalam output

**Kapan digunakan:** Saat development sehari-hari (RECOMMENDED)

---

### 3. **start.bat** (Windows - Production)
```cmd
start.bat
```

**Fitur:**
- ✅ Auto-check & create Python virtual environment
- ✅ Auto-install dependencies
- ✅ Open backend & frontend dalam 2 windows terpisah
- ✅ Clear visual feedback

**Kapan digunakan:** Windows production atau testing

---

### 4. **dev.bat** (Windows - Development)
```cmd
dev.bat
```

**Fitur:**
- ✅ Sama seperti start.bat
- ✅ Optimized untuk development workflow
- ✅ Hot reload enabled
- ✅ Development tips

**Kapan digunakan:** Windows development (RECOMMENDED)

---

## 🎯 Quick Start (Recommended)

### Linux/macOS
```bash
# First time setup - navigate ke project root
cd /path/to/presensi_rupa

# Make script executable (one-time only)
chmod +x dev.sh

# Run development mode
./dev.sh

# ℹ️  Script akan automatically check Python 3.11
#    Jika tidak cocok, akan ask permission untuk continue
```

### Windows
```cmd
REM Navigate ke project root
cd path\to\presensi_rupa

REM Double-click dev.bat atau jalankan dari cmd
dev.bat

REM ℹ️  Script akan automatically check Python 3.11
REM    Jika tidak cocok, akan ask permission untuk continue
```

---

## 🔐 Python Version Requirement

**Semua startup scripts sekarang require Python 3.11!**

### What Happens When You Run Script?

1. **Script detects current Python version**
   ```
   ✅ Python 3.11.x  → Proceed normally
   ⚠️  Python 3.10/3.12/3.13 → Show warning & ask permission
   ```

2. **If Version Mismatch:**
   ```
   ❌ Python version mismatch!
   Current version: 3.13.5
   Required version: 3.11.x
   
   Options:
     1. Install Python 3.11 from: https://www.python.org/downloads/
     2. Use python3.11 command if installed: python3.11 -m venv venv
     3. Continue anyway at your own risk (may cause compatibility issues)
   
   Continue with Python 3.13.5? (y/n):
   ```

3. **User dapat memilih:**
   - **y** = Continue dengan Python versi berbeda (tidak recommended)
   - **n** = Cancel setup & install Python 3.11

### Why Python 3.11?

✅ **Stability** - Tested & verified dengan semua dependencies
✅ **Compatibility** - semua Python packages optimize untuk 3.11
✅ **Performance** - 3.11 adalah sweet spot antara features & stability
✅ **Long-term Support** - Python 3.11 supported sampai Oct 2027

---

## 📊 Differences Between Scripts

| Feature | start.sh | dev.sh | start.bat | dev.bat |
|---------|----------|--------|-----------|---------|
| OS | Linux/macOS | Linux/macOS | Windows | Windows |
| Purpose | Production | Development | Production | Development |
| Auto-reload | ❌ | ✅ | ❌ | ✅ |
| Dependency Check | ✅ | ✅ | ✅ | ✅ |
| Venv Management | ✅ | ✅ | ✅ | ✅ |
| Single Terminal | ✅ | ✅ | ❌ | ❌ |
| Separate Windows | ❌ | ❌ | ✅ | ✅ |

---

## 🔧 What Each Script Does

### Initialization Phase
```
1. Check virtual environment (venv)
   └─ Create if not exist
   
2. Activate Python venv
   
3. Check Python dependencies
   └─ Install if missing
   
4. Check Node modules
   └─ Run npm install if missing
```

### Startup Phase
```
1. Start Backend (FastAPI)
   └─ Port 8001
   └─ http://localhost:8001
   └─ API Docs: http://localhost:8001/docs
   
2. Wait 2-3 seconds
   
3. Start Frontend (Vite)
   └─ Port 5173
   └─ http://localhost:5173
```

### Running Phase
```
1. Both services running with hot-reload (dev mode)
   
2. Monitor logs from both services
   
3. Press Ctrl+C to gracefully shutdown both
```

---

## 🌐 Access Points After Starting

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend API** | http://localhost:8001 | API server |
| **API Docs (Swagger)** | http://localhost:8001/docs | Interactive API documentation |
| **API Docs (ReDoc)** | http://localhost:8001/redoc | Alternative API documentation |

---

## 📥 Installing Python 3.11

### macOS (using Homebrew)
```bash
# Install Python 3.11
brew install python@3.11

# Verify installation
python3.11 --version
```

### Ubuntu/Debian
```bash
# Add deadsnakes PPA
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3.11-dev

# Verify installation
python3.11 --version
```

### Windows
```
1. Download installer: https://www.python.org/downloads/release/python-3110/
2. Run installer
3. ✅ Check "Add Python to PATH"
4. ✅ Check "Install pip"
5. Click "Install Now"
6. Verify:
   python --version    (should show 3.11.x)
```

### macOS/Linux - If You Have Multiple Python Versions

If you have Python 3.11 installed but `python3` points to different version:

```bash
# Create Python 3.11 venv manually
python3.11 -m venv venv

# Then run script
./dev.sh    # Script akan gunakan Python 3.11 dari venv
```

---

## 💡 Pro Tips

### 1. Keep Terminal Always Visible
```bash
# Make terminal bigger for better log viewing
# Recommended: 1920x1080 or higher resolution terminal
```

### 2. Monitor Both Services
```
✅ Look for these success messages:
   
   Backend: "Application startup complete"
   Frontend: "ready in XXX ms"
```

### 3. Hot Reload in Development
```
Edit Backend Files:
├─ app/api/
├─ app/services/
├─ app/db/
└─ Auto-reload in ~1 second ✓

Edit Frontend Files:
├─ src/pages/
├─ src/components/
├─ src/services/
└─ Auto-reload in ~100ms ✓
```

### 4. Troubleshooting Port Already in Use

If port 8001 atau 5173 already in use:

**macOS/Linux:**
```bash
# Kill process on port 8001
lsof -i :8001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Windows:**
```cmd
# Kill process on port 8001
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### 5. Update Dependencies
```bash
# Python (after changing requirements.txt)
pip install -r requirements.txt

# Frontend (after changing package.json)
cd frontend
npm install
```

---

## 🚦 Understanding the Output

### Backend Starting
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Application startup complete ✅
```

### Frontend Starting
```
  VITE v5.0.8  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

---

## 🛑 Stopping Services

### Graceful Shutdown
```bash
# Press Ctrl+C in the terminal
# Script will:
# 1. Kill backend process
# 2. Kill frontend process  
# 3. Show confirmation
# 4. Exit cleanly
```

### Force Kill (if needed)
```bash
# Linux/macOS
pkill -f uvicorn
pkill -f vite

# Windows (via separate cmd window)
taskkill /F /IM python.exe
taskkill /F /IM node.exe
```

---

## 📝 Environment Configuration

Scripts automatically use:
- `.env` file for backend configuration
- `.env.local` file for frontend configuration

### Backend .env
```
DATABASE_URL=sqlite:///./presensi_rupa.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
DEBUG=True
```

### Frontend .env.local
```
VITE_API_URL=http://localhost:8001
```

---

## 🔐 Security Notes

⚠️ **IMPORTANT**: These scripts are for **LOCAL DEVELOPMENT ONLY**

For production:
- [ ] Change `SECRET_KEY` in `.env`
- [ ] Set `DEBUG=False` dalam .env
- [ ] Use HTTPS/SSL
- [ ] Setup proper database (PostgreSQL)
- [ ] Configure proper CORS origins
- [ ] Use environment-specific configs

---

## 📱 Testing Complete Workflow

After scripts are running:

```
1. Open http://localhost:5173 in browser
   
2. Try Login
   └─ Username: (create new account first)
   └─ Password: (your password)
   
3. Test Registration
   └─ Create new user account
   └─ Fill all required fields
   
4. Check Backend Logs
   └─ http://localhost:8001/docs
   └─ Try API endpoints directly
   
5. Monitor Hot Reload
   └─ Edit a file
   └─ See instant update in browser/API
```

---

## 🎓 Learning Resources

While services are running:

- **API Documentation**: http://localhost:8001/docs
- **Frontend Code**: `frontend/src/`
- **Backend Code**: `app/`
- **Project Docs**: See `*.md` files in root directory

---

## ❓ FAQ

**Q: Port 8001 atau 5173 sudah dipakai?**
A: Lihat "Troubleshooting Port Already in Use" section

**Q: Virtual environment tidak activate?**
A: Jalankan manual: `source venv/bin/activate` (macOS/Linux)

**Q: npm install timeout?**
A: Run: `npm install --legacy-peer-deps`

**Q: Backend tidak start?**
A: Check: `python -m pip install -r requirements.txt`

**Q: Frontend tidak start?**
A: Check: `cd frontend && npm install`

---

## 🎉 Summary

**Menggunakan script ini jadi super simple:**

```bash
# Linux/macOS
./dev.sh

# Windows
dev.bat

# Done! Buka browser di http://localhost:5173
```

**Both backend and frontend start automatically!** ✅

---

Made with ❤️ for convenient development

PresensiRupa v1.0 | November 2025
