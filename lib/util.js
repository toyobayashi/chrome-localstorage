const path = require('path')
const os = require('os')
const level = require('./leveldb').default

/**
 * @param {string} str 
 * @returns {boolean}
 */
function isLatin1 (str) {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 0xff) return false
  }
  return true
}

/**
 * @param {string} str 
 * @returns {Buffer}
 */
function makeStringBuffer (str) {
  if (isLatin1(str)) {
    return Buffer.concat([Buffer.from([0x01]), Buffer.from(str, 'latin1')])
  }
  return Buffer.concat([Buffer.from([0x00]), Buffer.from(str, 'ucs2')])
}

/**
 * @param {Buffer} buf 
 * @returns {string}
 */
function getStringValue (buf) {
  return buf[0] === 0x01 ? buf.slice(1).toString('latin1') : buf.slice(1).toString('utf16le')
}

/**
 * @returns {string}
 */
function getLocalStorageDatabaseLocation () {
  if (process.platform === 'win32') {
    return path.join(os.homedir(), 'AppData/Local/Google/Chrome/User Data/Default/Local Storage/leveldb')
  } 
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library/Application Support/Google/Chrome/Default/Local Storage/leveldb')
  }
  if (process.platform === 'linux') {
    return path.join(os.homedir(), '.config/google-chrome/Default/Local Storage/leveldb')
  }
  throw new Error(`${process.platform} is not supported`)
}

/**
 * @returns {Promise<import('./leveldb').LevelDownPromisify>}
 */
async function openLocalStorageDatabase () {
  const location = getLocalStorageDatabaseLocation()
  const db = level(location)
  await db.open()
  return db
}

exports.makeStringBuffer = makeStringBuffer
exports.getStringValue = getStringValue
exports.openLocalStorageDatabase = openLocalStorageDatabase
