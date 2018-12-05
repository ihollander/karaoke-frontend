class DOMController {
  constructor() {
    this.searchResultList = document.getElementById('song-list')
    this.userList = document.getElementById('user-list')
    this.searchForm = document.getElementById('search-form')
    this.newUserForm = document.getElementById('new-user-form')
    this.playlist = document.getElementById('playlist')

    this.player // Youtube Player reference

    this.searchForm.addEventListener('submit', this.handleSearchFormSubmit.bind(this))
    this.newUserForm.addEventListener('submit', this.handleUserFormSubmit.bind(this))
    this.searchResultList.addEventListener('click', this.handleSearchResultListClick.bind(this))
    this.playlist.addEventListener('click', this.handlePlaylistClick.bind(this))
  }

  // INITIALIZERS //
  initJQueryElements() {
    $("#playlist").sortable({ 
      items: ".list-group-item",
      cursor: "move",
      stop: this.handlePlaylistSorted.bind(this)
    })
  }

  initPlayer() {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = this.handleAPIReady.bind(this) // called when YouTube API script loads
  }

  // RENDER METHODS //
  renderUsers() {
    this.userList.innerHTML = User.render()
    const selectUser = this.searchForm.querySelector('select[name="user"]')
    selectUser.innerHTML = User.renderSelectOptions()
  }

  renderPlaylist() {
    this.playlist.innerHTML = Playlist.render()
  }

  // EVENT HANDLERS //
  handleAPIReady() {
    this.player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: Playlist.sort()[0].song.youtube_id,
      events: {
        'onStateChange': this.handlePlayerStateChange.bind(this)
      }
    })
  }

  handlePlayerStateChange(event) {
    if (event.data == 0) {
      Playlist.currentVideo.played = true // set current video as played (new current video is now next video)
      if (Playlist.currentVideo) {
        this.player.loadVideoById({ // play next video
          videoId: Playlist.currentVideo.song.youtube_id,
          suggestedQuality: 'large'
        })
      }
    }
  }

  handlePlaylistSorted(event, ui) {
    $(event.target).find('li').each(function(index,element) {
      const playlist = Playlist.find(element.dataset.id)
      playlist.updateSort(index + 1)
    })
  }

  handlePlaylistClick(event) {
    if (event.target.dataset.action === "play" || event.target.parentNode.dataset.action === "play") {
      const id = event.target.closest('li').dataset.id
      Playlist.currentVideo.played = true // change current video
      
      const playlist = Playlist.find(id)
      playlist.updateSort(0) // move to top
      this.renderPlaylist() // re-render playlist
      // change the video in the player
      if (!this.player) {
        this.initPlayer()
      } else {
        this.player.loadVideoById({ // play next video
          videoId: Playlist.currentVideo.song.youtube_id,
          suggestedQuality: 'large'
        })
      }
    }
  }

  handleSearchFormSubmit(e) {
    e.preventDefault()
    YouTubeSearch.search(e.target.search.value)
      .then(() => {
        this.searchResultList.innerHTML = YouTubeSearch.renderResults()
      })
  }

  handleUserFormSubmit(e) {
    e.preventDefault()
    User.create({ name: e.target.name.value })
      .then(() => {
        this.renderUsers()
        e.target.reset()
      })
  }

  handleSearchResultListClick(e) {
    if (e.target.dataset.action === "add-to-playlist") {
      const youtubeSong = YouTubeSearch.find(e.target.dataset.youtubeId)
      const songData = {
        title: youtubeSong.title,
        youtube_id: youtubeSong.videoId
      }
      Song.create(songData)
        .then(song => {
          Playlist.create({ user_id: this.searchForm.user.value, song_id: song.id })
            .then(() => {
              this.renderPlaylist()
              if (!this.player) {
                this.initPlayer()
              }
            })
        })
    }
  }
}