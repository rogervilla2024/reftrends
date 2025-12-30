@echo off
REM ============================================
REM VS CODE + OPUS 4.5 - Windows Autonomous Runner
REM ============================================
REM Bu dosyayı VS Code terminal'inde çalıştır
REM PowerShell veya Git Bash önerilir

setlocal enabledelayedexpansion

REM ⚡ AYARLAR
set INTERVAL=60
set MAX_ITERATIONS=0

REM Renkler için
set GREEN=[32m
set YELLOW=[33m
set CYAN=[36m
set NC=[0m

echo.
echo %CYAN%╔═══════════════════════════════════════════════════════════════╗%NC%
echo %CYAN%║   🤖 AUTONOMOUS CLAUDE CODE - OPUS 4.5 (Windows)             ║%NC%
echo %CYAN%║   Referee Stats Builder                                       ║%NC%
echo %CYAN%╚═══════════════════════════════════════════════════════════════╝%NC%
echo.

REM Proje dizinine git
cd /d "%~dp0project"

set ITERATION=0

:loop
set /a ITERATION+=1

echo.
echo %GREEN%═══════════════════════════════════════════════════════════════%NC%
echo %GREEN%📊 Iteration: %ITERATION%%NC%
echo %GREEN%═══════════════════════════════════════════════════════════════%NC%
echo.

REM Claude'u çalıştır
echo %YELLOW%🚀 Running Claude Code...%NC%
echo.

claude --dangerously-skip-permissions -p "Read ../MASTER_PROMPT.md and complete the next task from ../TASKS.md. Update task status when done. Record your action in the memory database. Work autonomously."

echo.
echo %GREEN%✓ Iteration %ITERATION% completed%NC%
echo.

REM Bekle
echo %CYAN%⏳ Waiting %INTERVAL% seconds...%NC%
timeout /t %INTERVAL% /nobreak >nul

REM İterasyon kontrolü
if %MAX_ITERATIONS% GTR 0 (
    if %ITERATION% GEQ %MAX_ITERATIONS% (
        echo %YELLOW%Max iterations reached. Stopping.%NC%
        goto :end
    )
)

goto :loop

:end
echo.
echo %GREEN%Session completed.%NC%
pause
