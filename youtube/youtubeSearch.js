class YouTubeSearch {
  constructor(dataObj) {
    this.videoId = dataObj.id.videoId
    this.title = dataObj.snippet.title
    this.image = dataObj.snippet.thumbnails.default.url
    this.channel = dataObj.snippet.channelTitle
    YouTubeSearch.results.push(this)
  }

  render() {
    return `<div class="song-result">
              <h4>${this.title}</h1>
              <img src="${this.image}" />
              <p><em>Channel: ${this.channel}</em></p>
              <button data-action="add-to-playlist" data-youtube-id="${this.videoId}" class="btn-primary btn-small">Add</button>
            </div>`
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