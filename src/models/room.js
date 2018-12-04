class Room {
  constructor({id}) {
    this.id = id
    Room.current = this
  }

  static findOrCreate(id) {
    return Room.adapter.get(id)
      .then(json => {
        new Room(json)
      })
      .catch(r => {
        return Room.create()
      })
  }

  static create() {
    return Room.adapter.post({})
      .then(json => new Room(json))
      .catch(console.error)
  }
}

Room.current // current room for the page
Room.adapter = new RailsAPIAdapter('http://localhost:3000/api/v1/rooms')