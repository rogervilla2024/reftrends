#!/bin/bash

# ============================================
# WATCHER - VS Code + Claude Code (Opus 4.5)
# Dakikada 1 tetikleme
# ============================================

# Configuration
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMUX_SESSION="refstats"
LOG_FILE="$BASE_DIR/data/logs/watcher.log"
WORKER_LOG="$BASE_DIR/data/logs/worker.log"

# ⚡ AYARLAR - Dakikada 1 tetikleme
MAX_IDLE_MINUTES=2         # 2 dakika sessizse nudge
CHECK_INTERVAL=60          # 60 saniye = 1 dakika

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if worker is running
is_worker_running() {
    tmux has-session -t "$TMUX_SESSION" 2>/dev/null
    return $?
}

# Check if Claude is idle (no output for X minutes)
is_claude_idle() {
    if [ -f "$WORKER_LOG" ]; then
        local last_modified=$(stat -c %Y "$WORKER_LOG" 2>/dev/null || stat -f %m "$WORKER_LOG" 2>/dev/null)
        local now=$(date +%s)
        local diff=$(( (now - last_modified) / 60 ))
        
        if [ "$diff" -gt "$MAX_IDLE_MINUTES" ]; then
            return 0  # True, is idle
        fi
    fi
    return 1  # False, not idle
}

# Send nudge to Claude
nudge_claude() {
    local message="$1"
    log "Nudging Claude: $message"
    
    # Send keystroke to tmux session
    tmux send-keys -t "$TMUX_SESSION" "" Enter
    sleep 1
    tmux send-keys -t "$TMUX_SESSION" "$message" Enter
}

# Generate status report
generate_status() {
    local short_term_count=$(sqlite3 "$BASE_DIR/data/memory/short_term.db" "SELECT COUNT(*) FROM memories;" 2>/dev/null || echo "0")
    local long_term_count=$(sqlite3 "$BASE_DIR/data/memory/long_term.db" "SELECT COUNT(*) FROM learnings;" 2>/dev/null || echo "0")
    local last_action=$(sqlite3 "$BASE_DIR/data/memory/short_term.db" "SELECT content FROM memories ORDER BY timestamp DESC LIMIT 1;" 2>/dev/null || echo "N/A")
    
    echo "===================="
    echo "WATCHER STATUS REPORT"
    echo "===================="
    echo "Time: $(date)"
    echo "Worker Running: $(is_worker_running && echo 'Yes' || echo 'No')"
    echo "Short-term Memories: $short_term_count"
    echo "Long-term Learnings: $long_term_count"
    echo "Last Action: $last_action"
    echo "===================="
}

# Main watcher loop
main() {
    log "🔍 Watcher started"
    
    while true; do
        # Check if worker is running
        if ! is_worker_running; then
            log "⚠️ Worker not running! Starting..."
            ./worker.sh &
            sleep 30  # Give Claude time to start
        fi
        
        # Check if Claude is idle
        if is_claude_idle; then
            log "💤 Claude appears idle, sending nudge..."
            nudge_claude "Continue working on the next task from TASKS.md. Check your memory first."
        fi
        
        # Generate and save status
        generate_status >> "$LOG_FILE"
        
        # Wait before next check
        log "⏰ Next check in $CHECK_INTERVAL seconds..."
        sleep $CHECK_INTERVAL
    done
}

# Handle signals
trap "log '🛑 Watcher stopped'; exit 0" SIGINT SIGTERM

# Run main if not sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main
fi
