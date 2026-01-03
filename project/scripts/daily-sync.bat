@echo off
REM Daily Referee Data Sync Script
REM Schedule this with Windows Task Scheduler to run daily at 6:00 AM

cd /d "C:\Users\onurm\.claude\projects\autonomous-referee-stats\project"

echo [%date% %time%] Starting daily sync... >> logs\sync.log 2>&1

call npm run sync:daily >> logs\sync.log 2>&1

echo [%date% %time%] Sync completed. >> logs\sync.log 2>&1
