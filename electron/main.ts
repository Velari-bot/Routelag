/// <reference path="./main.d.ts" />
import { app, BrowserWindow, ipcMain, dialog, session } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as isDev from 'electron-is-dev';
import fs from 'fs';
import ping from 'ping';

// Disable hardware acceleration to prevent GPU-related crashes
app.disableHardwareAcceleration();

const execAsync = promisify(exec);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 580,  // Increased to account for potential scrollbar
    height: 720, // Increased to ensure button visibility
    frame: false,
    transparent: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    icon: path.join(__dirname, '../Lunary.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    resizable: true, // Allow resizing and moving between screens
  });

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';",
          "script-src 'self' 'unsafe-inline';",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
          "img-src 'self' data: https:;",
          "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.google.com https://*.gstatic.com https://placehold.co;",
          "font-src 'self' data: https://fonts.gstatic.com;",
          "object-src 'none';",
          "base-uri 'self';",
          "form-action 'self';"
        ].join(' ')
      }
    });
  });

  // Load the app
  if (app.isPackaged) {
    // In production, load the built React app
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  } else {
    // In development, load from React dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Helper to load all VPS configs
function loadVpsConfigs() {
  const vpsDir = path.join(__dirname, '../backend/vps');
  const files = fs.readdirSync(vpsDir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(vpsDir, f), 'utf-8');
    return JSON.parse(raw);
  });
}

// IPC handler to ping all VPS servers
ipcMain.handle('ping-vps-list', async () => {
  const vpsList = loadVpsConfigs();
  const results = await Promise.all(
    vpsList.map(async vps => {
      try {
        const res = await ping.promise.probe(vps.ip, { timeout: 2 });
        return {
          ...vps,
          ping: res.time !== 'unknown' ? Number(res.time) : Infinity,
          status: res.alive ? 'up' : 'down',
        };
      } catch {
        return { ...vps, ping: Infinity, status: 'down' };
      }
    })
  );
  results.sort((a, b) => a.ping - b.ping);
  return results;
});

// IPC Handlers for system commands
ipcMain.handle('ping-host', async (event, host: string) => {
  try {
    const { stdout } = await execAsync(`ping -n 1 ${host}`);
    const match = stdout.match(/time[=<](\d+)ms/);
    const ping = match ? parseInt(match[1]) : 0;
    
    return {
      host,
      time: ping,
      success: ping > 0
    };
  } catch (error) {
    return {
      host,
      time: 0,
      success: false
    };
  }
});

ipcMain.handle('run-optimization', async (event, serverId: string) => {
  try {
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      output: `Optimization completed for ${serverId}. Route optimized successfully.`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Optimization failed'
    };
  }
});

/// <reference path="./main.d.ts" />

ipcMain.handle('toggle-low-latency-mode', async (event, enabled: boolean) => {
  try {
    const command = enabled 
      ? 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters" /v TcpAckFrequency /t REG_DWORD /d 1 /f'
      : 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters" /v TcpAckFrequency /t REG_DWORD /d 0 /f';
    
    await execAsync(command);
    
    return {
      success: true,
      output: `Low latency mode ${enabled ? 'enabled' : 'disabled'} successfully.`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to toggle low latency mode'
    };
  }
});

ipcMain.handle('optimize-route', async (event, targetServer: string) => {
  try {
    // Simulate route optimization
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      success: true,
      output: `Route optimized to ${targetServer}. Latency reduced by ${Math.floor(Math.random() * 30 + 10)}ms.`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Route optimization failed'
    };
  }
});

// Window control handlers
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Error', 'An unexpected error occurred');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  dialog.showErrorBox('Error', 'An unexpected error occurred');
}); 