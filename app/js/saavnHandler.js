const ipc = require('electron').ipcRenderer

const webview = document.getElementById('saavnView') 

webview.addEventListener('dom-ready', function () {
    //webview.openDevTools()
})

webview.addEventListener('new-window', (e) => {
    webview.src = e.url;
})

ipc.on('GLOBAL_SHORTCUT', (event, arg) => {
    var msg = `message from main : ${arg}`
    //console.log(msg)
    switch (arg) {
        case 'MediaPlayPause':
            webview.executeJavaScript('Player.isPlayerPlaying() ? State.pauseSong() : State.resumeSong();')

            break;
        case 'MediaNext':
            webview.executeJavaScript('State.playNextSong();')
            break;
        case 'MediaPrevious':
            webview.executeJavaScript('State.playPreviousSong();')
            break;
        case 'Download':
            webview.executeJavaScript('Player.currentSongUrl', (url) => {
                webview.getWebContents().downloadURL(url)
            })
    }

})

ipc.on('FROM_TRAY', (event, data) => {
    //console.log(data)
    switch (data.type) {
        case 'MEDIA_CONTROL':
            switch (data.data) {
                case 'PLAY_OR_PAUSE':
                    webview.executeJavaScript("Player.isPlayerPlaying() ? State.pauseSong() : State.resumeSong();")
                    break;
                case 'NEXT':
                    webview.executeJavaScript("State.playNextSong();")
                    break;
                case 'PREVIOUS':
                    webview.executeJavaScript("State.playPreviousSong();")
                    break;
                case 'SHUFFLE':
                    webview.executeJavaScript('$("#shuffle").click();')
                    break;
                case 'REPEAT':
                    webview.executeJavaScript('$("#repeat").click();')
                    break;
            }
            break;
        case 'DOWNLOAD':
            webview.executeJavaScript('Player.currentSongUrl', (url) => {
                ipc.send('TO_MAIN', {'type': 'DOWNLOAD', 'url': url, 'fileName': data.data})
            })
            break;
    }
})

ipc.on('FROM_MAIN', (event, data) => {
    switch(data.type){
        case 'NOTIFICATION':
                new Notification(data.message)
            break;
    }
})