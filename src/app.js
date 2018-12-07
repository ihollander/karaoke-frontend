document.addEventListener('DOMContentLoaded', e => {
  const currentUrl = new URL(window.location.href)
  const roomId = currentUrl.searchParams.get("id")
  const controller = new DOMController()
  controller.initJQueryElements()

  //create the room when page is loaded
  Room.findOrCreate(roomId)
    .then(() => User.init())
    .then(() => Playlist.init())
    .then(() => Song.init())
    .then(() => controller.onDataLoaded())
})
