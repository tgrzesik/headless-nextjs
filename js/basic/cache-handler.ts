const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

module.exports = class CacheHandler {
  options = {}
  s3Client
  prefix = "diarmuid"

  constructor(options) {
    this.options = options

    const accountID = ""
    const accountKey = ""
    const accountSecret = ""

    this.s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accountKey,
        secretAccessKey: accountSecret,
      },
    });
  }

  async get(key) {
    console.log(`GET: ${this.prefix}/${key}`)

    const command = new GetObjectCommand({
      "Bucket": "next-cache-handler-diarmuid",
      "Key": `${this.prefix}/${key}`
    });
    try {
      const response = await this.s3Client.send(command);
      const str = await response.Body.transformToString();
      return JSON.parse(str)
    } catch(e) {
      return {}
    }
  }

  async set(key, data) {
    let payload = {
      value: data,
      lastModified: Date.now(),
    }
    console.log(`SET: ${this.prefix}/${key}`, payload)

    const command = new PutObjectCommand({
      "Bucket": "next-cache-handler-diarmuid",
      "Key": `${this.prefix}/${key}`,
      "Body": JSON.stringify(payload)
    });
    const response = await this.s3Client.send(command);
  }
}
