const ipc = require('electron').ipcRenderer;
const $ = require('jquery');

var isNextEnabled = false
var isPreviousEnabled = false
var song = null

document.addEventListener('DOMContentLoaded', () => {

    console.log('tray dom ready')

    $('#previous').on('click', function () {
        if (isPreviousEnabled)
            ipc.send('FROM_TRAY', { 'type': 'MEDIA_CONTROL', 'data': 'PREVIOUS' })
    })

    $('#playPause').on('click', function () {
        ipc.send('FROM_TRAY', { 'type': 'MEDIA_CONTROL', 'data': 'PLAY_OR_PAUSE' })
    })

    $('#next').on('click', function () {
        if (isNextEnabled)
            ipc.send('FROM_TRAY', { 'type': 'MEDIA_CONTROL', 'data': 'NEXT' })
    })

    $('#repeat').on('click', function () {
        ipc.send('FROM_TRAY', { 'type': 'MEDIA_CONTROL', 'data': 'REPEAT' })
    })

    $('#shuffle').on('click', function () {
        ipc.send('FROM_TRAY', { 'type': 'MEDIA_CONTROL', 'data': 'SHUFFLE' })
    })

    $('#download').on('click', function () {
        if (song)
            ipc.send('FROM_TRAY', { 'type': 'DOWNLOAD', 'data': htmlEntityDecode(song.title) + '-' + htmlEntityDecode(song.album) + '.mp3' })
    })

    $('#album-cover').on('click', function(){
        ipc.send('TO_MAIN',{'type': 'SHOW_MAIN_WINDOW'})
    })

})

function htmlEntityDecode(str) {
    str = str.replace(/&quot;/gi, '"');
    str = str.replace(/&amp;#039;/gi, "'");
    str = str.replace(/&#039;/gi, "'");
    return str
};

ipc.on('TO_TRAY', (event, data) => {
    console.log(data)
    switch (data.type) {
        case 'ACTION':
            switch (data.action) {
                case 'PLAY_SONG':
                    $('.album-image').each((index, elem) => {
                        $(elem).attr('src', data.song.image_url)
                    })
                    song = data.song
                    $('#title').text(htmlEntityDecode(data.song.title))
                    $('#album').text(htmlEntityDecode(data.song.album))
                    $('#play').css('visibility', 'hidden')
                    $('#pause').css('visibility', 'visible')
                    break;
                case 'PAUSE_SONG':
                    $('#play').css('visibility', 'visible')
                    $('#pause').css('visibility', 'hidden')
                    break;
                case 'RESUME_SONG':
                    $('#play').css('visibility', 'hidden')
                    $('#pause').css('visibility', 'visible')
                    break;
            }
            break;
        case 'CONTROLS_STATE':
            switch (data.control) {
                case 'PREVIOUS':
                    isPreviousEnabled = data.state
                    if (isPreviousEnabled)
                        $('#previous').removeClass('disabled');
                    else
                        $('#previous').addClass('disabled');
                    break;
                case 'NEXT':
                    isNextEnabled = data.state
                    if (isNextEnabled) $('#next').removeClass('disabled'); else $('#next').addClass('disabled');
                    break;
                case 'SHUFFLE':
                    if (data.state)
                        $('#shuffle').css('opacity', '1')
                    else
                        $('#shuffle').css('opacity', '0.45')
                    break;
                case 'REPEAT':
                    if (data.state === 'SINGLE') {
                        $('#repeat').attr('src', './images/repeat_one.png')
                        $('#repeat').css('opacity', '1')
                    } else if (data.state === 'PLAYLIST') {
                        $('#repeat').attr('src', './images/repeat.png')
                        $('#repeat').css('opacity', '1')
                    } else {
                        $('#repeat').attr('src', './images/repeat.png')
                        $('#repeat').css('opacity', '0.45')
                    }
                    break;
            }
            break;
    }

})