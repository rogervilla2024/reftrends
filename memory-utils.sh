#!/bin/bash

# ============================================
# MEMORY UTILS - Memory management utilities
# ============================================

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHORT_TERM_DB="$BASE_DIR/data/memory/short_term.db"
LONG_TERM_DB="$BASE_DIR/data/memory/long_term.db"
SESSIONS_DB="$BASE_DIR/data/memory/sessions.db"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
    echo "Memory Management Utilities"
    echo ""
    echo "Usage: ./memory-utils.sh <command>"
    echo ""
    echo "Commands:"
    echo "  status          Show memory statistics"
    echo "  short           List short-term memories"
    echo "  long            List long-term learnings"
    echo "  search <term>   Search long-term memory"
    echo "  add <type> <content>  Add to short-term memory"
    echo "  learn <type> <content> <importance>  Add to long-term memory"
    echo "  clear-short     Clear short-term memory"
    echo "  export          Export all memories to JSON"
    echo "  sessions        List all sessions"
    echo ""
}

show_status() {
    echo -e "${BLUE}📊 Memory Status${NC}"
    echo "============================================"
    
    SHORT_COUNT=$(sqlite3 "$SHORT_TERM_DB" "SELECT COUNT(*) FROM memories;" 2>/dev/null || echo "0")
    LONG_COUNT=$(sqlite3 "$LONG_TERM_DB" "SELECT COUNT(*) FROM learnings;" 2>/dev/null || echo "0")
    SESSION_COUNT=$(sqlite3 "$SESSIONS_DB" "SELECT COUNT(*) FROM sessions;" 2>/dev/null || echo "0")
    
    echo "Short-term memories: $SHORT_COUNT / 50"
    echo "Long-term learnings: $LONG_COUNT"
    echo "Total sessions: $SESSION_COUNT"
    
    echo ""
    echo -e "${YELLOW}Recent Activity:${NC}"
    sqlite3 "$SHORT_TERM_DB" "SELECT timestamp, type, substr(content, 1, 60) FROM memories ORDER BY timestamp DESC LIMIT 3;" 2>/dev/null | while read line; do
        echo "  $line"
    done
}

list_short_term() {
    echo -e "${BLUE}🧠 Short-term Memories (Last 20)${NC}"
    echo "============================================"
    sqlite3 -header -column "$SHORT_TERM_DB" \
        "SELECT id, timestamp, type, substr(content, 1, 50) || '...' as content FROM memories ORDER BY timestamp DESC LIMIT 20;" 2>/dev/null
}

list_long_term() {
    echo -e "${BLUE}📚 Long-term Learnings${NC}"
    echo "============================================"
    sqlite3 -header -column "$LONG_TERM_DB" \
        "SELECT id, type, importance, substr(content, 1, 60) || '...' as content FROM learnings ORDER BY importance DESC, timestamp DESC LIMIT 20;" 2>/dev/null
}

search_memory() {
    local term="$1"
    echo -e "${BLUE}🔍 Searching for: '$term'${NC}"
    echo "============================================"
    
    echo ""
    echo -e "${YELLOW}Short-term:${NC}"
    sqlite3 "$SHORT_TERM_DB" \
        "SELECT timestamp, type, content FROM memories WHERE content LIKE '%$term%' ORDER BY timestamp DESC LIMIT 5;" 2>/dev/null
    
    echo ""
    echo -e "${YELLOW}Long-term:${NC}"
    sqlite3 "$LONG_TERM_DB" \
        "SELECT type, importance, content FROM learnings WHERE content LIKE '%$term%' ORDER BY importance DESC LIMIT 5;" 2>/dev/null
}

add_memory() {
    local type="$1"
    local content="$2"
    
    if [ -z "$type" ] || [ -z "$content" ]; then
        echo "Usage: ./memory-utils.sh add <type> <content>"
        echo "Types: action, observation, thought, goal, error"
        return 1
    fi
    
    sqlite3 "$SHORT_TERM_DB" \
        "INSERT INTO memories (type, content, session_id) VALUES ('$type', '$content', 'manual');"
    
    echo -e "${GREEN}✓ Added to short-term memory${NC}"
}

add_learning() {
    local type="$1"
    local content="$2"
    local importance="${3:-5}"
    
    if [ -z "$type" ] || [ -z "$content" ]; then
        echo "Usage: ./memory-utils.sh learn <type> <content> [importance]"
        echo "Types: fact, skill, preference, lesson, discovery, error"
        echo "Importance: 1-10 (default: 5)"
        return 1
    fi
    
    sqlite3 "$LONG_TERM_DB" \
        "INSERT INTO learnings (type, content, importance) VALUES ('$type', '$content', $importance);"
    
    echo -e "${GREEN}✓ Added to long-term memory (importance: $importance)${NC}"
}

clear_short_term() {
    read -p "Are you sure you want to clear short-term memory? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sqlite3 "$SHORT_TERM_DB" "DELETE FROM memories;"
        echo -e "${GREEN}✓ Short-term memory cleared${NC}"
    fi
}

export_memories() {
    local export_file="$BASE_DIR/data/memory-export-$(date +%Y%m%d-%H%M%S).json"
    
    echo "{" > "$export_file"
    echo '  "short_term": [' >> "$export_file"
    sqlite3 -json "$SHORT_TERM_DB" "SELECT * FROM memories ORDER BY timestamp DESC;" >> "$export_file" 2>/dev/null || echo "[]" >> "$export_file"
    echo '  ],' >> "$export_file"
    echo '  "long_term": [' >> "$export_file"
    sqlite3 -json "$LONG_TERM_DB" "SELECT * FROM learnings ORDER BY importance DESC;" >> "$export_file" 2>/dev/null || echo "[]" >> "$export_file"
    echo '  ]' >> "$export_file"
    echo "}" >> "$export_file"
    
    echo -e "${GREEN}✓ Exported to: $export_file${NC}"
}

list_sessions() {
    echo -e "${BLUE}📋 Sessions${NC}"
    echo "============================================"
    sqlite3 -header -column "$SESSIONS_DB" \
        "SELECT session_id, started_at, ended_at, tasks_completed, status FROM sessions ORDER BY started_at DESC LIMIT 10;" 2>/dev/null
}

# Main
case "${1:-help}" in
    status)
        show_status
        ;;
    short)
        list_short_term
        ;;
    long)
        list_long_term
        ;;
    search)
        search_memory "$2"
        ;;
    add)
        add_memory "$2" "$3"
        ;;
    learn)
        add_learning "$2" "$3" "$4"
        ;;
    clear-short)
        clear_short_term
        ;;
    export)
        export_memories
        ;;
    sessions)
        list_sessions
        ;;
    help|*)
        show_help
        ;;
esac
