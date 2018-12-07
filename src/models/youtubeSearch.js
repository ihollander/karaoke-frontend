class YouTubeSearch {
  constructor(dataObj) {
    this.videoId = dataObj.id.videoId
    this.title = dataObj.snippet.title
    this.image = dataObj.snippet.thumbnails.default.url
    this.channel = dataObj.snippet.channelTitle
    YouTubeSearch.results.push(this)
  }

  render() {
    return `<li title="Add to playlist" data-action="add-to-playlist" data-youtube-id="${this.videoId}" class="song-result">
              <div class="thumb" style="background-image: url('${this.image}')"></div>
              <div class="info">
                <div class="title">${this.title}</div>
                <div class="channel">${this.channel}</div>
              </div>
            </li>`
  }

  static find(videoId) {
    return this.results.find(r => r.videoId == videoId)
  }

  static renderResults() {
    return this.results.map(r => r.render()).join('')
  }

  static search(q) {
    this.results = [] // reset the results array for each search
    return this.adapter.search(q)
      .then(json => {
        json.items.forEach(item => {
          new YouTubeSearch(item)
        })
      })
      .catch(console.error)
  }
}

YouTubeSearch.results = []
YouTubeSearch.adapter = new YouTubeSearchAPIAdapter()
YouTubeSearch.testVideoId