const { makeStringBuffer, getStringValue } = require('./util.js')

// private fields

/** @type {WeakMap<Storage, string>} */
const _origin = new WeakMap()
/** @type {WeakMap<Storage, import('./leveldb').LevelDownPromisify>} */
const _db = new WeakMap()

class Storage {
  /**
   * @param {import('./leveldb').LevelDownPromisify} db
   * @param {string} origin
   */
  constructor (db, origin) {
    _origin.set(this, origin)
    _db.set(this, db)
  }

  /**
   * @param {string} key
   * @returns {Promise<string | null>}
   */
  async getItem (key) {
    const dbkey = Buffer.concat([Buffer.from(`_${_origin.get(this)}`, 'latin1'), Buffer.from([0x00]), makeStringBuffer(key)])
    let dbvalue
    try {
      dbvalue = await _db.get(this).get(dbkey)
    } catch (err) {
      if (/NotFound/.test(err.message)) {
        return null
      }
      throw err
    }
    const value = getStringValue(dbvalue)
    if (value !== this[key]) {
      this[key] = value
    }
    return this[key]
  }

  /**
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async setItem (key, value) {
    const dbkey = Buffer.concat([Buffer.from(`_${_origin.get(this)}`, 'latin1'), Buffer.from([0x00]), makeStringBuffer(key)])
    const dbvalue = makeStringBuffer(String(value))
    await _db.get(this).put(dbkey, dbvalue, { sync: true })
    this[key] = value
  }

  /**
   * @param {string} key
   * @returns {Promise<void>}
   */
  async removeItem (key) {
    const dbkey = Buffer.concat([Buffer.from(`_${_origin.get(this)}`, 'latin1'), Buffer.from([0x00]), makeStringBuffer(key)])
    await _db.get(this).del(dbkey, { sync: true })
    delete this[key]
  }

  /**
   * @returns {Promise<void>}
   */
  async clear () {
    const keys = Object.keys(this)
    const operations = keys.map(k => ({
      type: 'del',
      key: Buffer.concat([Buffer.from(`_${_origin.get(this)}`, 'latin1'), Buffer.from([0x00]), makeStringBuffer(k)])
    }))
    console.log(operations)
    await _db.get(this).batch(operations, { sync: true })
    keys.forEach(k => { delete this[k] })
  }

  /**
   * @param {number} arg0
   * @returns {string | null}
   */
  key (arg0) {
    if (arguments.length !== 1) {
      throw new TypeError(`Failed to execute 'key' on 'Storage': 1 argument required, but only 0 present.`)
    }
    let index = Number(arg0)
    index = Number.isNaN(index) ? 0 : index
    const k = Object.keys(this)[index]
    return k != null ? k : null
  }

  get length () {
    return Object.keys(this).length
  }

  get [Symbol.toStringTag] () {
    return 'Storage'
  }
}

/**
 * @param {import('./leveldb').LevelDownPromisify} db 
 * @param {string} origin 
 * @returns {Storage}
 */
async function createLocalStorage (db, origin = '') {
  if (origin.indexOf('://') === -1) {
    throw new Error('Invalid origin')
  }
  const it = db.iterator({
    gte: `_${origin}`,
    lt: `_${origin}~`,
    keyAsBuffer: true,
    valueAsBuffer: true
  })
  const storage = new Storage(db, origin)
  for await (const record of it) {
    const key = getStringValue(record.key.slice(Array.prototype.indexOf.call(record.key, 0x00) + 1))
    storage[key] = getStringValue(record.value)
  }
  await it.end()
  return storage
}

exports.Storage = Storage
exports.createLocalStorage = createLocalStorage
