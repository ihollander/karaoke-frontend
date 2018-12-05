class Song {
  constructor({ id, title, youtube_id }) {
    this.id = id
    this.title = title
    this.youtube_id = youtube_id
    Song.all.push(this)
  }

  render() {
    return `<li class="list-group-item" data-youtube-id="${this.youtube_id}">${this.title}</li>`
  }

  static render() {
    return this.all.map(r => r.render()).join('')
  }

  static find(id) {
    return this.all.find(u => u.id == id)
  }

  static findBy(key, value) {
    return this.all.find(a => a[key] == value)
  }

  static populateFromAPI() {
    return this.adapter.getAll()
      .then(json => {
        json.forEach(songObj => new Song(songObj))
      })
      .catch(console.error)
  }

  static create(songData) {
    return this.adapter.post(songData)
      .then(json => new Song(json))
      .catch(console.error)
  }

  static init() {
    Song.adapter = new RailsAPIAdapter(`http://localhost:3000/api/v1/rooms/${Room.current.id}/songs`)
    return this.populateFromAPI()
  }
}

Song.all = []