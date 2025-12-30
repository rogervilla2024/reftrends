#!/bin/bash

# ============================================
# WORKER - Runs Claude Code in tmux session
# ============================================

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMUX_SESSION="refstats"
LOG_FILE="$BASE_DIR/data/logs/worker.log"
PROJECT_DIR="$BASE_DIR/project"

# Generate unique session ID
SESSION_ID="session-$(date +%Y%m%d-%H%M%S)"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WORKER] $1" | tee -a "$LOG_FILE"
}

# Record session start in database
record_session_start() {
    sqlite3 "$BASE_DIR/data/memory/sessions.db" \
        "INSERT INTO sessions (session_id, status) VALUES ('$SESSION_ID', 'running');" 2>/dev/null
}

# Record session end
record_session_end() {
    sqlite3 "$BASE_DIR/data/memory/sessions.db" \
        "UPDATE sessions SET ended_at = datetime('now'), status = 'ended' WHERE session_id = '$SESSION_ID';" 2>/dev/null
}

# Create tmux session with Claude
start_claude_session() {
    log "Starting Claude session: $SESSION_ID"
    
    # Kill existing session if exists
    tmux kill-session -t "$TMUX_SESSION" 2>/dev/null
    
    # Create new session
    tmux new-session -d -s "$TMUX_SESSION" -c "$PROJECT_DIR"
    
    # Set up logging
    tmux pipe-pane -t "$TMUX_SESSION" "cat >> $LOG_FILE"
    
    # Load the master prompt
    PROMPT=$(cat "$BASE_DIR/MASTER_PROMPT.md")
    
    # Start Claude with the prompt
    # Using --dangerously-skip-permissions for autonomous operation
    tmux send-keys -t "$TMUX_SESSION" "cd $PROJECT_DIR" Enter
    sleep 1
    
    # Start Claude
    tmux send-keys -t "$TMUX_SESSION" "claude --dangerously-skip-permissions" Enter
    sleep 5
    
    # Send initial prompt
    tmux send-keys -t "$TMUX_SESSION" "Read /autonomous-referee-stats/MASTER_PROMPT.md and begin working on the project. Start by reading your memories and TASKS.md." Enter
    
    log "Claude session started in tmux: $TMUX_SESSION"
}

# Main loop for continuous operation
run_continuous() {
    log "🚀 Worker starting in continuous mode"
    record_session_start
    
    start_claude_session
    
    # Keep running and restart if Claude exits
    while true; do
        # Check if Claude process is still running in tmux
        if ! tmux list-panes -t "$TMUX_SESSION" &>/dev/null; then
            log "⚠️ Claude session ended, restarting..."
            sleep 5
            start_claude_session
        fi
        
        sleep 30
    done
}

# Simple single run (for testing)
run_once() {
    log "🚀 Worker starting single run"
    record_session_start
    
    cd "$PROJECT_DIR"
    
    # Run Claude with prompt
    claude --dangerously-skip-permissions <<< "Read /autonomous-referee-stats/MASTER_PROMPT.md and complete one task from TASKS.md. Update the task status when done."
    
    record_session_end
    log "✅ Single run completed"
}

# Handle arguments
case "${1:-continuous}" in
    once)
        run_once
        ;;
    continuous|*)
        run_continuous
        ;;
esac
