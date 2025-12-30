#!/bin/bash

# ============================================
# VS CODE + OPUS 4.5 - Autonomous Runner
# ============================================
# Bu script'i VS Code terminal'inde çalıştır
# Claude Code extension'ı açık olmalı

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$BASE_DIR/project"

# ⚡ AYARLAR
INTERVAL=60                 # Dakikada 1 tetikleme (saniye)
MAX_ITERATIONS=0            # 0 = sonsuz
MAX_COST=0                  # 0 = limit yok

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
show_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║   🤖 AUTONOMOUS CLAUDE CODE - OPUS 4.5                       ║"
    echo "║   Referee Stats Builder                                       ║"
    echo "║                                                               ║"
    echo "║   Interval: ${INTERVAL}s | Mode: VS Code Terminal             ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Memory'ye yaz
record_action() {
    local type="$1"
    local content="$2"
    sqlite3 "$BASE_DIR/data/memory/short_term.db" \
        "INSERT INTO memories (type, content, session_id) VALUES ('$type', '$content', 'vscode-opus');" 2>/dev/null
}

# Memory'den oku
get_recent_memories() {
    sqlite3 "$BASE_DIR/data/memory/short_term.db" \
        "SELECT type, content FROM memories ORDER BY timestamp DESC LIMIT 5;" 2>/dev/null
}

# Task progress
get_progress() {
    if [ -f "$BASE_DIR/TASKS.md" ]; then
        local done=$(grep -c "\[x\]" "$BASE_DIR/TASKS.md" 2>/dev/null || echo "0")
        local todo=$(grep -c "\[ \]" "$BASE_DIR/TASKS.md" 2>/dev/null || echo "0")
        local total=$((done + todo))
        local pct=0
        [ $total -gt 0 ] && pct=$((done * 100 / total))
        echo "$done/$total ($pct%)"
    else
        echo "N/A"
    fi
}

# Status göster
show_status() {
    local iteration=$1
    local elapsed=$2
    
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}📊 Iteration: $iteration${NC} | ⏱️  Elapsed: ${elapsed}s | 📋 Progress: $(get_progress)"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Claude'u çalıştır
run_claude() {
    local iteration=$1
    
    echo -e "${YELLOW}🚀 Starting Claude Code iteration #$iteration...${NC}"
    echo ""
    
    # Başlangıç zamanı
    local start_time=$(date +%s)
    
    # Claude'u prompt ile çalıştır
    cd "$PROJECT_DIR"
    
    claude --dangerously-skip-permissions << EOF

# 🎯 AUTONOMOUS MODE - Iteration #$iteration

You are working autonomously on the Referee Stats project.

## FIRST: Check your memory
\`\`\`bash
sqlite3 $BASE_DIR/data/memory/short_term.db "SELECT type, content FROM memories ORDER BY timestamp DESC LIMIT 5;"
\`\`\`

## THEN: Read current tasks
\`\`\`bash
cat $BASE_DIR/TASKS.md | head -100
\`\`\`

## YOUR JOB:
1. Find the FIRST uncompleted task (marked with [ ])
2. Complete that task
3. Update TASKS.md to mark it [x] done
4. Record what you did:
\`\`\`bash
sqlite3 $BASE_DIR/data/memory/short_term.db "INSERT INTO memories (type, content, session_id) VALUES ('action', 'DESCRIBE WHAT YOU DID', 'vscode-opus');"
\`\`\`

## IMPORTANT:
- Work in: $PROJECT_DIR
- API Key: ea04c7309495164f85f3f5fdb5567896
- Be autonomous - don't ask for confirmation
- Complete ONE task per iteration
- If you encounter an error, log it and try a different approach

START WORKING NOW!
EOF

    # Bitiş zamanı
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Log
    record_action "action" "Completed iteration $iteration (${duration}s)"
    
    echo ""
    echo -e "${GREEN}✓ Iteration $iteration completed in ${duration}s${NC}"
    
    return 0
}

# Ana döngü
main() {
    show_banner
    
    # Proje dizini yoksa oluştur
    mkdir -p "$PROJECT_DIR"
    
    # Setup kontrolü
    if [ ! -f "$BASE_DIR/data/memory/short_term.db" ]; then
        echo -e "${YELLOW}First run - running setup...${NC}"
        ./setup.sh
    fi
    
    echo -e "${GREEN}Starting autonomous loop...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    local iteration=0
    local start_time=$(date +%s)
    
    while true; do
        iteration=$((iteration + 1))
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        # İterasyon limiti kontrolü
        if [ "$MAX_ITERATIONS" -gt 0 ] && [ "$iteration" -gt "$MAX_ITERATIONS" ]; then
            echo -e "${YELLOW}Max iterations ($MAX_ITERATIONS) reached. Stopping.${NC}"
            break
        fi
        
        show_status $iteration $elapsed
        
        # Claude'u çalıştır
        run_claude $iteration
        
        # Sonraki iterasyon için bekle
        echo ""
        echo -e "${CYAN}⏳ Waiting ${INTERVAL}s before next iteration...${NC}"
        echo -e "${CYAN}   (Ctrl+C to stop)${NC}"
        
        # Countdown göster
        for ((i=$INTERVAL; i>0; i--)); do
            printf "\r   Next iteration in: ${i}s   "
            sleep 1
        done
        echo ""
    done
}

# Ctrl+C yakalama
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping...${NC}"
    record_action "observation" "Session stopped by user"
    
    # Final rapor
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}📊 FINAL REPORT${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo "Progress: $(get_progress)"
    echo ""
    echo "Recent actions:"
    get_recent_memories | while read line; do
        echo "  • $line"
    done
    echo ""
    exit 0
}

trap cleanup SIGINT SIGTERM

# Başlat
main "$@"
