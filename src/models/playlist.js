class Playlist {
  constructor({ id, user_id, song_id, sort }) {
    this.id = id
    this.user_id = user_id
    this.song_id = song_id
    this.sort = sort
    this.played = false
    Playlist.all.push(this)
  }

  moveToTop() {
    const currentIndex = Playlist.all.findIndex(pl => pl.id == this.id)
    Playlist.all.splice(currentIndex, 1)
    Playlist.all = [this, ...Playlist.all]
    Playlist.all.forEach((pl, index) => {
      pl.updateSort(index + 1)
    })
  }

  updateSort(sortOrder) {
    this.sort = sortOrder
    Playlist.adapter.patch(this.id, { sort: this.sort })
  }

  render() {
    return `<li class="list-group-item" data-id="${this.id}">
              <span>Song: ${this.song.title} | User: ${this.user.name}</span>
              <button data-action="play" class="btn-primary">
                <span class="fa fa-play"></span>
              </button>
              <button data-action="delete" class="btn-danger">
                <span class="fa fa-times"></span>
              </button>
            </li>`
  }

  get song() {
    return Song.all.find(s => s.id == this.song_id)
  }

  set song(songObj) {
    this.song_id = songObj.id
  }

  get user() {
    return User.all.find(u => u.id == this.user_id)
  }

  set user(userObj) {
    this.user_id = userObj.id
  }

  static sort() { // sort in place and return sorted list
    return this.all.sort((a,b) => (a.sort < b.sort) ? -1 : ((a.sort > b.sort) ? 1 : 0))
  }

  static render() {
    return this.sort().map(pl => pl.render()).join('')
  }

  static find(id) {
    return this.all.find(u => u.id == id)
  }

  static findBy(key, value) {
    return this.all.find(a => a[key] == value)
  }

  static create(playlistObj) {
    return this.adapter.post(playlistObj)
      .then(json => new Playlist(json))
      .catch(console.error)
  }

  static remove(id) {
    const i = Playlist.all.findIndex(pl => pl.id == id)
    Playlist.all.splice(i, 1)
    Playlist.adapter.delete(id)
  }

  static nextVideo() {
    if (!Playlist.currentVideo) {
      Playlist.currentVideo = Playlist.all[0]
    } else {
      const i = Playlist.all.findIndex(pl => pl.id == Playlist.currentVideo.id)
      Playlist.currentVideo = Playlist.all[i + 1]
    }
  }

  static populateFromAPI() {
    return this.adapter.getAll()
      .then(json => {
        json.forEach(playlistObj => new Playlist(playlistObj))
      })
      .then(() => {
        // this.
      })
      .catch(console.error)
  }

  static init() {
    Playlist.adapter = new RailsAPIAdapter(`http://localhost:3000/api/v1/rooms/${Room.current.id}/playlists`)
    return this.populateFromAPI()
  }
}

Playlist.all = []
Playlist.currentVideo