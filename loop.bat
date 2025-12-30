@echo off
:loop
echo.
echo ============================================
echo Starting Claude - %time%
echo ============================================
claude --dangerously-skip-permissions "Complete next [ ] task from TASKS.md, mark it [x]"
echo.
echo Waiting 60 seconds...
timeout /t 60 /nobreak
goto loop
```

Sonra çift tıkla veya:
```
.\loop.bat