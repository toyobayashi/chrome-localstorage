const { openLocalStorageDatabase } = require('./util.js')
const { createLocalStorage, Storage } = require('./Storage.js')

exports.openLocalStorageDatabase = openLocalStorageDatabase
exports.createLocalStorage = createLocalStorage
exports.Storage = Storage
