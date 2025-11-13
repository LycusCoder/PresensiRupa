# 🐍 Python 3.11 Requirement

## TL;DR

**PresensiRupa requires Python 3.11.x**

All startup scripts (`dev.sh`, `dev.bat`, `start.sh`, `start.bat`) akan automatically check Python version dan ask user permission jika tidak match.

---

## ✅ Check Your Python Version

```bash
python3 --version
```

**Expected output:** `Python 3.11.x` (e.g., 3.11.0, 3.11.5, etc.)

### ❌ If You See Different Version

```
Python 3.10.12   ← Too old
Python 3.12.1    ← Too new
Python 3.13.5    ← Too new
```

**Solution:** Install Python 3.11

---

## 📥 Installation Guide

### 🍎 macOS

**Using Homebrew (Recommended):**
```bash
brew install python@3.11
python3.11 --version
```

**Using MacPorts:**
```bash
sudo port install python311
python3.11 --version
```

**Manual Download:**
- Download from: https://www.python.org/downloads/release/python-3110/
- Run installer & follow prompts

### 🐧 Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Add deadsnakes PPA (contains Python 3.11)
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update

# Install Python 3.11 + venv + dev tools
sudo apt install python3.11 python3.11-venv python3.11-dev

# Verify
python3.11 --version
```

### 🪟 Windows

1. **Download Installer**
   - Go to: https://www.python.org/downloads/release/python-3110/
   - Download "Windows installer (64-bit)" atau "Windows installer (32-bit)"

2. **Run Installer**
   - Double-click downloaded file
   - ⚠️ **IMPORTANT:** Check "✅ Add Python to PATH"
   - Check "✅ Install pip"
   - Click "Install Now"

3. **Verify Installation**
   ```cmd
   python --version
   ```
   Expected: `Python 3.11.x`

4. **If Still Not Working**
   - Uninstall current Python
   - Restart computer
   - Install Python 3.11 again
   - Make sure to check "Add Python to PATH"

### 🔄 Linux (Other Distributions)

```bash
# Fedora
sudo dnf install python3.11 python3.11-devel python3.11-venv

# Arch
sudo pacman -S python311

# openSUSE
sudo zypper install python311 python311-devel

# Alpine
apk add python3.11 python3.11-venv
```

---

## 🎯 What Happens When You Run Script

### Scenario 1: Python 3.11 Installed ✅
```
📍 Project Location: /path/to/presensi_rupa
Checking Python version...
✅ Python 3.11.5 is correct!

🔧 Activating Python virtual environment...
✅ Virtual environment activated

... (continues normally)
```

### Scenario 2: Python 3.10/3.12/3.13 Installed ⚠️
```
📍 Project Location: /path/to/presensi_rupa
Checking Python version...
❌ Python version mismatch!
Current version: 3.13.5
Required version: 3.11.x

Options:
  1. Install Python 3.11 from: https://www.python.org/downloads/
  2. Use python3.11 command if installed: python3.11 -m venv venv
  3. Continue anyway at your own risk (may cause compatibility issues)

Continue with Python 3.13.5? (y/n):
```

**Choose wisely:**
- **n** (Recommended) → Exit & install Python 3.11
- **y** → Continue at your own risk (may cause issues)

---

## 🔧 Multiple Python Versions on Same Machine

If you have multiple Python versions installed:

### Option 1: Create venv with python3.11 Explicitly

```bash
# macOS/Linux
python3.11 -m venv venv

# Then run script - it will use Python 3.11 from venv
./dev.sh
```

### Option 2: Set Alias (Persistent)

```bash
# Add to ~/.bashrc or ~/.zshrc
alias python3=python3.11

# Reload shell
source ~/.bashrc  # or source ~/.zshrc

# Now python3 points to 3.11
python3 --version
```

### Option 3: Use pyenv (Advanced)

```bash
# Install pyenv
brew install pyenv  # macOS
# or visit: https://github.com/pyenv/pyenv

# Install Python 3.11
pyenv install 3.11.0

# Set local version
pyenv local 3.11.0

# Verify
python --version
```

---

## 🤔 Why Python 3.11?

| Feature | Python 3.10 | Python 3.11 | Python 3.12 |
|---------|------------|------------|------------|
| **Stability** | ✅ | ✅✅ | 🔄 |
| **Performance** | 📊 | 📊📊 | 📊📊 |
| **Support Until** | Oct 2023 | Oct 2027 | Oct 2028 |
| **Tested** | ❓ | ✅ | 🔄 |
| **Dependencies** | ⚠️ | ✅ | ⚠️ |
| **Recommended** | ❌ | ✅ | ❓ |

**Python 3.11 adalah sweet spot:** Cukup baru untuk performa bagus, cukup stabil untuk production-ready.

---

## ❓ Troubleshooting

### Problem: "python3 command not found"
```bash
# Check if Python is installed
which python3
which python3.11

# Install Python 3.11 using package manager (see above)
```

### Problem: "python3.11: command not found" (macOS)
```bash
# If installed via Homebrew, try:
brew link python@3.11

# Or use full path:
/usr/local/opt/python@3.11/bin/python3.11 --version
```

### Problem: "pip packages not installing in venv"
```bash
# Delete old venv
rm -rf venv

# Create fresh venv with Python 3.11
python3.11 -m venv venv

# Activate and try again
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

### Problem: "ModuleNotFoundError" after running script
- Make sure venv is activated: `which python` should show `/path/to/venv/bin/python`
- Check Python version: `python --version` should show 3.11.x
- Reinstall dependencies: `pip install -r requirements.txt`

---

## ✨ Verified Compatible Packages

All packages in `requirements.txt` tested dengan Python 3.11:

```
✅ FastAPI 0.104.1
✅ Uvicorn 0.24.0
✅ SQLAlchemy 2.0.23
✅ Pydantic 2.5.0
✅ python-jose 3.3.0
✅ passlib 1.7.4
✅ python-multipart 0.0.6
✅ Pillow 10.1.0
✅ pytesseract 0.3.10
```

---

## 🎉 Once Installed

```bash
# Verify Python 3.11 is default
python3 --version

# Run startup script
./dev.sh    # or dev.bat (Windows)

# You're ready! 🚀
```

---

**Last Updated:** November 13, 2025
**PresensiRupa v1.0**
