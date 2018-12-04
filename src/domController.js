class DOMController {
  constructor() {
    this.songList = document.getElementById('song-list')
    this.userList = document.getElementById('user-list')
    this.searchForm = document.getElementById('search-form')
    this.player = document.getElementById('player')
    this.newUserForm = document.getElementById('new-user-form')

    this.searchForm.addEventListener('submit', this.handleSearchFormSubmit.bind(this))
    this.newUserForm.addEventListener('submit', this.handleUserFormSubmit.bind(this))
    this.songList.addEventListener('click', this.handleSongListClick.bind(this))
  }

  renderUsers() {
    this.userList.innerHTML = User.render()
  }

  renderSongs() {
    this.songList.innerHTML = Song.render()
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
    debugger
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
        youtube_id: youtubeSong.videoId,
        user_id: 7 // for now...
      }
      Song.create(songData)
        .then(() => {
          this.renderSongs()
        })
    }
  }
}