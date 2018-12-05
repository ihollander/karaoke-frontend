class DOMController {
  constructor() {
    this.songList = document.getElementById('song-list')
    this.userList = document.getElementById('user-list')
    this.searchForm = document.getElementById('search-form')
    this.newUserForm = document.getElementById('new-user-form')
    this.playlist = document.getElementById('playlist')

    this.player // Youtube Player reference

    this.searchForm.addEventListener('submit', this.handleSearchFormSubmit.bind(this))
    this.newUserForm.addEventListener('submit', this.handleUserFormSubmit.bind(this))
    this.songList.addEventListener('click', this.handleSongListClick.bind(this))
  }

  initPlayer() {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = this.onAPIReady.bind(this) // called when YouTube API script loads
  }

  onAPIReady() {
    this.player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: Playlist.all[0].song.youtube_id,
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

  renderUsers() {
    this.userList.innerHTML = User.render()
    const selectUser = this.searchForm.querySelector('select[name="user"]')
    selectUser.innerHTML = User.renderSelectOptions()
  }

  renderPlaylist() {
    this.playlist.innerHTML = Playlist.render()
  }

  handleSearchFormSubmit(e) {
    e.preventDefault()
    YouTubeSearch.search(e.target.search.value)
      .then(() => {
        this.songList.innerHTML = YouTubeSearch.renderResults()
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

  handleSongListClick(e) {
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
              debugger
              if (!this.player) {
                this.initPlayer()
              }
            })
        })
    }
  }
}