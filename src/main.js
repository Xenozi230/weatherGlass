console.log("Main start");
const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path')

let mainWindow = null;
let widget = null;
let tray = null;

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

function createTray() {
    tray = new Tray(path.join(__dirname, 'weatherAppIcon.png'));
    tray.setToolTip('Weather Glass App');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open l\'app',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                } else {
                    createWindow();
                }
            }
        },
        {
            label: 'Close Widget',
            click: () => {
                if (widget) {
                    widget.hide();
                }
            }
        },
        {type: 'separator'},
        {label: 'Quit weather glass',click: () => app.quit()}
    ]);
    tray.setContextMenu(contextMenu);
}


//--------------------------------------------------
// IPC
//--------------------------------------------------
ipcMain.on('open-widget', (event, weatherData) => {
    createWidget(weatherData);
});


app.whenReady().then(() => {
    createWindow()
    createTray()
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