const ipc = require('electron').ipcRenderer

document.addEventListener('DOMContentLoaded', function () {
    // hack for reducing CPU usage by settings blur filter on img instead of SVG filter
    $("<style type='text/css'>#player-blur img, .page-header .header-fill img {filter: blur(42px);} </style>").appendTo("head");
    if (Player) {
        console.log(Player)
        injectCallbacks()
    }
})

function injectCallbacks() {
    var origPlaySong = Player.playSong
    Player.playSong = function (song, bitRate) {
        ipc.send('TO_TRAY', { 'type': 'ACTION', 'action': 'PLAY_SONG', 'song': song })
        origPlaySong(song, bitRate)
    }

    var origResumeSong = Player.resumeSong
    Player.resumeSong = function () {
        ipc.send('TO_TRAY', { 'type': 'ACTION', 'action': 'RESUME_SONG' })
        origResumeSong()
    }

    var origPauseSong = Player.pauseSong
    Player.pauseSong = function () {
        ipc.send('TO_TRAY', { 'type': 'ACTION', 'action': 'PAUSE_SONG' })
        origPauseSong()
    }

    var origHandleNextPreviousButtons = Player.handleNextPrevButtons
    Player.handleNextPrevButtons = function (button, isOn) {
        origHandleNextPreviousButtons(button, isOn)
        if (button === Player.PREVIOUS)
            ipc.send('TO_TRAY', { 'type': 'CONTROLS_STATE', 'control': 'PREVIOUS', 'state': isOn })
        else if (button === Player.NEXT)
            ipc.send('TO_TRAY', { 'type': 'CONTROLS_STATE', 'control': 'NEXT', 'state': isOn })

        ipc.send('TO_TRAY', { 'type': 'CONTROLS_STATE', 'control': 'SHUFFLE', 'state': State.shuffleMode })
        ipc.send('TO_TRAY', { 'type': 'CONTROLS_STATE', 'control': 'REPEAT', 'state': getRepeatState() })

    }

    /*var origInitPlayerUI = Player.initPlayerUI
    Player.initPlayerUI = function () {
        origInitPlayerUI()

        //we have to inject callbacks for shuffle and repeat after their click handlers have been added. so we are doing this
        var shuffleElement = $('#shuffle')[0]
        var origShuffleClick = (jQuery.hasData(shuffleElement) && jQuery._data(shuffleElement)).events.click[0].handler
        $('#shuffle').click(function () {
            origShuffleClick()
            console.log(State.shuffleMode)
            ipc.send('TO_TRAY', { 'type': 'CONTROLS_STATE', 'control': 'SHUFFLE', 'state': State.shuffleMode })
        })

        var repeatElement = $('#repeat')[0]
        var origRepeatClick = (jQuery.hasData(repeatElement) && jQuery._data(repeatElement)).events.click[0].handler
        $('#repeat').click(function () {
            origRepeatClick()
            ipc.send('TO_TRAY', { 'type': 'CONTROLS_STATE', 'control': 'REPEAT', 'state': getRepeatState() })
        })
    }*/

}

ipc.on('TO_INJECTED_HANDLER', (e) => {


})

function setDisplayNone() {
    if ($('.header-fill img')[0]) {
        console.log('not null')
        if ($('.header-fill img')[0].style.display == 'none') {
            console.log('not none')
            async(() => { console.log('async'); setDisplayNone() }, 3000)

        } else {
            $('.header-fill img')[0].style.display = 'none'
        }

    }
}

function getRepeatState() {
    if (State.singleSongLoop) return 'SINGLE'
    else if (State.playlistLoop) return 'PLAYLIST'
    else return 'NONE'
}

