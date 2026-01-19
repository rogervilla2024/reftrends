# Windows Task Scheduler Cron Job Setup Script
# Run this script as Administrator to create the daily sync task

$taskName = "RefTrends-DailySync"
$taskPath = "C:\Users\onurm\.claude\projects\autonomous-referee-stats\project\scripts\daily-sync.bat"
$description = "Daily sync of referee statistics from API Football for RefTrends"

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Task '$taskName' already exists. Removing..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create action
$action = New-ScheduledTaskAction -Execute $taskPath

# Create trigger - Daily at 6:00 AM
$trigger = New-ScheduledTaskTrigger -Daily -At 6:00AM

# Create settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Register the task
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description $description

Write-Host ""
Write-Host "Task '$taskName' created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Schedule: Daily at 6:00 AM" -ForegroundColor Cyan
Write-Host "Script: $taskPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run manually: npm run sync:daily" -ForegroundColor Yellow
Write-Host "To view logs: Check the logs/sync.log file" -ForegroundColor Yellow
