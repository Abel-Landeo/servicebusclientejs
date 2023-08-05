const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1500,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegrationInWorker: true
        }
    });
    require('./server/ipcMainModule');
    win.loadFile('./web/main/main.html');
}

app.whenReady().then(() => {
    createWindow();
            
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})