class DOMController {
  constructor() {
    // DOM elements
    this.searchResultList = document.getElementById("song-list")
    this.userList = document.getElementById("user-list")
    this.searchForm = document.getElementById("search-form")
    this.newUserForm = document.getElementById("new-user-form")
    this.playlist = document.getElementById("playlist")
    this.overlay = document.querySelector(".overlay")
    this.nowPlaying = document.querySelector("#tv-header")
    this.tvControls = document.querySelector("#tv-controls")
    this.userLogin = document.querySelector("#user-login")
    this.tambourine = document.getElementById('sound-effect-buttons')
    this.clap = document.getElementById('sound-effect-buttons')
    this.airhorn = document.getElementById('sound-effect-buttons')

    this.hiddenPlayer // Youtube hidden player reference
    this.player // Youtube Player reference
    this.alertTimeout // used for setTimeout/clearTimeout

    // Event listeners
    this.tvControls.addEventListener("click", this.handleTVControlClick.bind(this))
    this.userLogin.addEventListener("submit", this.handleUserLogin.bind(this))
    this.searchForm.addEventListener("submit", this.handleSearchFormSubmit.bind(this))
    this.newUserForm.addEventListener("submit", this.handleUserFormSubmit.bind(this))
    this.searchResultList.addEventListener("click", this.handleSearchResultListClick.bind(this))
    this.playlist.addEventListener("click", this.handlePlaylistClick.bind(this))
    this.userList.addEventListener("click", this.handleUserRemoveClick.bind(this))
    this.tambourine.addEventListener('click', this.handleTambourineClick.bind(this))
    this.clap.addEventListener('click', this.handleClapClick.bind(this))
    this.airhorn.addEventListener('click', this.handleAirHornClick.bind(this))
  }

  // INITIALIZERS //
  initJQueryElements() {
    $("#playlist").sortable({
      items: ".playlist",
      handle: ".move",
      cursor: "move",
      stop: this.handlePlaylistSorted.bind(this)
    });
  }

  initPlayer() {
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = this.handleYoutubeAPIReady.bind(this) // called when YouTube API script loads
  }
  
  onDataLoaded() { // call after populating all API data
    window.history.pushState("", "", `${location.origin}${location.pathname}?id=${Room.current.id}`)
    if (User.all.length) {
      this.overlay.classList.add('hidden')
    } else {
      this.userLogin.username.focus()
    }
    if (Playlist.allUnplayed.length) {
      Playlist.sort()
      Playlist.currentVideo = Playlist.allUnplayed[0]
      this.initPlayer()
    }
    this.renderPlaylist()
    this.renderUsers()
  }

  // RENDER METHODS //
  renderUsers() {
    this.userList.innerHTML = User.render()
    const selectUser = this.searchForm.querySelector('select[name="user"]')
    selectUser.innerHTML = User.renderSelectOptions()
  }

  renderPlaylist() {
    if (Playlist.allUnplayed.length) {
      this.nowPlaying.innerHTML = Playlist.renderNowPlaying()
      this.playlist.innerHTML = Playlist.render() // all but currently playing
      this.tambourine.innerHTML = Playlist.renderSoundEffectButtons()
    } else {
      this.nowPlaying.innerHTML = ""
    }
  }

  renderAlert(message, messageClass) {
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
    this.nowPlaying.innerHTML = `<div class="now-playing"><div class="${messageClass}">${message}</div></div>`
    this.alertTimeout = setTimeout(() => { this.renderPlaylist() }, 3000)
  }

  playCurrentVideo() {
    this.player.loadVideoById({
      videoId: Playlist.currentVideo.song.youtube_id
    })
  }

  // EVENT HANDLERS //
  handleYoutubeAPIReady() {
    this.player = new YT.Player("player", {
      playerVars: {
        'controls': 0,
        'modestbranding': 1,
        'iv_load_policy': 3
      },
      events: {
        onReady: this.handlePlayerReady.bind(this),
        onStateChange: this.handlePlayerStateChange.bind(this)
      }
    })
    this.hiddenPlayer = new YT.Player("hidden-player", {
      height: 0,
      width: 0,
      events: {
        onReady: this.handleHiddenPlayerReady.bind(this),
        onStateChange: this.handleHiddenPlayerStateChange.bind(this),
        onError: this.handleHiddenPlayerError.bind(this)
      }
    })
  }

  handlePlayerReady(event) {
    this.playerIframe = document.querySelector('#player')
    if (Playlist.currentVideo) {
      this.playCurrentVideo()
    }
  }

  handleHiddenPlayerReady(event) {
    if (YouTubeSearch.testVideoId) {
      this.hiddenPlayer.loadVideoById({
        videoId: YouTubeSearch.testVideoId
      })
    }
  }

  // wait for hidden video to play before adding it to the song list
  handleHiddenPlayerStateChange(event) {
    if (event.data == 1) {
      const videoData = event.target.getVideoData()
      const searchLi = this.searchResultList.querySelector(`[data-youtube-id="${videoData.video_id}"]`)
      searchLi.querySelector('.thumb').className = "thumb"

      this.hiddenPlayer.stopVideo()
      const songData = {
        title: videoData.title,
        youtube_id: videoData.video_id
      }
      Song.create(songData).then(song => {
        Playlist.create({
          user_id: this.searchForm.user.value,
          song_id: song.id
        }).then(() => {
          const alertMessage = songData.title.length > 30 ? songData.title.substring(0, 27) + '...' : songData.title
          this.renderAlert(`${alertMessage} added to playlist`, "success")
          if (!Playlist.currentVideo) {
            Playlist.sort()
            Playlist.currentVideo = Playlist.allUnplayed[0]
            this.playCurrentVideo()
          }
        })
      })
    }
  }

