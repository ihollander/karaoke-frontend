class User {
  constructor({id, room_id, name}) {
    this.id = id
    this.room_id = room_id
    this.name = name
    User.all.push(this)
  }

  static populateFromAPI() {
    // TODO: check if adapter is initialized before call
    return User.adapter.getAll()
      .then(json => {
        json.forEach(userObj => {
          new User(userObj)
        })
      })
      .catch(console.error)
  }
  
  static create(name) {
    return User.adapter.post({
      name: name
    })
    .then(json => {
      new User(json)
    })
  }
}

User.all = []