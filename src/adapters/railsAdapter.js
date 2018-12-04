class RailsAPIAdapter {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  getAll() {
    return this.request(this.baseURL, {
      method: 'GET'
    })
  }

  get(id) {
    return this.request(`${this.baseURL}/${id}`, {
      method: 'GET'
    })
  }

  post(data) {
    return this.request(this.baseURL, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(data)
    })
  }

  delete(id) {
    return this.request(`${this.baseURL}/${id}`, {
      method: 'DELETE'
    })
  }

  request(endpoint, options) {
    return fetch(endpoint, options)
      .then(r => {
        if (r.ok) {
          return r.json()
        } else {
          throw r
        }
      })
  }
}