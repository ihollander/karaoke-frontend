// let player

// // wait to call this after first video is loaded?
// function initPlayerCode() {
//   // load the API script code
//   const tag = document.createElement('script')
//   tag.src = 'https://www.youtube.com/iframe_api'
//   const firstScriptTag = document.getElementsByTagName('script')[0]
//   firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
// }

// function onYouTubeIframeAPIReady() {
//   player = new YT.Player('player', {
//     height: '390',
//     width: '640',
//     events: {
//       'onStateChange': onPlayerStateChange
//     }
//   })
// }

// function onPlayerStateChange(event) {
//   // set current video as played
//   if (event.data == 0) {
//     Playlist.currentVideo.played = true
//     // play next video
//     if (Playlist.currentVideo) {
//       player.loadVideoById({
//         videoId: Playlist.currentVideo.song.youtube_id,
//         suggestedQuality: 'large'
//       })
//     }
//   }
// }


document.addEventListener('DOMContentLoaded', e => {
  const currentUrl = new URL(window.location.href)
  const roomId = currentUrl.searchParams.get("id")
  const controller = new DOMController()
  controller.initJQueryElements()

  //create the room when page is loaded
  Room.findOrCreate(roomId) // findOrCreate to test with sample data
    .then(() => {
      window.history.pushState("", "", `${location.origin}${location.pathname}?id=${Room.current.id}`)
      User.init()
        .then(() => {
          if (User.all.length) {
            controller.overlay.classList.add('hidden')
          }
          controller.renderUsers()
          Playlist.init()
            .then(() => {
              if (Playlist.all.length) {
                controller.initPlayer()
                Playlist.sort()
                Playlist.currentVideo = Playlist.all[0]
                controller.renderPlaylist()
              }
            })
        })
      Song.init()
      
    })

  
})