const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.version[type])
    }
})

contextBridge.exposeInMainWorld("electronAPI", {
    openWidget: (weatherData) => ipcRenderer.send('open-widget', weatherData),
    onSetWeather: (callback) => ipcRenderer.on('set-weather', callback),    
    getFavorites: () => ipcRenderer.invoke('get-favorites'),
    setFavorites: (favorites) => ipcRenderer.invoke('set-favorites', favorites)

});