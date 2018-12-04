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
    return Room.adapter.get(id)
      .then(json => new Room(json))
      .catch(() => Room.create()) // if not found, create a new room
  }

  static create() {
    return Room.adapter.post({}) // create new room with no data, can extend
      .then(json => new Room(json))
      .catch(console.error)
  }
}

Room.current // current room for the page
Room.adapter = new RailsAPIAdapter('http://localhost:3000/api/v1/rooms')