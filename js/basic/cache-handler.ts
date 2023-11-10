import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3"

module.exports = class CacheHandler {
  options = {}
  s3Client

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
    console.log(`GET: ${key}`)

    const command = new GetObjectCommand({
      "Bucket": "next-cache-handler-diarmuid",
      "Key": key
    });
    const response = await this.s3Client.send(command);

    if (!response) {
      return {}
    }

    const str = await response.Body.transformToString();

    return JSON.parse(str)
  }

  async set(key, data) {
    let payload = {
      value: data,
      lastModified: Date.now(),
    }
    console.log(`SET: ${key}`, payload)

    const command = new PutObjectCommand({
      "Bucket": "next-cache-handler-diarmuid",
      "Key": key,
      "Body": JSON.stringify(payload)
    });
    const response = await this.s3Client.send(command);
  }
}
