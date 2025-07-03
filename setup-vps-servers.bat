@echo off
echo ========================================
echo    Routelag VPS Server Setup Helper
echo ========================================
echo.

echo This script will help you set up your 5 Routelag VPS servers.
echo.
echo Current server IP addresses:
echo - Routelag Atlanta: 144.202.25.231
echo - Routelag Chicago: 144.202.53.250
echo - Routelag Dallas: 45.32.195.106
echo - Routelag LA: 45.63.62.238
echo - Routelag NYC: 66.135.9.254
echo.

echo Do you want to update these IP addresses? (Y/N)
set /p update_choice="Enter Y to update IPs or N to keep current IPs: "

if /i "%update_choice%"=="Y" (
    echo.
    echo Please enter the new IP addresses for each server:
    echo (Press Enter to keep the current IP)
    echo.
    
    set /p atlanta_ip="Enter Atlanta server IP (current: 144.202.25.231): "
    set /p chicago_ip="Enter Chicago server IP (current: 144.202.53.250): "
    set /p dallas_ip="Enter Dallas server IP (current: 45.32.195.106): "
    set /p la_ip="Enter LA server IP (current: 45.63.62.238): "
    set /p nyc_ip="Enter NYC server IP (current: 66.135.9.254): "
    
    echo.
    echo Updating VPS configuration files...
    
    REM Update Atlanta (vps-opt1.json)
    if not "%atlanta_ip%"=="" (
        powershell -Command "(Get-Content 'backend\vps\vps-opt1.json') -replace '144.202.25.231', '%atlanta_ip%' | Set-Content 'backend\vps\vps-opt1.json'"
        echo Updated Atlanta IP to: %atlanta_ip%
    ) else (
        echo Keeping Atlanta IP as: 144.202.25.231
    )
    
    REM Update Chicago (vps-mid.json)
    if not "%chicago_ip%"=="" (
        powershell -Command "(Get-Content 'backend\vps\vps-mid.json') -replace '144.202.53.250', '%chicago_ip%' | Set-Content 'backend\vps\vps-mid.json'"
        echo Updated Chicago IP to: %chicago_ip%
    ) else (
        echo Keeping Chicago IP as: 144.202.53.250
    )
    
    REM Update Dallas (vps-central.json)
    if not "%dallas_ip%"=="" (
        powershell -Command "(Get-Content 'backend\vps\vps-central.json') -replace '45.32.195.106', '%dallas_ip%' | Set-Content 'backend\vps\vps-central.json'"
        echo Updated Dallas IP to: %dallas_ip%
    ) else (
        echo Keeping Dallas IP as: 45.32.195.106
    )
    
    REM Update LA (vps-west.json)
    if not "%la_ip%"=="" (
        powershell -Command "(Get-Content 'backend\vps\vps-west.json') -replace '45.63.62.238', '%la_ip%' | Set-Content 'backend\vps\vps-west.json'"
        echo Updated LA IP to: %la_ip%
    ) else (
        echo Keeping LA IP as: 45.63.62.238
    )
    
    REM Update NYC (vps-east.json)
    if not "%nyc_ip%"=="" (
        powershell -Command "(Get-Content 'backend\vps\vps-east.json') -replace '66.135.9.254', '%nyc_ip%' | Set-Content 'backend\vps\vps-east.json'"
        echo Updated NYC IP to: %nyc_ip%
    ) else (
        echo Keeping NYC IP as: 66.135.9.254
    )
    
    echo.
    echo Configuration files updated successfully!
) else (
    echo.
    echo Keeping current IP addresses unchanged.
)

echo.
echo ========================================
echo    Next Steps:
echo ========================================
echo.
echo 1. SSH into each of your 5 VPS servers
echo 2. Run the setup script on each server:
echo    wget -O vps-setup.sh https://raw.githubusercontent.com/your-repo/routelag/main/backend/scripts/vps-setup.sh
echo    chmod +x vps-setup.sh
echo    ./vps-setup.sh
echo.
echo 3. Test connectivity from your local machine:
echo    ping 144.202.25.231
echo    ping 144.202.53.250
echo    ping 45.32.195.106
echo    ping 45.63.62.238
echo    ping 66.135.9.254
echo.
echo 4. Start the Routelag app and test server selection
echo.
echo For detailed instructions, see VPS_DEPLOYMENT_GUIDE.md
echo.
pause 