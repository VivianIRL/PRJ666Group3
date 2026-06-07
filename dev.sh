#!/usr/bin/env bash
# Starts the backend (port 5000) and frontend (port 3000) together.
# Ctrl-C kills both processes.

set -e

# Colour helpers
CYAN='\033[0;36m'
MAG='\033[0;35m'
RESET='\033[0m'

echo -e "${CYAN}[backend]${RESET}  Starting on http://localhost:5000"
echo -e "${MAG}[frontend]${RESET} Starting on http://localhost:3000"
echo ""

# Run both in background, capturing PIDs
(cd backend && npm run dev 2>&1 | sed "s/^/${CYAN}[backend] ${RESET}/") &
BACKEND_PID=$!

(cd frontend/SettleCAN-Client && npm run dev 2>&1 | sed "s/^/${MAG}[frontend]${RESET}/") &
FRONTEND_PID=$!

# On Ctrl-C kill both children
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait $BACKEND_PID $FRONTEND_PID
