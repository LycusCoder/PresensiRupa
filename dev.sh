#!/bin/bash

# PresensiRupa - Full Stack Development Mode
# Start both services with live reload in one command
# This version shows logs from both services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Welcome message
clear
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║            🚀 PresensiRupa - Development Environment 🚀        ║
║                                                                  ║
║  This script will start both backend and frontend with          ║
║  auto-reload enabled for development.                          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}📍 Project Location: $SCRIPT_DIR${NC}"
echo ""

# Check if venv already exists
if [ -d "venv" ]; then
    echo -e "${GREEN}✅ Virtual environment found!${NC}"
    echo -e "${YELLOW}Activating venv...${NC}"
    source venv/bin/activate
else
    # Only check Python version if creating new venv
    echo -e "${YELLOW}Virtual environment not found. Checking Python version...${NC}"
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

    # Create venv with Python 3.11
    echo -e "${YELLOW}Creating Python virtual environment with Python 3.11...${NC}"
    python3.11 -m venv venv
    
    # Activate venv
    source venv/bin/activate
fi

# Check and install pip dependencies
echo -e "${YELLOW}Checking pip dependencies...${NC}"
if python -c "import fastapi" 2>/dev/null; then
    echo -e "${GREEN}✅ FastAPI found${NC}"
else
    echo -e "${YELLOW}Installing Python dependencies from requirements.txt...${NC}"
    pip install -r requirements.txt > /dev/null 2>&1
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
fi

# Check npm packages
echo -e "${YELLOW}Checking npm dependencies...${NC}"
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies (this may take a moment)...${NC}"
    cd frontend
    if npm install; then
        cd ..
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    else
        cd ..
        echo -e "${RED}❌ npm install failed!${NC}"
        echo -e "${YELLOW}Troubleshooting:${NC}"
        echo "  1. Check npm is installed: npm --version"
        echo "  2. Check Node.js version: node --version"
        echo "  3. Try again: rm -rf frontend/node_modules && ./dev.sh"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Frontend dependencies found${NC}"
fi

echo -e "${GREEN}✅ All dependencies ready${NC}"
echo ""

# Show info
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}SERVICES STARTING:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Backend:${NC}  FastAPI on port 8000"
echo -e "             → http://localhost:8000"
echo -e "             → http://localhost:8000/docs (API Documentation)"
echo ""
echo -e "  ${CYAN}Frontend:${NC} Vite React on port 5173"
echo -e "             → http://localhost:5173"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}⏱️  Starting services... (Press Ctrl+C to stop)${NC}"
echo ""

# Function for cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}────────────────────────────────────────────────────────────────${NC}"
    echo -e "${RED}🛑 Stopping all services...${NC}"
    # Kill all child processes
    pkill -P $$ || true
    sleep 1
    echo -e "${GREEN}✅ All services stopped${NC}"
    echo -e "${YELLOW}────────────────────────────────────────────────────────────────${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Create named pipes for output (optional, for nice formatting)
echo -e "${BLUE}┌─ Backend (PID $BASHPID)${NC}"
echo -e "${BLUE}├─ Frontend${NC}"
echo -e "${BLUE}└─────────────────────────────────────────────────────────────${NC}"
echo ""

# Start backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 2>&1 &
BACKEND_PID=$!

sleep 2

# Start frontend
(cd frontend && npm run dev) 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Backend process started (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}✅ Frontend process started (PID: $FRONTEND_PID)${NC}"
echo ""
echo -e "${CYAN}💡 Tips:${NC}"
echo -e "   • Edit Python files to auto-reload backend"
echo -e "   • Edit React files to auto-reload frontend"
echo -e "   • Use Ctrl+C to stop all services gracefully"
echo ""

# Wait for child processes
wait
