# stop-project.ps1
# BIT Student Information Management System - Unified Shutdown Script

$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot
$PidFile     = Join-Path $ProjectRoot ".project-pids.json"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " BIT Student Information Management System - Stopping...   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Stop from recorded PID file
if (Test-Path $PidFile) {
    try {
        $pidsJson = Get-Content $PidFile -Raw | ConvertFrom-Json
        if ($pidsJson.BackendPid) {
            Write-Host "Stopping Backend process (PID $($pidsJson.BackendPid))..." -ForegroundColor Yellow
            Stop-Process -Id $pidsJson.BackendPid -Force -ErrorAction SilentlyContinue
        }
        if ($pidsJson.FrontendPid) {
            Write-Host "Stopping Frontend process (PID $($pidsJson.FrontendPid))..." -ForegroundColor Yellow
            Stop-Process -Id $pidsJson.FrontendPid -Force -ErrorAction SilentlyContinue
        }
    } catch {
        Write-Host "Warning: Could not parse $PidFile." -ForegroundColor DarkYellow
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

# 2. Inspect ports 5000 and 5173 for any remaining project processes
function Stop-PortIfProject([int]$port, [string]$label) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToInspect = $conn.OwningProcess
            if ($pidToInspect -gt 0) {
                try {
                    $procInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $pidToInspect" -ErrorAction SilentlyContinue
                    $cmd = $procInfo.CommandLine
                    $isOurProject = ($cmd -match "CCProjectOne") -or ($cmd -match "server\.js") -or ($cmd -match "vite")
                    if ($isOurProject) {
                        Write-Host "Stopping residual $label process (PID $pidToInspect)..." -ForegroundColor Yellow
                        Stop-Process -Id $pidToInspect -Force -ErrorAction SilentlyContinue
                    }
                } catch {
                    # Ignore
                }
            }
        }
    }
}

Stop-PortIfProject -port 5000 -label "Backend"
Stop-PortIfProject -port 5173 -label "Frontend"

Start-Sleep -Milliseconds 800

# 3. Verify ports are released
$still5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
$still5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue

if ($still5000) {
    Write-Host "Warning: Port 5000 is still occupied by PID $($still5000.OwningProcess)." -ForegroundColor Red
} else {
    Write-Host "  [OK] Port 5000 is free." -ForegroundColor Green
}

if ($still5173) {
    Write-Host "Warning: Port 5173 is still occupied by PID $($still5173.OwningProcess)." -ForegroundColor Red
} else {
    Write-Host "  [OK] Port 5173 is free." -ForegroundColor Green
}

Write-Host "`nAll BIT Student Information Management System services have been stopped." -ForegroundColor Green
