class Playlist {
  constructor({ id, user_id, song_id }) {
    this.id = id
    this.user_id = user_id
    this.song_id = song_id
    this.played = false
    Playlist.all.push(this)
  }

  render() {
    return `<li>
              Song: ${this.song.title} | User: ${this.user.name}
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

  static get currentVideo() {
    return Playlist.all.find(pl => !pl.played)
  }

  static get youtubePlaylist() {
    return Playlist.all.map(pl => pl.song.youtube_id)
  }

  static render() {
    return this.all.map(pl => pl.render()).join('')
  }

  static find(id) {
    return this.all.find(u => u.id == id)
  }

  static create(playlistObj) {
    return this.adapter.post(playlistObj)
      .then(json => new Playlist(json))
      .catch(console.error)
  }

  static populateFromAPI() {
    return this.adapter.getAll()
      .then(json => {
        json.forEach(playlistObj => new Playlist(playlistObj))
      })
      .catch(console.error)
  }

  static init() {
    Playlist.adapter = new RailsAPIAdapter(`http://localhost:3000/api/v1/rooms/${Room.current.id}/playlists`)
    return this.populateFromAPI()
  }
}

Playlist.all = []