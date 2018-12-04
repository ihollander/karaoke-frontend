class DOMController {
  constructor() {
    this.songList = document.getElementById('song-list')
    this.userList = document.getElementById('user-list')
    this.searchForm = document.getElementById('search-form')
    this.player = document.getElementById('player')
    this.newUserForm = document.getElementById('new-user-form')
    this.playlist = document.getElementById('playlist')

    this.searchForm.addEventListener('submit', this.handleSearchFormSubmit.bind(this))
    this.newUserForm.addEventListener('submit', this.handleUserFormSubmit.bind(this))
    this.songList.addEventListener('click', this.handleSongListClick.bind(this))
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
            })
        })
    }
  }
}