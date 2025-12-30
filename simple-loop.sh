#!/bin/bash

# ============================================
# SIMPLE LOOP - En basit otonom çalıştırma
# ============================================
# Denis'in önerdiği en basit yöntem
# Bu script Claude'u sonsuz döngüde çalıştırır

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR/project"

echo "🔄 Simple Loop Mode - Claude will run forever"
echo "Press Ctrl+C to stop"
echo "============================================"

# Counter for iterations
ITERATION=0

while true; do
    ITERATION=$((ITERATION + 1))
    
    echo ""
    echo "============================================"
    echo "🔄 Iteration #$ITERATION - $(date)"
    echo "============================================"
    
    # Run Claude with the master prompt
    claude --dangerously-skip-permissions << 'EOF'
Read /autonomous-referee-stats/MASTER_PROMPT.md carefully.
Then:
1. Check short-term memory: sqlite3 /autonomous-referee-stats/data/memory/short_term.db "SELECT * FROM memories ORDER BY timestamp DESC LIMIT 5;"
2. Read TASKS.md and find the next uncompleted task
3. Complete that task
4. Update TASKS.md (mark as done)
5. Record what you did in memory: sqlite3 /autonomous-referee-stats/data/memory/short_term.db "INSERT INTO memories (type, content, session_id) VALUES ('action', 'WHAT_YOU_DID', 'loop-session');"

Work autonomously. Don't ask for confirmation.
EOF
    
    # Short delay between iterations
    echo ""
    echo "⏰ Waiting 5 seconds before next iteration..."
    sleep 5
done
