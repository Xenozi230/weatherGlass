console.log("Main start");
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')

//--------------------------------------------------
// Create the main application window
//--------------------------------------------------
function createWindow() {
    const win = new BrowserWindow({
        width: 800,     
        height: 1000,    
        transparent: false,     
        frame: true,       
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),  
            nodeIntegration: false,     
            contextIsolation: true      
        }
    })
    win.loadFile('src/index.html')
}

//--------------------------------------------------
// Create a widget window for displaying weather information
//--------------------------------------------------
function createWidget(weatherData) {
    const widget = new BrowserWindow({
        width: 300,
        height: 200,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),  
            nodeIntegration: false,     
            contextIsolation: true 
        }
    });
    widget.loadFile('src/widget.html');
    widget.webContents.on('did-finish-load', () => {
        widget.webContents.send('set-weather', weatherData);
    });
}
ipcMain.on('open-widget', (event, weatherData) => {
    createWidget(weatherData);
});


app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})
app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit()
    }
})