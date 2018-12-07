class DOMController {
  constructor() {
    this.searchResultList = document.getElementById("song-list")
    this.userList = document.getElementById("user-list")
    this.searchForm = document.getElementById("search-form")
    this.newUserForm = document.getElementById("new-user-form")
    this.playlist = document.getElementById("playlist")
    this.overlay = document.querySelector(".overlay")
    this.nowPlaying = document.querySelector("#tv-header")
    this.userLogin = document.querySelector("#user-login")
    this.userLogin.username.focus()
    this.tambourine = document.getElementById('sound-effect-buttons')
    this.clap = document.getElementById('sound-effect-buttons')
    this.airhorn = document.getElementById('sound-effect-buttons')

    this.hiddenPlayer // hacky workaround for checking if a video is embeddable...
    this.player // Youtube Player reference

    this.nowPlaying.addEventListener("click", this.handleNextButtonClick.bind(this))
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
      this.nowPlaying.innerHTML = Playlist.renderNowPlaying()
      this.playlist.innerHTML = Playlist.render() // all but currently playing
      this.tambourine.innerHTML = Playlist.renderSoundEffectButtons()
    } else {
      this.nowPlaying.innerHTML = ""
    }
  }


  // EVENT HANDLERS //
  handleAPIReady() {
    this.player = new YT.Player("player", {
      events: {
        onReady: this.handlePlayerReady.bind(this),
        onStateChange: this.handlePlayerStateChange.bind(this)
      }
    });
    this.hiddenPlayer = new YT.Player("hidden-player", {
      height: 0,
      width: 0,
      events: {
        onReady: this.handleHiddenPlayerReady.bind(this),
        onStateChange: this.handleHiddenPlayerStateChange.bind(this),
        onError: this.handleHiddenPlayerError.bind(this)
      }
    });
  }

  handlePlayerReady(event) {
    if (Playlist.currentVideo) {
      this.player.loadVideoById({
        videoId: Playlist.currentVideo.song.youtube_id
      });
    }
  }

  handleHiddenPlayerReady(event) {
    if (YouTubeSearch.testVideoId) {
      this.hiddenPlayer.loadVideoById({
        videoId: YouTubeSearch.testVideoId
      });
    }
  }

  // this is hacky, pls fix
  // wait for hidden video to play before adding it to the song list
  handleHiddenPlayerStateChange(event) {
    if (event.data == 1) {
      const videoData = event.target.getVideoData()
      const videoId = videoData.video_id
      const searchLi = this.searchResultList.querySelector(`[data-youtube-id="${videoId}"]`)
      searchLi.querySelector('.thumb').className = "thumb"

      this.hiddenPlayer.stopVideo()
      const songData = {
        title: videoData.title,
        youtube_id: videoData.video_id
      };
      Song.create(songData).then(song => {
        Playlist.create({
          user_id: this.searchForm.user.value,
          song_id: song.id
        }).then(() => {
          toastr.success(`${songData.title} added`, "Success!")
          if (!Playlist.currentVideo) {
            Playlist.sort();
            Playlist.currentVideo = Playlist.all[0]
            this.player.loadVideoById({
              // play next video
              videoId: Playlist.currentVideo.song.youtube_id,
              suggestedQuality: "large"
            });
          }
          this.renderPlaylist()
        });
      });
    }
  }

  handleHiddenPlayerError(event) {
    const videoData = event.target.getVideoData()
    const videoId = videoData.video_id
    const searchLi = this.searchResultList.querySelector(`[data-youtube-id="${videoId}"]`)
    searchLi.querySelector('.thumb').className = "thumb"
    switch (event.data) {
      case 2:
        toastr.error(
          "The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.",
          "Error adding video"
        );
        break;
      case 5:
        toastr.error(
          "The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.",
          "Error adding video"
        );
        break;
      case 100:
        toastr.error(
          "The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.",
          "Error adding video"
        );
        break;
      case 101:
        toastr.error(
          "The owner of the requested video does not allow it to be played in embedded players.",
          "Error adding video"
        );
        break;
      case 150:
        toastr.error(
          "The owner of the requested video does not allow it to be played in embedded players.",
          "Error adding video"
        );
        break;
      default:
        toastr.error("¯\\_(ツ)_/¯", "Error adding video");
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
    if (event.data == 0) {
      // video done
      const currentId = Playlist.currentVideo.id
      Playlist.nextVideo()
      Playlist.remove(currentId)
      this.renderPlaylist()
      if (Playlist.currentVideo) {
        this.player.loadVideoById({
          // play next video
          videoId: Playlist.currentVideo.song.youtube_id,
          suggestedQuality: "large"
        });
      }
    }
  }

  handlePlaylistSorted(event, ui) {
    $(event.target).find("li").each(function(index, element) {
        const playlist = Playlist.find(element.dataset.id)
        playlist.updateSort(index + 1)
        Playlist.sort()
      });
  }

  handlePlaylistClick(event) {
    if (event.target.dataset.action === "delete" || event.target.parentNode.dataset.action === "delete" ) {
      const id = event.target.closest("li").dataset.id
      Playlist.remove(id)
      this.renderPlaylist()
    }
  }

  handleNextButtonClick(event) {
    if (event.target.dataAction === "next" || event.target.className === "fa fa-step-forward") {
      const currentId = Playlist.currentVideo.id
      Playlist.nextVideo()
      Playlist.remove(currentId)
      this.renderPlaylist()
      if (Playlist.currentVideo) {
        this.player.loadVideoById({
          // play next video
          videoId: Playlist.currentVideo.song.youtube_id,
          suggestedQuality: "large"
        });
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
      });
      User.remove(id)
      this.renderUsers()
      this.renderPlaylist()
    }
  }

  handleSearchFormSubmit(e) {
    e.preventDefault()
    YouTubeSearch.search(e.target.search.value).then(() => {
      this.searchResultList.innerHTML = YouTubeSearch.renderResults()
    });
  }

  handleUserFormSubmit(e) {
    e.preventDefault()
    User.create({ name: e.target.name.value }).then(() => {
      this.renderUsers()
      e.target.reset()
    });
  }

  handleSearchResultListClick(e) {
    if (e.target.dataset.action === "add-to-playlist" || e.target.closest("li").dataset.action === "add-to-playlist") {
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
        });
      }
    }
  }
}
