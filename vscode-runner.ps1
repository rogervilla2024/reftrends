# ============================================
# VS CODE + OPUS 4.5 - PowerShell Autonomous Runner
# ============================================
# Bu script'i VS Code PowerShell terminal'inde çalıştır:
# .\vscode-runner.ps1

param(
    [int]$Interval = 60,           # Dakikada 1 = 60 saniye
    [int]$MaxIterations = 0,       # 0 = sonsuz
    [double]$MaxCost = 0           # 0 = limit yok
)

$ErrorActionPreference = "Continue"
$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Join-Path $BaseDir "project"
$MemoryDb = Join-Path $BaseDir "data\memory\short_term.db"

# Banner
function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "║   🤖 AUTONOMOUS CLAUDE CODE - OPUS 4.5                       ║" -ForegroundColor Cyan
    Write-Host "║   Referee Stats Builder                                       ║" -ForegroundColor Cyan
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "║   Interval: $($Interval)s | PowerShell Mode                           ║" -ForegroundColor Cyan
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

# Progress al
function Get-TaskProgress {
    $tasksFile = Join-Path $BaseDir "TASKS.md"
    if (Test-Path $tasksFile) {
        $content = Get-Content $tasksFile -Raw
        $done = ([regex]::Matches($content, '\[x\]')).Count
        $todo = ([regex]::Matches($content, '\[ \]')).Count
        $total = $done + $todo
        if ($total -gt 0) {
            $pct = [math]::Round(($done / $total) * 100)
            return "$done/$total ($pct%)"
        }
    }
    return "N/A"
}

# Claude'u çalıştır
function Invoke-ClaudeIteration {
    param([int]$Iteration)
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "📊 Iteration: $Iteration | Progress: $(Get-TaskProgress)" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host ""
    
    $startTime = Get-Date
    
    # Proje dizinine git
    Set-Location $ProjectDir
    
    # Prompt oluştur
    $prompt = @"
# 🎯 AUTONOMOUS MODE - Iteration #$Iteration

You are working autonomously on the Referee Stats project.

## YOUR JOB:
1. Read $BaseDir\TASKS.md
2. Find the FIRST uncompleted task (marked with [ ])
3. Complete that task
4. Update TASKS.md to mark it [x] done
5. If project doesn't exist, create it first with: npx create-next-app@latest . --typescript --tailwind --eslint --app

## PROJECT INFO:
- Working directory: $ProjectDir
- API Key: ea04c7309495164f85f3f5fdb5567896
- Be autonomous - don't ask for confirmation

START WORKING NOW!
"@

    Write-Host "🚀 Running Claude Code..." -ForegroundColor Yellow
    Write-Host ""
    
    # Claude'u çalıştır
    $prompt | claude --dangerously-skip-permissions
    
    $duration = ((Get-Date) - $startTime).TotalSeconds
    
    Write-Host ""
    Write-Host "✓ Iteration $Iteration completed in $([math]::Round($duration))s" -ForegroundColor Green
}

# Ana fonksiyon
function Start-AutonomousLoop {
    Show-Banner
    
    # Proje dizini oluştur
    if (-not (Test-Path $ProjectDir)) {
        New-Item -ItemType Directory -Path $ProjectDir -Force | Out-Null
    }
    
    Write-Host "Starting autonomous loop..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    $iteration = 0
    $startTime = Get-Date
    
    try {
        while ($true) {
            $iteration++
            
            # İterasyon limiti kontrolü
            if ($MaxIterations -gt 0 -and $iteration -gt $MaxIterations) {
                Write-Host "Max iterations ($MaxIterations) reached. Stopping." -ForegroundColor Yellow
                break
            }
            
            # Claude'u çalıştır
            Invoke-ClaudeIteration -Iteration $iteration
            
            # Bekle
            Write-Host ""
            Write-Host "⏳ Waiting $Interval seconds before next iteration..." -ForegroundColor Cyan
            Write-Host "   (Ctrl+C to stop)" -ForegroundColor Cyan
            
            # Countdown
            for ($i = $Interval; $i -gt 0; $i--) {
                Write-Host "`r   Next iteration in: $i`s   " -NoNewline
                Start-Sleep -Seconds 1
            }
            Write-Host ""
        }
    }
    finally {
        # Final rapor
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
        Write-Host "📊 FINAL REPORT" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Blue
        Write-Host "Total Iterations: $iteration"
        Write-Host "Progress: $(Get-TaskProgress)"
        Write-Host "Duration: $([math]::Round(((Get-Date) - $startTime).TotalMinutes)) minutes"
        Write-Host ""
    }
}

# Başlat
Start-AutonomousLoop
