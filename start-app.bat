@echo off
echo Starting Routelag Electron App...
echo.
echo This will:
echo 1. Build the Electron TypeScript files
echo 2. Start the React development server
echo 3. Launch the Electron app
echo.
echo Press any key to continue...
pause >nul

echo Building Electron files...
npm run build-electron

echo Starting the app...
npm run electron-dev

pause 