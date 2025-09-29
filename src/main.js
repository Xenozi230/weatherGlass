console.log("Main start");
const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let widget = null;
let tray = null;

const favoriteFilePath = path.join(app.getPath('userData'), 'favorites.json');
let favorites = [];

function ensureDataPath() {
    const dir = path.dirname(favoriteFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadFavorites() {
    ensureDataPath();
    try {
        if (fs.existsSync(favoriteFilePath)) {
            const data = fs.readFileSync(favoriteFilePath, 'utf8');
            favorites = JSON.parse(data);
        } else {
            favorites = [];
            saveFavorites(); // créer le fichier vide seulement si il n'existe pas
        }
    } catch (error) {
        console.error("Error loading favorites:", error);
        favorites = [];
    }

}

function saveFavorites() {
    ensureDataPath();
    try {
        fs.writeFileSync(favoriteFilePath, JSON.stringify(favorites, null, 2));
    } catch (error) {
        console.error("Error saving favorites:", error);
    }
}

//--------------------------------------------------
// Create the main application window
//--------------------------------------------------
function createWindow() {
    const win = new BrowserWindow({
        width: 800,     
        height: 1000,    
        transparent: true,
        frame: false,     
        icon: path.join(__dirname, 'weatherAppIcon.png'),  
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

//--------------------------------------------------
// Create Tray
//--------------------------------------------------
function createTray() {
    tray = new Tray(path.join(__dirname, 'weatherAppIcon.png'));
    tray.setToolTip('Weather Glass ');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open weather glass',
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
                    widget.close();
                    widget = null;
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

ipcMain.handle('get-favorites', async () => {
    return favorites;
});
ipcMain.handle('set-favorites', async (event, favs) => {
    favorites = favs;
    saveFavorites();
    return favorites;
});

app.whenReady().then(() => {
    loadFavorites();
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