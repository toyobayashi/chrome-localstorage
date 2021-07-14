(async function main (argc, argv) {
  const { openLocalStorageDatabase, createLocalStorage } = require('..')

  const db = await openLocalStorageDatabase()
  const storage = await createLocalStorage(db, 'http://127.0.0.1:8085')
  const v = await storage.getItem('leveldb测试')
  console.log('leveldb测试: ', v)
  await storage.clear()
  console.log('length: ', storage.length)
  await storage.setItem('leveldb测试', '八八九aaa')
  console.log('length: ', storage.length)
  console.log(storage)
  await storage.removeItem('leveldbtest')
  console.log('length: ', storage.length)
  await db.close()
})(process.argv.length - 1, process.argv.slice(1))
