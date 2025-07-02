@echo off
REM deploy-windows.bat
REM Deploy application updates to all servers (Windows version)

echo 🚀 Deploying Routelag to all servers...

REM List of all servers
set SERVERS=routelag-na-east-1 routelag-na-central routelag-na-mid routelag-na-relay1 routelag-na-opt1 routelag-na-west routelag-eu-west routelag-eu-central routelag-eu-east routelag-eu-north

for %%s in (%SERVERS%) do (
    echo 📦 Deploying to %%s...
    
    REM Copy application files using rsync (requires WSL or Git Bash)
    rsync -avz --exclude 'node_modules' --exclude '.git' ./backend/ routelag@%%s:/opt/routelag/
    
    REM SSH into server and restart services
    ssh routelag@%%s "cd /opt/routelag && npm install --production && pm2 reload all && echo ✅ %%s deployment complete"
)

echo 🎉 All deployments complete!
pause 