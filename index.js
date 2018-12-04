// to fix...
function createVideo(containerId, videoId) {
  let youtubeScriptId = 'youtube-api'
  let youtubeScript = document.getElementById(youtubeScriptId)
  
  if (youtubeScript === null) {
    const tag = document.createElement('script')
    const firstScript = document.getElementsByTagName('script')[0]
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.id = youtubeScriptId
    firstScript.parentNode.insertBefore(tag, firstScript)
  }

  window.onYouTubeIframeAPIReady = function() {
    window.player = new window.YT.Player(containerId, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        rel: 0
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', e => {
  const currentUrl = new URL(window.location.href)
  const roomId = currentUrl.searchParams.get("id")

  const controller = new DOMController()
  
  //create the room when page is loaded
  Room.findOrCreate(roomId) // findOrCreate to test with sample data
    .then(() => {
      Playlist.init()
      User.init()
        .then(() => {
          controller.renderUsers()
        })
      Song.init()
        .then(() => {
          controller.renderSongs()
        })
    })
})