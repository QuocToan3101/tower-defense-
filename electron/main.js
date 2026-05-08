const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ════════════════════════════════════════════════════════════════════
//  LOGGING SYSTEM - Works in both dev and production
// ════════════════════════════════════════════════════════════════════

class ElectronLogger {
  constructor() {
    this.logDir = path.join(os.homedir(), '.towerdefense', 'logs');
    this.ensureLogDir();
    this.logFile = path.join(this.logDir, `app-${new Date().toISOString().slice(0, 10)}.log`);
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}${data ? '\n' + JSON.stringify(data) : ''}\n`;
    
    // Console output
    const consoleMethod = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    consoleMethod(`${level}: ${message}`, data || '');
    
    // File output
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (e) {
      console.error('Failed to write log file:', e);
    }
  }

  info(msg, data) { this.log('INFO', msg, data); }
  warn(msg, data) { this.log('WARN', msg, data); }
  error(msg, data) { this.log('ERROR', msg, data); }
}

const logger = new ElectronLogger();

// Log uncaught exceptions in main process
process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION', { 
    message: error.message, 
    stack: error.stack 
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION', { reason });
});

// ════════════════════════════════════════════════════════════════════
//  PATH RESOLUTION - Production-safe path finding
// ════════════════════════════════════════════════════════════════════

function getPaths() {
  const isPackaged = app.isPackaged;
  const isDev = !isPackaged;
  
  logger.info('App context', { 
    isPackaged,
    isDev,
    __dirname: __dirname,
    appPath: app.getAppPath(),
    resourcesPath: process.resourcesPath,
    execPath: process.execPath
  });

  // Production: app is packaged in ASAR or unpacked
  if (isPackaged) {
    const appPath = app.getAppPath();
    return {
      root: appPath,
      frontend: path.join(appPath, 'frontend'),
      indexHtml: path.join(appPath, 'frontend', 'index.html'),
      preload: path.join(appPath, 'electron', 'preload.js')
    };
  }

  // Development: running from source
  return {
    root: path.join(__dirname, '..'),
    frontend: path.join(__dirname, '..', 'frontend'),
    indexHtml: path.join(__dirname, '..', 'frontend', 'index.html'),
    preload: path.join(__dirname, 'preload.js')
  };
}

// ════════════════════════════════════════════════════════════════════
//  RESOURCE VALIDATION
// ════════════════════════════════════════════════════════════════════

function validateResources(paths) {
  const required = [
    { name: 'index.html', path: paths.indexHtml },
    { name: 'preload.js', path: paths.preload },
    { name: 'frontend/css/style.css', path: path.join(paths.frontend, 'css', 'style.css') },
    { name: 'frontend/js/main.js', path: path.join(paths.frontend, 'js', 'main.js') }
  ];

  const missing = required.filter(r => !fs.existsSync(r.path));
  
  if (missing.length > 0) {
    const errors = missing.map(m => `  ❌ ${m.name} (${m.path})`).join('\n');
    logger.error('MISSING RESOURCES', { 
      count: missing.length,
      missing: errors,
      checkedPaths: required.map(r => ({ name: r.name, exists: fs.existsSync(r.path) }))
    });
    return { valid: false, errors: missing };
  }

  logger.info('✅ All resources validated');
  return { valid: true, errors: [] };
}

// ════════════════════════════════════════════════════════════════════
//  WINDOW WITH ERROR FALLBACK
// ════════════════════════════════════════════════════════════════════

let mainWindow = null;
let isWindowReady = false;

function createWindow() {
  logger.info('📦 Creating BrowserWindow...');
  
  const paths = getPaths();
  const validation = validateResources(paths);

  if (!validation.valid) {
    logger.error('❌ RESOURCE VALIDATION FAILED - will show error page');
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: paths.preload,
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: true,
      webSecurity: true
    }
  });

  // Load main page or error fallback
  if (validation.valid && fs.existsSync(paths.indexHtml)) {
    logger.info(`📄 Loading index.html from: ${paths.indexHtml}`);
    mainWindow.loadFile(paths.indexHtml);
  } else {
    logger.error('❌ Cannot load index.html - showing error page');
    const errorHtml = getErrorFallbackHtml(validation, paths);
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
  }

  // Event handlers
  mainWindow.webContents.on('did-finish-load', () => {
    logger.info('✅ Page content loaded successfully');
    isWindowReady = true;
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    logger.error('❌ Page load FAILED', {
      errorCode,
      errorDescription,
      url: validatedURL
    });
  });

  mainWindow.webContents.on('crashed', () => {
    logger.error('❌ RENDERER PROCESS CRASHED!');
    dialog.showErrorBox('Render Process Crashed', 'The application renderer has crashed. Please restart the app.');
  });

  mainWindow.webContents.on('unresponsive', () => {
    logger.warn('⚠️ Renderer process is unresponsive');
  });

  // Handle CSS/JS load errors from renderer
  ipcMain.on('log-renderer-error', (event, errorData) => {
    logger.error('❌ RENDERER ERROR', errorData);
  });

  ipcMain.on('log-renderer-info', (event, data) => {
    logger.info('📊 Renderer Info', data);
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    logger.info('🛠️ Opening DevTools (development mode)');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    logger.info('✨ Window ready to show');
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    logger.info('🔌 Main window closed');
  });

  return mainWindow;
}

// ════════════════════════════════════════════════════════════════════
//  ERROR FALLBACK HTML
// ════════════════════════════════════════════════════════════════════

function getErrorFallbackHtml(validation, paths) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Application Error</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
      color: #e0e0e0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .error-container {
      background: rgba(20, 20, 35, 0.9);
      border: 2px solid #ff6b6b;
      border-radius: 12px;
      padding: 40px;
      max-width: 600px;
      box-shadow: 0 0 30px rgba(255, 107, 107, 0.3);
    }
    h1 {
      color: #ff6b6b;
      margin-bottom: 20px;
      font-size: 28px;
    }
    .error-section {
      margin: 20px 0;
      padding: 15px;
      background: rgba(255, 107, 107, 0.05);
      border-left: 4px solid #ff6b6b;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      overflow-x: auto;
    }
    .error-section strong { color: #ffb3b3; }
    .error-label { color: #ffb3b3; font-weight: bold; }
    .error-value { color: #e0e0e0; margin-top: 5px; }
    .fix-steps {
      background: rgba(76, 175, 80, 0.05);
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .fix-steps h3 { color: #4caf50; margin-bottom: 10px; }
    .fix-steps ol { margin-left: 20px; }
    .fix-steps li { margin: 8px 0; }
    button {
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 20px;
    }
    button:hover { background: #ff5252; }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>⚠️ Application Error</h1>
    
    <p style="margin-bottom: 20px;">Tower Defense encountered a startup error. This is usually a configuration or missing file issue.</p>

    <div class="error-section">
      <strong>❌ Missing Resources</strong>
      <div class="error-value">
        ${validation.errors.length === 0 ? 'No missing resources detected' : 
          validation.errors.map(e => `<div>• ${e.name} → ${e.path}</div>`).join('')}
      </div>
    </div>

    <div class="error-section">
      <strong>📍 System Information</strong>
      <div class="error-label">App Path:</div>
      <div class="error-value">${paths.root}</div>
      <div class="error-label">Frontend Path:</div>
      <div class="error-value">${paths.frontend}</div>
      <div class="error-label">Index HTML:</div>
      <div class="error-value">${paths.indexHtml}</div>
    </div>

    <div class="fix-steps">
      <h3>✓ How to Fix</h3>
      <ol>
        <li>Ensure all game files were copied during installation</li>
        <li>Try reinstalling the application</li>
        <li>Check that Windows doesn't have the app quarantined (antivirus)</li>
        <li>Check error logs in: <code>%USERPROFILE%\\.towerdefense\\logs</code></li>
      </ol>
    </div>

    <button onclick="location.reload()">Retry</button>
  </div>

  <script>
    // Log this error to main process
    const errorInfo = {
      timestamp: new Date().toISOString(),
      type: 'STARTUP_ERROR',
      userAgent: navigator.userAgent,
      resourcesValid: ${!validation.valid},
      missingCount: ${validation.errors.length}
    };
    console.error('Startup Error:', errorInfo);
  </script>
</body>
</html>
  `;
}

// ════════════════════════════════════════════════════════════════════
//  APP LIFECYCLE
// ════════════════════════════════════════════════════════════════════

app.on('ready', () => {
  logger.info('🚀 Electron app ready event triggered');
  createWindow();
});

app.on('window-all-closed', () => {
  logger.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    logger.info('App activated, recreating window');
    createWindow();
  }
});

// Handle any app errors
app.on('render-process-gone', (event, details) => {
  logger.error('Render process gone', details);
});

logger.info('═══════════════════════════════════════════════');
logger.info('🎮 Tower Defense Electron App Initialized');
logger.info(`Version: ${require('./package.json').version}`);
logger.info(`Packaged: ${app.isPackaged}`);
logger.info(`Node Env: ${process.env.NODE_ENV || 'production'}`);
logger.info('═══════════════════════════════════════════════');

app.on('uncaught-exception', (error) => {
  console.error('🔥 Uncaught exception:', error);
});
