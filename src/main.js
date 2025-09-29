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
let widget = null;
function createWidget(weatherData) {
    if (widget) {
        widget.webContents.send('set-weather', weatherData);
        widget.focus();
    } else {
        widget = new BrowserWindow({
            width: 300,
            height: 200,
            frame: false,
            transparent: true,
            resizable: false,
            movable: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),  
                nodeIntegration: false,     
                contextIsolation: true 
            }
        });
        widget.loadFile('src/widget.html');
        widget.setAlwaysOnTop(false, 'desktop');
        widget.setFocusable(false);
        widget.webContents.on('did-finish-load', () => {
            widget.webContents.send('set-weather', weatherData);
        });
        widget.on('closed', () => {
            widget = null;
        });
    }
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