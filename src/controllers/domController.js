class DOMController {
  constructor() {
    this.searchResultList = document.getElementById('song-list')
    this.userList = document.getElementById('user-list')
    this.searchForm = document.getElementById('search-form')
    this.newUserForm = document.getElementById('new-user-form')
    this.playlist = document.getElementById('playlist')
    this.overlay = document.querySelector('.overlay')
    this.userLogin = document.querySelector('#user-login')
    this.userLogin.username.focus()

    this.hiddenPlayer // hacky workaround for checking if a video is embeddable...
    this.player // Youtube Player reference

    this.userLogin.addEventListener('submit', this.handleUserLogin.bind(this))
    this.searchForm.addEventListener('submit', this.handleSearchFormSubmit.bind(this))
    this.newUserForm.addEventListener('submit', this.handleUserFormSubmit.bind(this))
    this.searchResultList.addEventListener('click', this.handleSearchResultListClick.bind(this))
    this.playlist.addEventListener('click', this.handlePlaylistClick.bind(this))
  }

  // INITIALIZERS //
  initJQueryElements() {
    $("#playlist").sortable({
      items: ".playlist",
      handle: ".fa-arrows-v",
      cursor: "move",
      stop: this.handlePlaylistSorted.bind(this)
    })
  }

  initPlayer() {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = this.handleAPIReady.bind(this) // called when YouTube API script loads
  }

  // RENDER METHODS //
  renderUsers() {
    this.userList.innerHTML = User.render()
    const selectUser = this.searchForm.querySelector('select[name="user"]')
    selectUser.innerHTML = User.renderSelectOptions()
  }

  renderPlaylist() {
    if (Playlist.all.length) {
      this.playlist.innerHTML = Playlist.render()
    }
  }

  // EVENT HANDLERS //
  handleAPIReady() {
    this.player = new YT.Player('player', {
      events: {
        'onReady': this.handlePlayerReady.bind(this),
        'onStateChange': this.handlePlayerStateChange.bind(this)
      }
    })
    this.hiddenPlayer = new YT.Player('hidden-player', {
      height: 0,
      width: 0,
      events: {
        'onReady': this.handleHiddenPlayerReady.bind(this),
        'onStateChange': this.handleHiddenPlayerStateChange.bind(this),
        'onError': this.handleHiddenPlayerError.bind(this)
      }
    })
  }

  handlePlayerReady(event) {
    if (Playlist.currentVideo) {
      this.player.loadVideoById({
        videoId: Playlist.currentVideo.song.youtube_id
      })
    }
  }

  handleHiddenPlayerReady(event) {
    if (YouTubeSearch.testVideoId) {
      this.hiddenPlayer.loadVideoById({
        videoId: YouTubeSearch.testVideoId
      })
    }
  }

  // this is hacky, pls fix
  // wait for hidden video to play before adding it to the song list
  handleHiddenPlayerStateChange(event) {
    if (event.data == 1) {
      const videoData = event.target.getVideoData()
      this.hiddenPlayer.stopVideo()
      const songData = {
        title: videoData.title,
        youtube_id: videoData.video_id
      }
      Song.create(songData)
        .then(song => {
          Playlist.create({ user_id: this.searchForm.user.value, song_id: song.id })
            .then(() => {
              toastr.success(`${songData.title} added`, 'Success!')
              this.renderPlaylist()
              if (!Playlist.currentVideo) {
                Playlist.sort()
                Playlist.currentVideo = Playlist.all[0]
                this.player.loadVideoById({ // play next video
                  videoId: Playlist.currentVideo.song.youtube_id,
                  suggestedQuality: 'large'
                })
              }
            })
        })
    }
  }

  handleHiddenPlayerError(event) {
    switch(event.data) {
      case 2:
        toastr.error('The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.', 'Error adding video')
        break
      case 5:
        toastr.error('The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.', 'Error adding video')
        break
      case 100:
        toastr.error('The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.', 'Error adding video')
        break
      case 101:
        toastr.error('The owner of the requested video does not allow it to be played in embedded players.', 'Error adding video')
        break
      case 150:
        toastr.error('The owner of the requested video does not allow it to be played in embedded players.', 'Error adding video')
        break
      default:
        toastr.error('¯\\_(ツ)_/¯', 'Error adding video')
        break
    }
  }

  handleUserLogin(event) {
    event.preventDefault()
    const username = event.target.username.value
    User.create({name: username})
    .then(() => {
      this.renderUsers()
      this.overlay.style.display = "none"
    })
  }

  handlePlayerStateChange(event) {
    if (event.data == 0) { // video done
      const currentId = Playlist.currentVideo.id
      Playlist.nextVideo()
      Playlist.remove(currentId)
      this.renderPlaylist()
      if (Playlist.currentVideo) {
        this.player.loadVideoById({ // play next video
          videoId: Playlist.currentVideo.song.youtube_id,
          suggestedQuality: 'large'
        })
      }
    }
  }

  handlePlaylistSorted(event, ui) {
    $(event.target).find('li').each(function(index,element) {
      const playlist = Playlist.find(element.dataset.id)
      playlist.updateSort(index + 1)
    })
  }

  handlePlaylistClick(event) {
    if (event.target.dataset.action === "play" || event.target.parentNode.dataset.action === "play") {
      const id = event.target.closest('li').dataset.id      
      const playlistItem = Playlist.find(id)
      playlistItem.moveToTop() // move to top
      if (Playlist.currentVideo) {
        Playlist.remove(Playlist.currentVideo.id) // remove currently playing video
      }
      Playlist.currentVideo = Playlist.all[0] // change current video
      this.renderPlaylist() // re-render playlist
      if (!this.player) {
        this.initPlayer()
      } else {
        this.player.loadVideoById({ // play next video
          videoId: Playlist.currentVideo.song.youtube_id,
          suggestedQuality: 'large'
        })
      }
    } else if (event.target.dataset.action === "delete" || event.target.parentNode.dataset.action === "delete") {
      const id = event.target.closest('li').dataset.id
      Playlist.remove(id)
      this.renderPlaylist()
    }
  }

  handleSearchFormSubmit(e) {
    e.preventDefault()
    YouTubeSearch.search(e.target.search.value)
      .then(() => {
        this.searchResultList.innerHTML = YouTubeSearch.renderResults()
      })
  }

  handleUserFormSubmit(e) {
    e.preventDefault()
    User.create({ name: e.target.name.value })
      .then(() => {
        this.renderUsers()
        e.target.reset()
      })
  }

  handleSearchResultListClick(e) {
    console.log(e.target)
    if (e.target.dataset.action === "add-to-playlist" || e.target.closest('li').dataset.action === "add-to-playlist") {
      YouTubeSearch.testVideoId = e.target.dataset.youtubeId || e.target.closest('li').dataset.youtubeId
      if (!this.hiddenPlayer) {
        this.initPlayer()
      } else {
        this.hiddenPlayer.loadVideoById({
          videoId: YouTubeSearch.testVideoId
        })
      }
    }
  }
}
