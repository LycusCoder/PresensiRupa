# 📢 Python 3.11 Version Check - Update Summary

## 🎯 What's New

All 4 startup scripts sekarang **automatically check Python version** dan ensure users run dengan Python 3.11!

### Updated Scripts:
- ✅ **start.sh** - Linux/macOS production mode
- ✅ **dev.sh** - Linux/macOS development mode  
- ✅ **start.bat** - Windows production mode
- ✅ **dev.bat** - Windows development mode

---

## 🔍 How It Works

### When You Run Script:

```bash
./dev.sh    # Linux/macOS
# or
dev.bat     # Windows
```

### Script akan:

1. **Check Python version**
   ```
   Checking Python version...
   ```

2. **Extract major.minor version**
   - Python 3.10.x → Major.Minor = 3.10
   - Python 3.11.x → Major.Minor = 3.11 ✅
   - Python 3.13.x → Major.Minor = 3.13

3. **Verify match dengan 3.11**

4. **If MATCH:** Continue normally ✅
   ```
   ✅ Python 3.11.5 is correct!
   (continues with venv setup, npm install, etc)
   ```

5. **If NO MATCH:** Show warning & options ⚠️
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

---

## 🎬 Different Scenarios

### Scenario A: Python 3.11 ✅ (Ideal)
```
$ ./dev.sh

Checking Python version...
✅ Python 3.11.5 is correct!

🔧 Activating Python virtual environment...
✅ Virtual environment activated

Verifying dependencies...
✅ All dependencies ready

... (continues normally, starts backend & frontend)
```

### Scenario B: Python 3.10 ⚠️ (Outdated)
```
$ ./dev.sh

Checking Python version...
❌ Python version mismatch!
Current version: 3.10.12
Required version: 3.11.x

Options:
  1. Install Python 3.11 from: https://www.python.org/downloads/
  2. Use python3.11 command if installed: python3.11 -m venv venv
  3. Continue anyway at your own risk (may cause compatibility issues)

Continue with Python 3.10.12? (y/n): n

Setup cancelled.
```

### Scenario C: Python 3.12/3.13 ⚠️ (Too New)
```
$ ./dev.sh

Checking Python version...
❌ Python version mismatch!
Current version: 3.13.5
Required version: 3.11.x

Options:
  1. Install Python 3.11 from: https://www.python.org/downloads/
  2. Use python3.11 command if installed: python3.11 -m venv venv
  3. Continue anyway at your own risk (may cause compatibility issues)

Continue with Python 3.13.5? (y/n): y
⚠️  Proceeding with Python 3.13.5 (not recommended)

🔧 Activating Python virtual environment...
✅ Virtual environment activated

... (continues - but may have issues!)
```

---

## 📝 Code Changes

### Linux/macOS Scripts (dev.sh, start.sh)

**Added to both files (after project location message):**

```bash
# Check Python version
echo -e "${YELLOW}Checking Python version...${NC}"
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
REQUIRED_VERSION="3.11"

# Extract major and minor version
MAJOR_MINOR=$(echo $PYTHON_VERSION | cut -d. -f1-2)

if [ "$MAJOR_MINOR" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}❌ Python version mismatch!${NC}"
    echo -e "${YELLOW}Current version: $PYTHON_VERSION${NC}"
    echo -e "${YELLOW}Required version: $REQUIRED_VERSION.x${NC}"
    echo ""
    echo -e "${CYAN}Options:${NC}"
    echo "  1. Install Python 3.11 from: https://www.python.org/downloads/"
    echo "  2. Use python3.11 command if installed: ${BLUE}python3.11 -m venv venv${NC}"
    echo "  3. Continue anyway at your own risk (may cause compatibility issues)"
    echo ""
    read -p "Continue with Python $PYTHON_VERSION? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Setup cancelled.${NC}"
        exit 1
    fi
    echo -e "${YELLOW}⚠️  Proceeding with Python $PYTHON_VERSION (not recommended)${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Python $PYTHON_VERSION is correct!${NC}"
    echo ""
fi
```

### Windows Scripts (dev.bat, start.bat)

**Added to both files (after project location message):**

