const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

module.exports = class CacheHandler {
  options = {}
  s3Client
  bucket = process.env.bucket

  constructor(options) {
    this.options = options

    const accountKey = process.env.key
    const accountSecret = process.env.secret
    const endpoint = process.env.endpoint

    this.s3Client = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId: accountKey,
        secretAccessKey: accountSecret,
      },
    });
  }

  async get(key) {
    key = key.replace(/^\/+/g, '')
    key = this.getKey("cache/" + key)
    console.log(`GET: ${key}`)

    const command = new GetObjectCommand({
      "Bucket": this.bucket,
      "Key": key
    });
    try {
      const response = await this.s3Client.send(command);
      const str = await response.Body.transformToString();
      const json = JSON.parse(str)
      return json
    } catch(e) {
      console.log("Get failed")
    }
  }

  async set(key, data, ctx) {
    let payload = {
      value: data,
      lastModified: Date.now(),
    }
    key = key.replace(/^\/+/g, '')
    key = this.getKey("cache/" + key)
    console.log(`SET: ${key}`, ctx)

    const command = new PutObjectCommand({
      "Bucket": this.bucket,
      "Key": key,
      "Body": JSON.stringify(payload),
      "ContentType": 'application/json'
    });
    try {
      await this.s3Client.send(command);
    } catch (e) {
      console.log("Put failed:", e)
    }
  }

  async revalidateTag(tag) {
    console.log(`REVALIDATE TAG: ${tag}`)
  }

  getKey(key) {
    key = key.replace(/^\/+/g, '')
    const envID = process.env.ATLAS_METADATA_ENV_ID || "envid"
    const buildID = process.env.ATLAS_METADATA_BUILD_ID || "buildid"
    return `${envID}/${buildID}/${key}`
  }
}
