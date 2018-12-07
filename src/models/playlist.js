class Playlist {
  constructor({ id, user_id, song_id, sort, played }) {
    this.id = id
    this.user_id = user_id
    this.song_id = song_id
    this.sort = sort
    this.played = played
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

  markPlayed() {
    this.played = true
    Playlist.adapter.patch(this.id, { played: true })
  }

  render() {
    return `<li class="playlist" data-id="${this.id}">
              <div class="info">
                <div class="song">${this.song.title}</div>
                <div class="singer">Sung By: ${this.user.name}</div>
              </div>
              <div class="controls">
                <button class="button" data-action="delete" style="background-color:transparent;">
                  <span class="fa fa-eject"></span>
                </button>
                <div class="button move" data-action="move" style="background-color:transparent;">
                  <span class="fa fa-arrows-v"></span>
                </div>
              </div>
            </li>`
  }

  static renderNowPlaying() {
    return `<div class="now-playing">
              <div class="marquee">Now Playing ${Playlist.currentVideo.song.title} - Sung By ${Playlist.currentVideo.user.name}</div>
            </div>`
  }

static renderSoundEffectButtons() {
  return `<div class="tambourine">
          <button class="select-button green" id="tambourine" type="button"></button>
          <button class="select-button blue" id="clap" type="button"></button>
          <button class="select-button" id="airhorn" type="button"></button>
          </div>
  `
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

  static get allButCurrent() {
    return this.allUnplayed.filter(pl => pl !== Playlist.currentVideo)
  }

  static get allUnplayed() {
    return this.all.filter(pl => !pl.played)
  }

  static shuffle() {
    let rand, swap
    for (let i = Playlist.all.length - 1; i > 0; i--) {
      rand = Math.floor(Math.random() * (i + 1));
      swap = Playlist.all[i];
      Playlist.all[i] = Playlist.all[rand];
      Playlist.all[rand] = swap;
    }
  }

  static render() {
    return this.allButCurrent.map(pl => pl.render()).join('')
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

  static removeLocal(id) {
    const i = Playlist.all.findIndex(pl => pl.id == id)
    Playlist.all.splice(i, 1)
  }

  static remove(id) {
    const i = Playlist.all.findIndex(pl => pl.id == id)
    Playlist.all.splice(i, 1)
    Playlist.adapter.delete(id)
  }

  static nextVideo() {
    if (!Playlist.currentVideo) {
      Playlist.currentVideo = Playlist.allUnplayed[0]
    } else {
      const i = Playlist.allUnplayed.findIndex(pl => pl.id == Playlist.currentVideo.id)
      Playlist.currentVideo = Playlist.allUnplayed[i + 1]
    }
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
Playlist.currentVideo
