class Song {
  constructor({ id, title, youtube_id }) {
    this.id = id
    this.title = title
    this.youtube_id = youtube_id
    Song.all.push(this)
  }

  static populateFromAPI() {
    // TODO: check if adapter is initialized before call
    return Song.adapter.getAll()
      .then(json => {
        json.forEach(songObj => {
          new Song(songObj)
        })
      })
      .catch(console.error)
  }

  static create(songData) {
    return Song.adapter.post(songData)
      .then(json => {
        new Song(json)
      })
  }
}

Song.all = []