  handleHiddenPlayerError(event) {
    const videoId = event.target.getVideoData().video_id
    const searchLi = this.searchResultList.querySelector(`[data-youtube-id="${videoId}"]`)
    searchLi.querySelector('.thumb').className = "thumb"
    switch (event.data) {
      case 2:
        this.renderAlert("Error: invalid parameter value", "error");
        break;
      case 5:
        this.renderAlert("Error: HTML5 player error", "error");
        break;
      case 100:
        this.renderAlert("Error: video not found", "error");
        break;
      case 101:
        this.renderAlert("Error: video not embeddable", "error");
        break;
      case 150:
        this.renderAlert("Error: video not embeddable", "error");
        break;
      default:
        this.renderAlert("¯\\_(ツ)_/¯", "error");
        break;
    }
  }

  handleUserLogin(event) {
    event.preventDefault()
    const username = event.target.username.value
    User.create({ name: username }).then(() => {
      this.renderUsers()
      this.overlay.classList.add('hidden')
    });
  }

  handlePlayerStateChange(event) {
    if (event.data == 0) { // video done
      Playlist.currentVideo.markPlayed()
      Playlist.nextVideo()
      this.renderPlaylist()
      this.renderUsers()
      if (Playlist.currentVideo) {
        this.playCurrentVideo()
      }
    }
  }

  handlePlaylistSorted(event, ui) {
    $(event.target).find("li").each(function(index, element) {
      const playlist = Playlist.find(element.dataset.id)
      playlist.updateSort(index + 1)
      Playlist.sort()
    })
  }

  handlePlaylistClick(event) {
    if (event.target.dataset.action === "delete" || event.target.parentNode.dataset.action === "delete" ) {
      const id = event.target.closest("li").dataset.id
      Playlist.remove(id)
      this.renderPlaylist()
    }
  }

  handleTVControlClick(event) {
    if (event.target.dataset.action) {
      switch(event.target.dataset.action) {
        case "next":
          const currentId = Playlist.currentVideo.id
          Playlist.nextVideo()
          Playlist.remove(currentId)
          this.renderPlaylist()
          if (Playlist.currentVideo) {
            this.playCurrentVideo()
          }
          break
        
        case "pause":
          if (this.player.getPlayerState() == 1) {
            this.player.pauseVideo()
            this.nowPlaying.innerHTML = `<div class="now-playing"><div class="loading">Paused</div></div>`
          }
          break

        case "play":
          if (this.player.getPlayerState() == 2) {
            this.player.playVideo()
            this.renderPlaylist()
          } else if (Playlist.currentVideo) {
            this.playCurrentVideo()
          }
          break

        case "shuffle":
          this.renderAlert("Shuffling... ", "loading")
          Playlist.shuffle()
          Playlist.allUnplayed.forEach((pl, index) => {
            pl.updateSort(index + 1)
          })
          Playlist.currentVideo = Playlist.allUnplayed[0]
          this.playCurrentVideo()
          this.renderPlaylist()
          break

        case "fullscreen":
          let requestFullScreen = this.playerIframe.requestFullScreen || this.playerIframe.mozRequestFullScreen || this.playerIframe.webkitRequestFullScreen
          if (requestFullScreen) {
            requestFullScreen.bind(this.playerIframe)()
          }
          break

        default: 
          break
      }
    }
  }

  handleTambourineClick(event) {
    let tambourineBtn = event.target.id
    let audioDiv = document.getElementById("audio-div")
    audioDiv.querySelector(`#${tambourineBtn}`).play()
  }

  handleClapClick(event) {
    let clapBtn = event.target.id
    let clapDiv = document.getElementById("audio-div")
    clapDiv.querySelector(`#${clapBtn}`).play()
  }

  handleAirHornClick(event) {
    let airhornBtn = event.target.id
    let airHornDiv = document.getElementById("audio-div")
    airHornDiv.querySelector(`#${airhornBtn}`).currentTime = 0
    airHornDiv.querySelector(`#${airhornBtn}`).play()
  }


  handleUserRemoveClick(event) {
    if (event.target.dataset.action === "delete" || event.target.parentNode.dataset.action === "delete") {
      const id = event.target.closest("li").dataset.id
      const user = User.find(id)
      user.playlists.forEach(p => {
        Playlist.removeLocal(p.id)
      })
      User.remove(id)
      this.renderUsers()
      this.renderPlaylist()
    }
  }

  handleSearchFormSubmit(e) {
    e.preventDefault()
    YouTubeSearch.search(e.target.search.value).then(() => {
      this.searchResultList.innerHTML = YouTubeSearch.renderResults()
    })
  }

  handleUserFormSubmit(e) {
    e.preventDefault()
    User.create({ name: e.target.name.value }).then(() => {
      this.renderUsers()
      e.target.reset()
    })
  }

  handleSearchResultListClick(e) {
    if (e.target.dataset.action === "add-to-playlist" || e.target.closest("li").dataset.action === "add-to-playlist") {
      this.renderAlert('Checking video...', 'loading')
      YouTubeSearch.testVideoId = e.target.dataset.youtubeId || e.target.closest("li").dataset.youtubeId
      if (e.target.className === "thumb") {
        e.target.className = "thumb loader"
      } else {
        e.target.closest("li").querySelector('.thumb').className = "thumb loader"
      }
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
