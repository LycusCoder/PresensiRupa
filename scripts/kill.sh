#!/bin/bash
#
# PresensiRupa - Stop All Development Services
#
# This script finds and kills processes running on specified ports
# to ensure a clean shutdown of the development environment.

# --- Configuration ---
PORTS=(8001 5173) # Backend and Frontend ports
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${YELLOW}Stopping all development services for PresensiRupa...${NC}"
echo ""

for port in "${PORTS[@]}"; do
    echo -e "${CYAN}Searching for service on port $port...${NC}"
    
    # Use lsof to find the PID listening on the port.
    # The -t flag outputs only the PID.
    # Redirect stderr to /dev/null to hide "lsof: status error" if no process is found.
    PID=$(lsof -t -i:$port 2>/dev/null)
    
    if [ -n "$PID" ]; then
        echo -e "Found service with PID ${GREEN}$PID${NC} on port $port. Stopping..."
        # Kill the process forcefully.
        kill -9 $PID
        echo -e "${GREEN}✅ Service on port $port stopped.${NC}"
    else
        echo -e "ℹ️ No service found running on port $port."
    fi
    echo ""
done

echo -e "${GREEN}All services have been stopped.${NC}"
