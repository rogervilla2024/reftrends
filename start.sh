#!/bin/bash

# ============================================
# START - Launches the entire autonomous system
# ============================================

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

echo "🚀 Starting Autonomous Referee Stats Builder..."
echo "============================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================
# 1. Run Setup if needed
# ============================================
if [ ! -f "data/memory/short_term.db" ]; then
    echo -e "${YELLOW}First run detected, running setup...${NC}"
    ./setup.sh
fi

# ============================================
# 2. Create project directory if not exists
# ============================================
if [ ! -d "project" ]; then
    mkdir -p project
fi

# ============================================
# 3. Start Dashboard (Simple HTTP Server)
# ============================================
echo -e "${YELLOW}Starting dashboard server...${NC}"

# Kill any existing dashboard
pkill -f "python.*8080" 2>/dev/null || true

# Start dashboard on port 8080
cd dashboard
python3 -m http.server 8080 &>/dev/null &
DASHBOARD_PID=$!
cd "$BASE_DIR"

echo -e "${GREEN}✓ Dashboard running at http://localhost:8080${NC}"

# ============================================
# 4. Start ttyd for terminal streaming (optional)
# ============================================
if command -v ttyd &> /dev/null; then
    echo -e "${YELLOW}Starting ttyd for live terminal...${NC}"
    pkill -f "ttyd" 2>/dev/null || true
    ttyd -p 7681 -W tmux attach -t refstats &>/dev/null &
    echo -e "${GREEN}✓ Live terminal at http://localhost:7681${NC}"
fi

# ============================================
# 5. Start Worker (Claude in tmux)
# ============================================
echo -e "${YELLOW}Starting worker (Claude Code)...${NC}"
./worker.sh &
WORKER_PID=$!
sleep 5

echo -e "${GREEN}✓ Worker started (PID: $WORKER_PID)${NC}"

# ============================================
# 6. Start Watcher (optional - for nudging)
# ============================================
read -p "Start watcher for auto-nudging? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Starting watcher...${NC}"
    ./watcher.sh &
    WATCHER_PID=$!
    echo -e "${GREEN}✓ Watcher started (PID: $WATCHER_PID)${NC}"
fi

# ============================================
# Summary
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}✅ System Started Successfully!${NC}"
echo "============================================"
echo ""
echo "Access Points:"
echo "  📊 Dashboard:     http://localhost:8080"
echo "  🖥️  Live Terminal: http://localhost:7681 (if ttyd installed)"
echo ""
echo "Monitoring:"
echo "  tmux attach -t refstats     # View Claude working"
echo "  tail -f data/logs/worker.log  # View logs"
echo ""
echo "Stop:"
echo "  ./stop.sh"
echo ""
echo "Claude is now working autonomously!"
echo "============================================"

# Keep script running to maintain background processes
wait
