#!/bin/bash

# ============================================
# STOP - Gracefully stops the autonomous system
# ============================================

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

echo "🛑 Stopping Autonomous Referee Stats Builder..."
echo "============================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# ============================================
# 1. Stop Watcher
# ============================================
echo "Stopping watcher..."
pkill -f "watcher.sh" 2>/dev/null && echo -e "${GREEN}✓ Watcher stopped${NC}" || echo "Watcher not running"

# ============================================
# 2. Stop Dashboard
# ============================================
echo "Stopping dashboard..."
pkill -f "python.*8080" 2>/dev/null && echo -e "${GREEN}✓ Dashboard stopped${NC}" || echo "Dashboard not running"

# ============================================
# 3. Stop ttyd
# ============================================
echo "Stopping ttyd..."
pkill -f "ttyd" 2>/dev/null && echo -e "${GREEN}✓ ttyd stopped${NC}" || echo "ttyd not running"

# ============================================
# 4. Stop Claude (tmux session)
# ============================================
echo "Stopping Claude session..."
if tmux has-session -t refstats 2>/dev/null; then
    # Send Ctrl+C first to gracefully stop Claude
    tmux send-keys -t refstats C-c
    sleep 2
    # Then kill the session
    tmux kill-session -t refstats 2>/dev/null
    echo -e "${GREEN}✓ Claude session stopped${NC}"
else
    echo "Claude session not running"
fi

# ============================================
# 5. Generate Final Report
# ============================================
echo ""
echo "============================================"
echo "📊 Final Session Report"
echo "============================================"

# Count memories
SHORT_TERM=$(sqlite3 "$BASE_DIR/data/memory/short_term.db" "SELECT COUNT(*) FROM memories;" 2>/dev/null || echo "0")
LONG_TERM=$(sqlite3 "$BASE_DIR/data/memory/long_term.db" "SELECT COUNT(*) FROM learnings;" 2>/dev/null || echo "0")

echo "Short-term memories: $SHORT_TERM"
echo "Long-term learnings: $LONG_TERM"

# Show last 5 actions
echo ""
echo "Last 5 actions:"
sqlite3 "$BASE_DIR/data/memory/short_term.db" \
    "SELECT timestamp, type, substr(content, 1, 50) || '...' FROM memories ORDER BY timestamp DESC LIMIT 5;" 2>/dev/null || echo "No actions recorded"

# Show tasks completed (count checked items in TASKS.md)
if [ -f "TASKS.md" ]; then
    COMPLETED=$(grep -c "\[x\]" TASKS.md 2>/dev/null || echo "0")
    TOTAL=$(grep -c "\[ \]" TASKS.md 2>/dev/null || echo "0")
    TOTAL=$((COMPLETED + TOTAL))
    echo ""
    echo "Tasks: $COMPLETED/$TOTAL completed"
fi

echo ""
echo "============================================"
echo -e "${GREEN}✅ System Stopped${NC}"
echo "============================================"
echo ""
echo "To restart: ./start.sh"
echo ""
