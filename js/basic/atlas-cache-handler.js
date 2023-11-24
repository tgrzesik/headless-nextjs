"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/content-type/index.js
var require_content_type = __commonJS({
  "node_modules/content-type/index.js"(exports2) {
    "use strict";
    var PARAM_REGEXP = /; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g;
    var TEXT_REGEXP = /^[\u000b\u0020-\u007e\u0080-\u00ff]+$/;
    var TOKEN_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    var QESC_REGEXP = /\\([\u000b\u0020-\u00ff])/g;
    var QUOTE_REGEXP = /([\\"])/g;
    var TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    exports2.format = format;
    exports2.parse = parse;
    function format(obj) {
      if (!obj || typeof obj !== "object") {
        throw new TypeError("argument obj is required");
      }
      var parameters = obj.parameters;
      var type = obj.type;
      if (!type || !TYPE_REGEXP.test(type)) {
        throw new TypeError("invalid type");
      }
      var string = type;
      if (parameters && typeof parameters === "object") {
        var param;
        var params = Object.keys(parameters).sort();
        for (var i = 0; i < params.length; i++) {
          param = params[i];
          if (!TOKEN_REGEXP.test(param)) {
            throw new TypeError("invalid parameter name");
          }
          string += "; " + param + "=" + qstring(parameters[param]);
        }
      }
      return string;
    }
    function parse(string) {
      if (!string) {
        throw new TypeError("argument string is required");
      }
      var header = typeof string === "object" ? getcontenttype(string) : string;
      if (typeof header !== "string") {
        throw new TypeError("argument string is required to be a string");
      }
      var index = header.indexOf(";");
      var type = index !== -1 ? header.slice(0, index).trim() : header.trim();
      if (!TYPE_REGEXP.test(type)) {
        throw new TypeError("invalid media type");
      }
      var obj = new ContentType(type.toLowerCase());
      if (index !== -1) {
        var key;
        var match;
        var value;
        PARAM_REGEXP.lastIndex = index;
        while (match = PARAM_REGEXP.exec(header)) {
          if (match.index !== index) {
            throw new TypeError("invalid parameter format");
          }
          index += match[0].length;
          key = match[1].toLowerCase();
          value = match[2];
          if (value.charCodeAt(0) === 34) {
            value = value.slice(1, -1);
            if (value.indexOf("\\") !== -1) {
              value = value.replace(QESC_REGEXP, "$1");
            }
          }
          obj.parameters[key] = value;
        }
        if (index !== header.length) {
          throw new TypeError("invalid parameter format");
        }
      }
      return obj;
    }
    function getcontenttype(obj) {
      var header;
      if (typeof obj.getHeader === "function") {
        header = obj.getHeader("content-type");
      } else if (typeof obj.headers === "object") {
        header = obj.headers && obj.headers["content-type"];
      }
      if (typeof header !== "string") {
        throw new TypeError("content-type header is missing from object");
      }
      return header;
    }
    function qstring(val) {
      var str = String(val);
      if (TOKEN_REGEXP.test(str)) {
        return str;
      }
      if (str.length > 0 && !TEXT_REGEXP.test(str)) {
        throw new TypeError("invalid parameter value");
      }
      return '"' + str.replace(QUOTE_REGEXP, "\\$1") + '"';
    }
    function ContentType(type) {
      this.parameters = /* @__PURE__ */ Object.create(null);
      this.type = type;
    }
  }
});

// node_modules/gibma/build/main.js
var require_main = __commonJS({
  "node_modules/gibma/build/main.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.request = void 0;
    var url_1 = require("url");
    var http_1 = require("http");
    var https_1 = require("https");
    var content_type_1 = require_content_type();
    async function request2(url, options) {
      if (!(url instanceof url_1.URL)) {
        url = new url_1.URL(url);
      }
      return new Promise((resolve, reject) => {
        options = options || {};
        options.headers = options.headers || {};
        if (!options.headers["User-Agent"]) {
          options.headers["User-Agent"] = `NodeJS/${process.version}`;
        }
        const requestFn = url.protocol === "http:" ? http_1.request : https_1.request;
        const req = requestFn(url, options || {});
        req.on("response", (res) => {
          let chunk = Buffer.from("");
          res.on("data", (data) => {
            chunk = Buffer.concat([chunk, data]);
          });
          res.on("end", () => {
            res.data = chunk;
            resolve(res);
          });
          res.json = () => {
            if (res.data === void 0) {
              return null;
            }
            try {
              const contentType = (0, content_type_1.parse)(res);
              if (contentType.type === "application/json") {
                try {
                  return JSON.parse(res.data.toString());
                } catch (e) {
                  throw new Error(`JSON could not be parsed (${e}). Original data: ${res.data}`);
                }
              }
            } catch (e) {
              console.info(`Content type is missing in response. (${url})`, e);
            }
          };
        });
        req.on("error", (err) => {
          reject(err);
        });
        if (options === null || options === void 0 ? void 0 : options.data) {
          if (typeof options.data === "object") {
            req.setHeader("content-type", "application/json");
            req.write(JSON.stringify(options.data));
          } else {
            req.write(options.data);
          }
        }
        req.end();
      });
    }
    exports2.request = request2;
  }
});

// src/atlas-cache-handler.ts
var import_gibma = __toESM(require_main());
var import_file_system_cache = __toESM(require("next/dist/server/lib/incremental-cache/file-system-cache"));
module.exports = class CacheHandler extends import_file_system_cache.default {
  constructor(options) {
    super(options);
    this.kvStoreURL = process.env.ATLAS_CACHE_URL ?? "http://localhost:8083/kv";
    console.log("OPTIONS: ", options);
  }
  async get(key) {
    console.time("get");
    key = key.replace(/^\/+/g, "");
    key = this.getKey("cache/" + key);
    console.log(`GET: ${key}`);
    try {
      const response = await (0, import_gibma.request)(`${this.kvStoreURL}/${key}`, {
        method: "GET"
      });
      console.timeEnd("get");
      return response.data;
    } catch (error) {
      console.log("fallback");
      const fallback = super.get(...arguments);
      console.timeEnd("get");
      return fallback;
    }
  }
  async set(key, data, ctx) {
    console.time("set");
    const payload = {
      value: data,
      lastModified: Date.now()
    };
    key = key.replace(/^\/+/g, "");
    key = this.getKey("cache/" + key);
    console.log(`SET: ${key}`, payload);
    await super.set(...arguments);
    console.timeLog("set");
    try {
      await (0, import_gibma.request)(`${this.kvStoreURL}/${key}`, {
        method: "PUT",
        data: payload
      });
    } catch (error) {
      console.error(error);
    }
    console.timeEnd("set");
  }
  async revalidateTag(tag) {
    console.log(`REVALIDATE TAG: ${tag}`);
    await super.revalidateTag(...arguments);
  }
  getKey(key, prefix) {
    key = key.replace(/^\/+/g, "");
    const envID = process.env.ATLAS_METADATA_ENV_ID ?? "envid";
    const buildID = process.env.ATLAS_METADATA_BUILD_ID ?? "buildid";
    if (prefix != null) {
      key = `${prefix}/key`;
    }
    return `${envID}/${buildID}/${key}`;
  }
};
/*! Bundled license information:

content-type/index.js:
  (*!
   * content-type
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
