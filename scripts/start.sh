#!/bin/bash

# PresensiRupa - Full Stack Startup Script
# Start both backend and frontend dalam satu terminal
# Usage: ./start.sh atau bash start.sh

set -e

# Colors untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              PresensiRupa - Full Stack Startup                  ║
║                Smart Attendance System v1.0                     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}📍 Working Directory: $SCRIPT_DIR${NC}"
echo ""

# Check if venv already exists
if [ -d "venv" ]; then
    echo -e "${GREEN}✅ Virtual environment found!${NC}"
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

    echo -e "${YELLOW}Creating virtual environment with Python 3.11...${NC}"
    python3.11 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}🔧 Activating Python virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✅ Virtual environment activated${NC}"
echo ""

# Check if frontend node_modules exists
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
        echo "  3. Try again: rm -rf frontend/node_modules && ./start.sh"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Frontend dependencies found${NC}"
fi

echo -e "${YELLOW}Checking pip dependencies...${NC}"
if python -c "import fastapi" 2>/dev/null; then
    echo -e "${GREEN}✅ Python dependencies found${NC}"
else
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -r requirements.txt > /dev/null 2>&1
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All checks passed! Starting services...${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Show startup info
echo -e "${BLUE}📋 Services Starting:${NC}"
echo -e "  🔵 Backend (FastAPI)  → http://localhost:8001"
echo -e "  🟢 Frontend (Vite)    → http://localhost:5173"
echo -e "  📚 API Documentation  → http://localhost:8001/docs"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Start backend in background
echo -e "${YELLOW}🔄 Starting Backend (FastAPI)...${NC}"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
sleep 3

# Start frontend in background
echo -e "${YELLOW}🔄 Starting Frontend (Vite)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

cd ..

# Wait for both processes
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Both services are running!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🌐 Open your browser:${NC}"
echo -e "  → Frontend: http://localhost:5173"
echo -e "  → Backend API Docs: http://localhost:8001/docs"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
