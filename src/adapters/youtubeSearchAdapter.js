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
    this.apiKey = 'AIzaSyBPVi-jsOk36EkuwhuefMk_s2H0EsZtjtI'
    this.defaultParams = {
      videoEmbeddable: 'true',
      order: 'relevance',
      part: 'snippet',
      type: 'video',
      maxResults: 20,
      key: this.apiKey
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