// helper function to serialize simple javascript object to querystring
// do as module?
const serializeQueryString = function(params) {
  const queryString = []
  for (const key in params) {
    queryString.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  }
  return queryString.join("&")
}

// before pushing this page to GitHub... secure the API key
class YouTubeSearchAPIAdapter {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/youtube/v3/search'
    this.defaultParams = {
      videoEmbeddable: true,
      order: 'relevance',
      part: 'snippet',
      type: 'video',
      maxResults: 50,
      key: ENV['youtube'],
      regionCode: 'US',
      safeSearch: 'strict',
      videoSyndicated: true
    }
  }

  search(q) {
    const searchParams = Object.assign({q: `${q} Karaoke -carpool`}, this.defaultParams)
    const queryParams = serializeQueryString(searchParams)
    return fetch(`${this.baseUrl}?${queryParams}`)
      .then(r => {
        if (r.ok) {
          return r.json()
        } else {
          throw r
        }
      })
  }
}
