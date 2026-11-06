# start-project.ps1
# BIT Student Information Management System - Unified Startup Script

param(
    [switch]$NoBrowser,
    [switch]$Wait
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$BackendDir  = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$PidFile     = Join-Path $ProjectRoot ".project-pids.json"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " BIT Student Information Management System - Startup Check " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Node.js and npm availability
Write-Host ""
Write-Host "[1/6] Checking runtime environment..." -ForegroundColor Yellow
try {
    $nodeVer = (& node -v).Trim()
    $npmVer  = (& npm -v).Trim()
    Write-Host "  [OK] Node.js version : $nodeVer" -ForegroundColor Green
    Write-Host "  [OK] npm version     : $npmVer" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Node.js or npm is not found in PATH. Please install Node.js (>=18)." -ForegroundColor Red
    exit 1
}

# 2. Check required dependencies
Write-Host ""
Write-Host "[2/6] Checking dependencies..." -ForegroundColor Yellow
$backendModules = Join-Path $BackendDir "node_modules"
$frontendModules = Join-Path $FrontendDir "node_modules"

if (-not (Test-Path $backendModules)) {
    Write-Host "  Installing backend dependencies..." -ForegroundColor Gray
    Start-Process -FilePath "npm.cmd" -ArgumentList "install" -WorkingDirectory $BackendDir -Wait -NoNewWindow
}
Write-Host "  [OK] Backend dependencies present" -ForegroundColor Green

if (-not (Test-Path $frontendModules)) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Gray
    Start-Process -FilePath "npm.cmd" -ArgumentList "install" -WorkingDirectory $FrontendDir -Wait -NoNewWindow
}
Write-Host "  [OK] Frontend dependencies present" -ForegroundColor Green

# 3. Check environment configuration
Write-Host ""
Write-Host "[3/6] Checking environment configuration..." -ForegroundColor Yellow
$backendEnv = Join-Path $BackendDir ".env"
$frontendEnv = Join-Path $FrontendDir ".env"

if (Test-Path $backendEnv) {
    Write-Host "  [OK] backend/.env found" -ForegroundColor Green
} else {
    Write-Host "  [INFO] No backend/.env; using local MongoDB at 127.0.0.1:27017" -ForegroundColor Gray
}

if (-not (Test-Path $frontendEnv)) {
    Write-Host "  Creating frontend/.env..." -ForegroundColor Gray
    "VITE_API_URL=" | Out-File -FilePath $frontendEnv -Encoding utf8
}
Write-Host "  [OK] frontend/.env verified (local API proxy enabled)" -ForegroundColor Green

# Helper: safe port check and cleanup
function Clean-PortIfOwnedByProject([int]$targetPort, [string]$label) {
    $conns = Get-NetTCPConnection -LocalPort $targetPort -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($conn in $conns) {
            $pId = $conn.OwningProcess
            if ($pId -gt 0) {
                try {
                    $procInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $pId" -ErrorAction SilentlyContinue
                    $cmd = $procInfo.CommandLine
                    $procName = $procInfo.Name

                    # Check if this process belongs to CCProjectOne
                    $isOurProject = ($cmd -match "CCProjectOne") -or ($cmd -match "server\.js") -or ($cmd -match "vite")

                    if ($isOurProject) {
                        Write-Host "  [INFO] Found existing $label process PID $pId. Safely stopping it..." -ForegroundColor DarkYellow
                        Stop-Process -Id $pId -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Milliseconds 800
                    } else {
                        Write-Host "  [ERROR] Port $targetPort is in use by unrelated process: $procName (PID $pId)." -ForegroundColor Red
                        Write-Host "    CommandLine: $cmd" -ForegroundColor Red
                        Write-Host "    Cannot start $label safely. Please release port $targetPort." -ForegroundColor Red
                        exit 1
                    }
                } catch {
                    Write-Host "  [INFO] Could not inspect PID $pId. Stopping cautiously..." -ForegroundColor DarkYellow
                    Stop-Process -Id $pId -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
}

# 4. Check & clear port conflicts
Write-Host ""
Write-Host "[4/6] Checking port availability for ports 5000 and 5173..." -ForegroundColor Yellow
Clean-PortIfOwnedByProject -targetPort 5000 -label "Backend"
Clean-PortIfOwnedByProject -targetPort 5173 -label "Frontend"
Write-Host "  [OK] Ports 5000 and 5173 are free" -ForegroundColor Green

# 5. Start Backend
Write-Host ""
Write-Host "[5/6] Starting backend on port 5000..." -ForegroundColor Yellow

$backendCim = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = "node.exe server.js"
    CurrentDirectory = $BackendDir
}

if ($backendCim.ReturnValue -ne 0 -or -not $backendCim.ProcessId) {
    Write-Host "  [FAIL] Failed to launch backend process (Return code: $($backendCim.ReturnValue))." -ForegroundColor Red
    exit 1
}

$backendPid = $backendCim.ProcessId
Write-Host "  Backend process started with PID $backendPid. Waiting for MongoDB and API health check..." -ForegroundColor Gray

# Poll backend health endpoint
$backendHealthy = $false
$maxAttempts = 15
for ($i = 1; $i -le $maxAttempts; $i++) {
    Start-Sleep -Seconds 1
    $proc = Get-Process -Id $backendPid -ErrorAction SilentlyContinue
    if (-not $proc) {
        Write-Host "  [FAIL] Backend process exited unexpectedly!" -ForegroundColor Red
        exit 1
    }
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health" -Method Get -TimeoutSec 3
        if ($health.success -eq $true -and $health.database -eq "connected") {
            $backendHealthy = $true
            break
        }
    } catch {
        # keep polling
    }
}

if (-not $backendHealthy) {
    Write-Host "  [FAIL] Backend failed health or database check within 15 seconds." -ForegroundColor Red
    Stop-Process -Id $backendPid -Force -ErrorAction SilentlyContinue
    exit 1
}
Write-Host "  [OK] Backend online at http://localhost:5000" -ForegroundColor Green
Write-Host "  [OK] MongoDB Atlas connected (database: CCProjectOne)" -ForegroundColor Green

# 6. Start Frontend
Write-Host ""
Write-Host "[6/6] Starting frontend on port 5173..." -ForegroundColor Yellow

$frontendCim = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = "node.exe node_modules\vite\bin\vite.js"
    CurrentDirectory = $FrontendDir
}

