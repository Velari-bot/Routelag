@echo off
REM health-check-windows.bat
REM Monitor all server health and services (Windows version)

echo 🏥 Routelag Server Health Check
echo ================================

REM List of all servers
set SERVERS=routelag-na-east-1 routelag-na-central routelag-na-mid routelag-na-relay1 routelag-na-opt1 routelag-na-west routelag-eu-west routelag-eu-central routelag-eu-east routelag-eu-north

for %%s in (%SERVERS%) do (
    echo Checking %%s...
    
    REM Check if server is reachable
    ping -n 1 %%s >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ %%s is reachable
        
        REM Check PM2 processes
        ssh routelag@%%s "pm2 status" 2>nul || echo ❌ PM2 not running on %%s
        
        REM Check disk space
        ssh routelag@%%s "df -h /" 2>nul || echo ❌ Cannot check disk space on %%s
        
        REM Check memory usage
        ssh routelag@%%s "free -h" 2>nul || echo ❌ Cannot check memory on %%s
        
    ) else (
        echo ❌ %%s is unreachable
    )
    
    echo ---
)

pause 