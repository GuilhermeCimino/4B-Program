const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process'); // Recurso para rodar comandos de terminal de fundo

let servidorProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  win.loadFile(path.join(__dirname, 'home.html'));
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  // 1. Inicia o servidor backend automaticamente de fundo antes de abrir a janela
  // O comando "node server.js" roda dentro da pasta backend de forma relativa
  servidorProcess = exec('node server.js', { cwd: path.join(__dirname, 'backend') }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao iniciar o servidor de fundo: ${error}`);
      return;
    }
  });

  // Aguarda 1 segundo rapidinho para dar tempo da API levantar e então abre a janela
  setTimeout(() => {
    createWindow();
  }, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 2. MUITO IMPORTANTE: Quando o app do Electron fechar, mata o processo do servidor backend
// Se não fizermos isso, a API continua rodando presa na memória do PC infinitamente!
app.on('window-all-closed', () => {
  if (servidorProcess) {
    servidorProcess.kill(); 
  }
  if (process.platform !== 'darwin') app.quit();
});