# PresensiRupa - Development Mode for Windows (PowerShell)
# Start both services with better output formatting

Clear-Host

Write-Host "╔══════════════════════════════════════════════════════════════════╗"
Write-Host "║                                                                  ║"
Write-Host "║            🚀 PresensiRupa - Development Environment 🚀        ║"
Write-Host "║                                                                  ║"
Write-Host "║  This script will start both backend and frontend with          ║"
Write-Host "║  auto-reload enabled for development.                          ║"
Write-Host "║                                                                  ║"
Write-Host "╚══════════════════════════════════════════════════════════════════╝"
Write-Host ""

$ScriptDir = $PSScriptRoot
Write-Host "📍 Project Location: $ScriptDir"
Write-Host ""

# --- Virtual Environment Setup ---
$VenvPath = Join-Path $ScriptDir ".venv"

if (Test-Path $VenvPath) {
    Write-Host "✅ Virtual environment found!"
} else {
    Write-Host "Virtual environment not found. Checking Python version..."
    try {
        $pythonVersion = (python --version 2>&1).Split(" ")[1]
        $majorMinor = $pythonVersion.Substring(0, 4)

        if ($majorMinor -ne "3.11") {
            Write-Host ""
            Write-Host "❌ Python version mismatch!" -ForegroundColor Red
            Write-Host "Current version: $pythonVersion"
            Write-Host "Required version: 3.11.x"
            Write-Host ""
            $choice = Read-Host "Continue with Python $pythonVersion? (y/n)"
            if ($choice -ne 'y') {
                Write-Host "Setup cancelled."
                exit
            }
            Write-Host "⚠️  Proceeding with Python $pythonVersion (not recommended)" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Python $pythonVersion is correct!"
        }
        
        Write-Host "Creating Python virtual environment..."
        python -m venv $VenvPath
    } catch {
        Write-Host "❌ Python is not installed or not in PATH." -ForegroundColor Red
        Write-Host "Please install Python 3.11 from: https://www.python.org/downloads/"
        exit
    }
}

# --- Activate Virtual Environment ---
$activateScript = Join-Path $VenvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    . $activateScript
    Write-Host "✅ Virtual environment activated."
} else {
    Write-Host "❌ Activation script not found at $activateScript" -ForegroundColor Red
    exit
}


# --- Dependency Checks ---
# Check pip dependencies
Write-Host "Checking pip dependencies..."
$fastapiCheck = Get-Command fastapi -ErrorAction SilentlyContinue
if (-not $fastapiCheck) {
    Write-Host "Installing Python dependencies..."
    pip install -r requirements.txt | Out-Null
    Write-Host "✅ Python dependencies installed"
} else {
    Write-Host "✅ Python dependencies found"
}

# Check npm dependencies
Write-Host "Checking npm dependencies..."
$nodeModulesPath = Join-Path $ScriptDir "frontend\node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "Installing frontend dependencies (this may take a moment)..."
    Push-Location (Join-Path $ScriptDir "frontend")
    npm install
    Pop-Location
    Write-Host "✅ Frontend dependencies installed"
} else {
    Write-Host "✅ Frontend dependencies found"
}

Write-Host "✅ All dependencies ready"
Write-Host ""

# --- Start Services ---
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host "SERVICES STARTING:"
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "  Backend:  FastAPI on port 8000"
Write-Host "            - http://localhost:8000"
Write-Host "            - http://localhost:8000/docs (API Documentation)"
Write-Host ""
Write-Host "  Frontend: Vite React on port 5173"
Write-Host "            - http://localhost:5173"
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "⏱️  Services starting... (Press Ctrl+C in the new windows to stop)"
Write-Host ""

# Start Backend
Write-Host "🔄 Starting Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& .\.venv\Scripts\activate.ps1; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Wait a bit
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "🔄 Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host "✅ Backend and Frontend are running in new windows!"
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "💡 Tips:"
Write-Host "   • Edit Python files to auto-reload backend"
Write-Host "   • Edit React files to auto-reload frontend"
Write-Host "   • Close the new windows or press Ctrl+C in them to stop services"
Write-Host ""
Write-Host "Open your browser at:"
Write-Host "  → Frontend: http://localhost:5173"
Write-Host "  → Backend API Docs: http://localhost:8000/docs"
Write-Host ""
