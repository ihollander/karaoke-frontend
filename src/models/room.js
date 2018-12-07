class Room {
  constructor({id}) {
    this.id = id
    Room.current = this
  }

  get users() {
    return User.all
  }

  get songs() {
    return Song.all
  }

  static findOrCreate(id) {
    if (id) {
      return Room.adapter.get(id)
        .then(json => new Room(json))
        .catch(() => Room.create()) // if not found, create a new room
    } else {
      return Room.create()
    }
  }

  static create() {
    return Room.adapter.post({}) // create new room with no data, can extend
      .then(json => new Room(json))
      .catch(console.error)
  }
}

Room.current // current room for the page
Room.adapter = new RailsAPIAdapter('https://youtube-ktv-palace.herokuapp.com/api/v1/rooms')
