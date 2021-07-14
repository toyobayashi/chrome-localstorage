const util = require('util')

const LevelDOWN = require('leveldown')

/**
 * @param {string} location 
 * @returns {import('./leveldb').LevelDownPromisify}
 */
function level (location) {
  /** @type {import('./leveldb').LevelDownPromisify} */
  const db = new LevelDOWN(location)

  // promisify API
  db.open = util.promisify(db.open)
  db.close = util.promisify(db.close)
  db.put = util.promisify(db.put)
  db.del = util.promisify(db.del)
  db.get = util.promisify(db.get)
  db.batch = util.promisify(db.batch)
  db.clear = util.promisify(db.clear)
  db.approximateSize = util.promisify(db.approximateSize)
  db.compactRange = util.promisify(db.compactRange)

  // ES6 Iteration protocols
  const originalIteratorMethod = db.iterator
  db.iterator = function iterator (...args) {
    const it = originalIteratorMethod.call(this, ...args)
    // iterator protocol
    const originalNextMethod = it.next
    originalNextMethod[util.promisify.custom] = function () {
      return new Promise((resolve, reject) => {
        originalNextMethod.call(this, (err, key, value) => {
          if (err) {
            return reject(err)
          }
          if (key != null) {
            return resolve({
              done: false,
              value: {
                key: key,
                value: value
              }
            })
          }
          return resolve({ done: true })
        })
      })
    }
  
    it.next = util.promisify(originalNextMethod)
    // iterable protocol
    it[Symbol.asyncIterator] = function () { return this }

    it.end = util.promisify(it.end)
    return it
  }
  return db
}

Object.defineProperty(exports, '__esModule', { value: true })
module.exports.default = level
