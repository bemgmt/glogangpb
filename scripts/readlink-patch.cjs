const fs = require("fs")

function normalizeReadlinkError(error) {
  if (error && error.code === "EISDIR") {
    error.code = "EINVAL"
  }
  return error
}

function patchReadlinkApis(target) {
  if (!target) return

  if (typeof target.readlinkSync === "function") {
    const readlinkSyncOriginal = target.readlinkSync.bind(target)
    target.readlinkSync = function patchedReadlinkSync(path, options) {
      try {
        return readlinkSyncOriginal(path, options)
      } catch (error) {
        throw normalizeReadlinkError(error)
      }
    }
  }

  if (typeof target.readlink === "function") {
    const readlinkOriginal = target.readlink.bind(target)
    target.readlink = function patchedReadlink(path, options, callback) {
      if (typeof options === "function") {
        callback = options
        options = undefined
      }

      if (typeof callback !== "function") {
        return readlinkOriginal(path, options)
      }

      return readlinkOriginal(path, options, (error, linkString) => {
        callback(normalizeReadlinkError(error), linkString)
      })
    }
  }

  if (target.promises && typeof target.promises.readlink === "function") {
    const promisesReadlinkOriginal = target.promises.readlink.bind(target.promises)
    target.promises.readlink = async function patchedPromisesReadlink(path, options) {
      try {
        return await promisesReadlinkOriginal(path, options)
      } catch (error) {
        throw normalizeReadlinkError(error)
      }
    }
  }
}

patchReadlinkApis(fs)

try {
  const gracefulFs = require("graceful-fs")
  patchReadlinkApis(gracefulFs)
} catch {}
