#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════╗
# ║         BADALY — ONE-COMMAND DEMO LAUNCHER       ║
# ╚══════════════════════════════════════════════════╝

HTML_FILE="index.html"
BACKEND_DIR="badaly-backend"
PORT=3001
FRONTEND_PORT=8080

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "\n${CYAN}╔══════════════════════════════════════════╗"
echo -e "║       🟢  BADALY LAUNCHER STARTING       ║"
echo -e "╚══════════════════════════════════════════╝${NC}\n"

# ── Kill anything already using our ports (safe re-run)
echo -e "${YELLOW}[0/3]${NC} Freeing ports $PORT and $FRONTEND_PORT..."
fuser -k ${PORT}/tcp 2>/dev/null && echo -e "   killed old process on $PORT" || true
fuser -k ${FRONTEND_PORT}/tcp 2>/dev/null && echo -e "   killed old process on $FRONTEND_PORT" || true
sleep 1

# ── Get real WiFi IP (not Docker 172.x)
LOCAL_IP=$(ip route get 1.1.1.1 | awk '{print $7}' | tr -d '\n')
BACKEND_URL="http://$LOCAL_IP:$PORT"

# ── 1. Install backend deps if needed
echo -e "${YELLOW}[1/3]${NC} Checking backend dependencies..."
cd "$BACKEND_DIR"
npm install --silent
cd ..
echo -e "${GREEN}✅ Backend ready${NC}\n"

# ── 2. Patch BACKEND_URL in the HTML
echo -e "${YELLOW}[2/3]${NC} Patching HTML → ${CYAN}$BACKEND_URL${NC}"
sed -i "s|const BACKEND_URL = '[^']*'|const BACKEND_URL = '$BACKEND_URL'|g" "$HTML_FILE"
echo -e "${GREEN}✅ HTML patched${NC}\n"

# ── 3. Start backend
echo -e "${YELLOW}[3/3]${NC} Starting backend on port $PORT..."
cd "$BACKEND_DIR"
node server.js &
BACKEND_PID=$!
cd ..
sleep 1

# ── Cleanup on Ctrl+C
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null
  kill $SERVER_PID 2>/dev/null
  echo -e "${GREEN}Done.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Print the URL
echo -e "${CYAN}"
echo -e "╔══════════════════════════════════════════════════════╗"
echo -e "║  🚀  BADALY IS READY!                                ║"
echo -e "╠══════════════════════════════════════════════════════╣"
echo -e "║                                                      ║"
echo -e "║  💻 Laptop: http://localhost:$FRONTEND_PORT/$HTML_FILE    ║"
echo -e "║  📱 Phone:  http://$LOCAL_IP:$FRONTEND_PORT/$HTML_FILE    ║"
echo -e "║                                                      ║"
echo -e "║  ⚠️  If phone can't connect, run once:               ║"
echo -e "║     sudo ufw allow 8080 && sudo ufw allow 3001       ║"
echo -e "║                                                      ║"
echo -e "║  🛑  Ctrl+C to stop everything                       ║"
echo -e "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Serve frontend with Python (built-in, zero install time)
python3 -m http.server $FRONTEND_PORT --bind 0.0.0.0 &
SERVER_PID=$!

wait
