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

    axios.get(`http://localhost:8083/kv/${key}`)
    .then(res => {
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

    axios.put(`http://localhost:8083/kv/${key}`, payload)
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
