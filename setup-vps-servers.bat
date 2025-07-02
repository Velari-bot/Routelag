@echo off
echo ========================================
echo    Routelag VPS Server Setup Helper
echo ========================================
echo.

echo This script will help you set up your 5 Routelag VPS servers.
echo.
echo Please have your server IP addresses ready:
echo - Routelag Atlanta
echo - Routelag Chicago  
echo - Routelag Dallas
echo - Routelag LA
echo - Routelag NYC
echo.

set /p atlanta_ip="Enter Atlanta server IP: "
set /p chicago_ip="Enter Chicago server IP: "
set /p dallas_ip="Enter Dallas server IP: "
set /p la_ip="Enter LA server IP: "
set /p nyc_ip="Enter NYC server IP: "

echo.
echo Updating VPS configuration files...

REM Update the VPS configuration files with actual IPs
powershell -Command "(Get-Content 'backend\vps\vps-opt1.json') -replace 'YOUR_ATLANTA_SERVER_IP_HERE', '%atlanta_ip%' | Set-Content 'backend\vps\vps-opt1.json'"
powershell -Command "(Get-Content 'backend\vps\vps-mid.json') -replace 'YOUR_CHICAGO_SERVER_IP_HERE', '%chicago_ip%' | Set-Content 'backend\vps\vps-mid.json'"
powershell -Command "(Get-Content 'backend\vps\vps-central.json') -replace 'YOUR_DALLAS_SERVER_IP_HERE', '%dallas_ip%' | Set-Content 'backend\vps\vps-central.json'"
powershell -Command "(Get-Content 'backend\vps\vps-west.json') -replace 'YOUR_LA_SERVER_IP_HERE', '%la_ip%' | Set-Content 'backend\vps\vps-west.json'"
powershell -Command "(Get-Content 'backend\vps\vps-east.json') -replace 'YOUR_NYC_SERVER_IP_HERE', '%nyc_ip%' | Set-Content 'backend\vps\vps-east.json'"

echo Configuration files updated successfully!
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
echo    ping %atlanta_ip%
echo    ping %chicago_ip%
echo    ping %dallas_ip%
echo    ping %la_ip%
echo    ping %nyc_ip%
echo.
echo 4. Start the Routelag app and test server selection
echo.
echo For detailed instructions, see VPS_DEPLOYMENT_GUIDE.md
echo.
pause 