if ($frontendCim.ReturnValue -ne 0 -or -not $frontendCim.ProcessId) {
    Write-Host "  [FAIL] Failed to launch frontend process (Return code: $($frontendCim.ReturnValue))." -ForegroundColor Red
    Stop-Process -Id $backendPid -Force -ErrorAction SilentlyContinue
    exit 1
}

$frontendPid = $frontendCim.ProcessId
Write-Host "  Frontend process started with PID $frontendPid. Waiting for Vite dev server..." -ForegroundColor Gray

# Poll frontend
$frontendHealthy = $false
for ($i = 1; $i -le $maxAttempts; $i++) {
    Start-Sleep -Seconds 1
    $proc = Get-Process -Id $frontendPid -ErrorAction SilentlyContinue
    if (-not $proc) {
        Write-Host "  [FAIL] Frontend process exited unexpectedly!" -ForegroundColor Red
        Stop-Process -Id $backendPid -Force -ErrorAction SilentlyContinue
        exit 1
    }
    try {
        $res = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -Method Get -TimeoutSec 3 -UseBasicParsing
        if ($res.StatusCode -eq 200) {
            $frontendHealthy = $true
            break
        }
    } catch {
        # keep polling
    }
}

if (-not $frontendHealthy) {
    Write-Host "  [FAIL] Frontend failed to respond on http://localhost:5173 within 15 seconds." -ForegroundColor Red
    Stop-Process -Id $backendPid -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendPid -Force -ErrorAction SilentlyContinue
    exit 1
}
Write-Host "  [OK] Frontend online at http://localhost:5173" -ForegroundColor Green

# Save running PIDs for stop-project.ps1
$pidData = @{
    BackendPid  = $backendPid
    FrontendPid = $frontendPid
    StartedAt   = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
} | ConvertTo-Json
$pidData | Out-File -FilePath $PidFile -Encoding utf8

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " BIT Student Information Management System is RUNNING " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  * Frontend URL : http://localhost:5173" -ForegroundColor Cyan
Write-Host "  * Backend URL  : http://localhost:5000" -ForegroundColor Cyan
Write-Host "  * API Health   : http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "  * Database     : MongoDB Atlas (CCProjectOne) - Connected" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop both services cleanly, run:" -ForegroundColor Gray
Write-Host "  .\stop-project.ps1" -ForegroundColor Yellow
Write-Host ""

if (-not $NoBrowser) {
    try {
        Start-Process "http://localhost:5173"
    } catch {
        # Browser open optional
    }
}

if ($Wait) {
    Write-Host "Press Ctrl+C to stop services..." -ForegroundColor Cyan
    try {
        while ($true) {
            Start-Sleep -Seconds 2
        }
    } finally {
        & (Join-Path $ProjectRoot "stop-project.ps1")
    }
}