```batch
REM Check Python version
echo Checking Python version...
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set "PYTHON_VERSION=%%i"

REM Extract major.minor version
for /f "tokens=1,2 delims=." %%a in ("%PYTHON_VERSION%") do (
    set "MAJOR=%%a"
    set "MINOR=%%b"
)
set "MAJOR_MINOR=%MAJOR%.%MINOR%"

if not "%MAJOR_MINOR%"=="3.11" (
    echo.
    echo ❌ Python version mismatch!
    echo Current version: %PYTHON_VERSION%
    echo Required version: 3.11.x
    echo.
    echo Options:
    echo   1. Install Python 3.11 from: https://www.python.org/downloads/
    echo   2. Continue anyway at your own risk (may cause compatibility issues)
    echo.
    set /p CONTINUE="Continue with Python %PYTHON_VERSION%? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo.
        echo Setup cancelled.
        pause
        exit /b 1
    )
    echo.
    echo ⚠️  Proceeding with Python %PYTHON_VERSION% (not recommended)
    echo.
) else (
    echo ✅ Python %PYTHON_VERSION% is correct!
    echo.
)
```

---

## 📚 New Documentation Files

### 1. **PYTHON_VERSION.md**
Comprehensive guide untuk install Python 3.11 di berbagai OS:
- macOS (Homebrew, MacPorts, Manual)
- Ubuntu/Debian (APT + deadsnakes PPA)
- Windows (Official installer)
- Other Linux distributions (Fedora, Arch, openSUSE, Alpine)
- pyenv setup (advanced)
- Troubleshooting section

### 2. **SCRIPTS_GUIDE.md** (Updated)
Added section baru:
- "Python Version Requirement" - Explain requirement & why 3.11
- "Installing Python 3.11" - Quick reference untuk installation

---

## ✨ Benefits

✅ **Consistency** - Semua users develop dengan same Python version
✅ **Prevents Issues** - Avoid dependency conflicts dari Python version mismatch
✅ **User-Friendly** - Clear messages & options jika version tidak match
✅ **Flexible** - Users bisa choose untuk continue dengan different version (at own risk)
✅ **Cross-Platform** - Works sama di Linux, macOS, dan Windows

---

## 🚀 Usage After Update

### For End Users:

```bash
# Just run script normally - version check happens automatically
./dev.sh    # Linux/macOS
dev.bat     # Windows

# If version mismatch, script akan ask what to do
# Follow on-screen instructions
```

### For Developers:

If you have Python 3.11 installed but it's not default:

```bash
# Option 1: Create venv explicitly with 3.11
python3.11 -m venv venv

# Option 2: Use python3 alias pointing to 3.11
alias python3=python3.11

# Option 3: Use pyenv to manage versions
pyenv local 3.11.0
```

---

## 📋 Verification Checklist

- ✅ All 4 startup scripts updated dengan Python 3.11 check
- ✅ Scripts show helpful error messages jika version mismatch
- ✅ Users dapat choose untuk continue atau cancel
- ✅ Documentation updated dengan installation guides
- ✅ New dedicated Python version guide created
- ✅ Cross-platform support (Linux, macOS, Windows)
- ✅ Backward compatible (scripts still work, just add check)

---

## 🎓 Testing the Update

### Test 1: Run with correct Python version
```bash
# If you have Python 3.11 installed
./dev.sh    # Should show ✅ message and continue
```

### Test 2: Run with different Python version
```bash
# If you have Python 3.13
./dev.sh    # Should show ❌ message and ask permission
# Type 'n' to cancel, 'y' to continue at own risk
```

---

## 📞 Support

If you encounter issues:

1. **Check Python version:**
   ```bash
   python3 --version
   ```

2. **Install Python 3.11:**
   - Read: [PYTHON_VERSION.md](./PYTHON_VERSION.md)
   - Or: [SCRIPTS_GUIDE.md](./SCRIPTS_GUIDE.md) section "Installing Python 3.11"

3. **If script hangs on version check:**
   - Press Ctrl+C to cancel
   - Install correct Python version
   - Try again

---

**Last Updated:** November 13, 2025
**PresensiRupa v1.0**
