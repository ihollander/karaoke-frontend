// 
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
  const songList = document.getElementById('song-list')
  const searchForm = document.getElementById('search-form')
  const player = document.getElementById('player')

  //create the room when page is loaded
  Room.findOrCreate(7) // findOrCreate to test with sample data...
    .then(() => {
      // setup users and songs APIs
      User.adapter = new RailsAPIAdapter(`http://localhost:3000/api/v1/rooms/${Room.current.id}/users`)
      User.populateFromAPI()
        .then(() => {
          console.log(User.all)
        })
      Song.adapter = new RailsAPIAdapter(`http://localhost:3000/api/v1/rooms/${Room.current.id}/songs`)
      Song.populateFromAPI()
        .then(() => {
          console.log(Song.all)
        })
    })

  songList.addEventListener('click', e => {
    if (e.target.dataset.action === "add-to-playlist") {
      const youtubeId = e.target.dataset.youtubeId
      const youtubeSong = YouTubeSearch.find(youtubeId)
      player.innerHTML = youtubeId
      // createVideo('player', youtubeId)
      // save song to API and get response
      // include user
      const songData = {
        title: youtubeSong.title,
        youtube_id: youtubeSong.videoId,
        user_id: 7
      }
      debugger
      Song.create(songData)
    }
  })

  searchForm.addEventListener('submit', e => {
    e.preventDefault()
    const searchQuery = e.target.search.value
    YouTubeSearch.search(searchQuery)
      .then(() => {
        songList.innerHTML = YouTubeSearch.renderResults()
      })
  })
})