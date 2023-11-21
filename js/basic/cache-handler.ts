const axios = require('axios');

module.exports = class CacheHandler {
  options = {}

  constructor(options) {
    this.options = options
  }

  async get(key) {
    key = key.replace(/^\/+/g, '')
    key = this.getKey("cache/" + key)
    console.log(`GET: ${key}`)

    const instance = axios.create()

    instance.interceptors.request.use((config) => {
        config.headers['request-startTime'] = process.hrtime()
        return config
    })

    instance.interceptors.response.use((response) => {
        const start = response.config.headers['request-startTime']
        const end = process.hrtime(start)
        const milliseconds = Math.round((end[0] * 1000) + (end[1] / 1000000))
        response.headers['request-duration'] = milliseconds
        return response
    })

    instance.get(`http://localhost:8083/kv/${key}`)
    .then(res => {
      console.log(res.headers['request-duration'])
      return res.data;
    })
    .catch(err => {
      console.log('Error: ', err.message);
    });
  }

  async set(key, data, ctx) {
    let payload = {
      value: data,
      lastModified: Date.now(),
    }
    key = key.replace(/^\/+/g, '')
    key = this.getKey("cache/" + key)
    console.log(`SET: ${key}`, ctx)

    const instance = axios.create()

    instance.interceptors.request.use((config) => {
        config.headers['request-startTime'] = process.hrtime()
        return config
    })

    instance.interceptors.response.use((response) => {
        const start = response.config.headers['request-startTime']
        const end = process.hrtime(start)
        const milliseconds = Math.round((end[0] * 1000) + (end[1] / 1000000))
        response.headers['request-duration'] = milliseconds
        return response
    })

    instance.put(`http://localhost:8083/kv/${key}`, payload)
    .then(res => {
      console.log(res.headers['request-duration'])
    })
    .catch(err => {
      console.log('Error: ', err.message);
    });
  }

  async revalidateTag(tag) {
    console.log(`REVALIDATE TAG: ${tag}`)
  }

  getKey(key) {
    key = key.replace(/^\/+/g, '')
    const buildID = process.env.ATLAS_METADATA_BUILD_ID || "buildid"
    return `${buildID}/${key}`
  }
}
