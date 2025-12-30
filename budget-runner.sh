#!/bin/bash

# ============================================
# BUDGET RUNNER - Cost-limited autonomous operation
# ============================================
# Bütçe limitli çalıştırma
# Token kullanımını takip eder ve limite ulaşınca durur

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
MAX_COST=${1:-10.00}        # Default $10 limit (first argument)
MAX_DURATION=${2:-"2h"}     # Default 2 hours (second argument)
MAX_ITERATIONS=${3:-100}    # Default 100 iterations (third argument)

# Pricing (approximate)
COST_PER_1K_INPUT=0.015     # Sonnet input
COST_PER_1K_OUTPUT=0.075    # Sonnet output
AVG_TOKENS_PER_ITERATION=5000

echo "💰 Budget Runner"
echo "============================================"
echo "Max Cost: \$$MAX_COST"
echo "Max Duration: $MAX_DURATION"
echo "Max Iterations: $MAX_ITERATIONS"
echo "============================================"

# Parse duration to seconds
parse_duration() {
    local dur=$1
    if [[ $dur == *h ]]; then
        echo $((${dur%h} * 3600))
    elif [[ $dur == *m ]]; then
        echo $((${dur%m} * 60))
    else
        echo "$dur"
    fi
}

MAX_SECONDS=$(parse_duration "$MAX_DURATION")
START_TIME=$(date +%s)

# Initialize counters
TOTAL_COST=0.00
ITERATION=0

cd "$BASE_DIR/project"

echo ""
echo "🚀 Starting at $(date)"
echo ""

while true; do
    ITERATION=$((ITERATION + 1))
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    # Check time limit
    if [ "$ELAPSED" -ge "$MAX_SECONDS" ]; then
        echo "⏰ Time limit reached ($MAX_DURATION)"
        break
    fi
    
    # Check iteration limit
    if [ "$ITERATION" -gt "$MAX_ITERATIONS" ]; then
        echo "🔢 Iteration limit reached ($MAX_ITERATIONS)"
        break
    fi
    
    # Estimate cost (rough)
    ESTIMATED_COST=$(echo "scale=2; $ITERATION * $AVG_TOKENS_PER_ITERATION * ($COST_PER_1K_INPUT + $COST_PER_1K_OUTPUT) / 1000" | bc)
    
    # Check cost limit
    if (( $(echo "$ESTIMATED_COST >= $MAX_COST" | bc -l) )); then
        echo "💰 Cost limit reached (~\$$ESTIMATED_COST)"
        break
    fi
    
    # Status
    echo "============================================"
    echo "📊 Iteration: $ITERATION | Elapsed: ${ELAPSED}s | Est. Cost: ~\$$ESTIMATED_COST"
    echo "============================================"
    
    # Run Claude
    claude --dangerously-skip-permissions << 'EOF'
Read /autonomous-referee-stats/MASTER_PROMPT.md.
Check memory, read TASKS.md, complete ONE task, update status.
Be efficient - minimize token usage while maintaining quality.
EOF
    
    # Record iteration
    sqlite3 "$BASE_DIR/data/memory/short_term.db" \
        "INSERT INTO memories (type, content, session_id) VALUES ('action', 'Completed iteration $ITERATION', 'budget-session');" 2>/dev/null
    
    sleep 2
done

# Final report
END_TIME=$(date +%s)
TOTAL_ELAPSED=$((END_TIME - START_TIME))

echo ""
echo "============================================"
echo "📊 FINAL REPORT"
echo "============================================"
echo "Total Iterations: $ITERATION"
echo "Total Time: ${TOTAL_ELAPSED}s ($(($TOTAL_ELAPSED / 60))m)"
echo "Estimated Cost: ~\$$ESTIMATED_COST"
echo "============================================"

# Save report
cat > "$BASE_DIR/data/logs/budget-run-$(date +%Y%m%d-%H%M%S).log" << EOL
Budget Run Report
=================
Started: $(date -d @$START_TIME)
Ended: $(date -d @$END_TIME)
Duration: ${TOTAL_ELAPSED}s
Iterations: $ITERATION
Estimated Cost: ~\$$ESTIMATED_COST
Limits: Cost=\$$MAX_COST, Duration=$MAX_DURATION, Iterations=$MAX_ITERATIONS
EOL

echo "Report saved to data/logs/"
