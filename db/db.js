const { open } = require('sqlite')
const { Database } = require('sqlite3').verbose()
const { sha256 } = require('../utils/utils')

async function connect (callback) {
  let result
  try {
    const db = await open({
      filename: './db/zyvo.db',
      driver: Database
    })
    result = await callback(db)
  } catch (error) {
    console.log(error)
  }

  return result
};

async function initDb () {
  return connect(async db => {
    await db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, user TEXT, password TEXT, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS extensions (id INTEGER PRIMARY KEY, name TEXT, extension NUMBER, secret TEXT, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS trunks (id INTEGER PRIMARY KEY, name TEXT, type TEXT, context TEXT, host TEXT, port TEXT, secret TEXT, user TEXT, qualify TEXT, canreinvite TEXT, insecure TEXT, codecs TEXT, gateway_extension TEXT, gateway_extension_secret TEXT, default_action TEXT, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS queues (id INTEGER PRIMARY KEY, name TEXT, musicclass TEXT, strategy TEXT, timeout TEXT, wrapuptime TEXT, autopause TEXT, members TEXT, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS ivr (id INTEGER PRIMARY KEY, name TEXT, context TEXT, timeout TEXT, greeting_audio TEXT, prompt_audio TEXT, invalid_audio TEXT, timeout_audio TEXT,default_extension TEXT, menumap TEXT, isDefault INTEGER, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY, asterisk_stats TEXT, zyvo_stats TEXT, created_at datetime default current_timestamp)')

    const users = await db.all('SELECT * FROM users')
    if (users.length === 0) {
      const password = await sha256('unwinddaftpuffin')
      await db.run('INSERT INTO users (user, password) VALUES (?, ?)', 'admin', password)
    }
  })
}

module.exports = {
  initDb,
  connect
}
