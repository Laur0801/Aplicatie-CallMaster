const { open } = require('sqlite')
const { Database } = require('sqlite3').verbose()

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
    await db.exec('CREATE TABLE IF NOT EXISTS extensions (id INTEGER PRIMARY KEY, name TEXT, extension NUMBER, secret TEXT, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS trunks (id INTEGER PRIMARY KEY, name TEXT, type TEXT, context TEXT, host TEXT, port TEXT, secret TEXT, user TEXT, qualify TEXT, canreinvite TEXT, insecure TEXT, codecs TEXT, isDefault INTEGER, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS queues (id INTEGER PRIMARY KEY, name TEXT, musicclass TEXT, strategy TEXT, timeout TEXT, wrapuptime TEXT, autopause TEXT, members TEXT, created_at datetime default current_timestamp)')
    await db.exec('CREATE TABLE IF NOT EXISTS ivr (id INTEGER PRIMARY KEY, name TEXT, context TEXT, timeout TEXT, greeting_audio TEXT, prompt_audio TEXT, invalid_audio TEXT, timeout_audio TEXT,default_extension TEXT, menumap TEXT, isDefault INTEGER, created_at datetime default current_timestamp)')
  })
}

module.exports = {
  initDb,
  connect
}
