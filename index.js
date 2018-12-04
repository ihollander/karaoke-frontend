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
  const player = document.getElementById('overlay')

  songList.addEventListener('click', e => {
    if (e.target.dataset.action === "add-to-playlist") {
      const youtubeId = e.target.dataset.youtubeId
      player.innerHTML = youtubeId
      createVideo('player', youtubeId)
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
